import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { status, reason } = await req.json();

    // Validate status
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get the current transfer
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
    };

    // Add additional fields based on status
    if (status === "APPROVED") {
      updateData.approvedById = session.user.id;
      updateData.approvedDate = new Date();
    } else if (status === "REJECTED") {
      updateData.rejectedById = session.user.id;
      updateData.rejectedDate = new Date();
      updateData.rejectionReason = reason;
    } else if (status === "COMPLETED") {
      updateData.completedById = session.user.id;
      updateData.completedDate = new Date();
    }

    // Update the transfer
    const updatedTransfer = await prisma.transfer.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        sourceWarehouse: true,
        destinationWarehouse: true,
        sourceStore: true,
        destinationStore: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        rejectedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        completedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If the transfer is completed, update inventory
    if (status === "COMPLETED") {
      await processCompletedTransfer(updatedTransfer, session.user.id);
    }

    // If the transfer is rejected, release reserved inventory
    if (status === "REJECTED") {
      await releaseReservedInventory(transfer);
    }

    // Create audit log
    await createAuditLog({
      entityType: "Transfer",
      entityId: id,
      action: status === "APPROVED" ? "APPROVAL" : 
              status === "REJECTED" ? "REJECTION" : 
              status === "COMPLETED" ? "COMPLETED" : "UPDATE",
      details: {
        status,
        reason,
        userId: session.user.id,
        userName: session.user.name,
      },
    });

    return NextResponse.json(updatedTransfer);
  } catch (error) {
    console.error("Error updating transfer status:", error);
    return NextResponse.json(
      { error: "Failed to update transfer status" },
      { status: 500 }
    );
  }
}

async function processCompletedTransfer(transfer: any, userId: string) {
  // Process each item in the transfer
  for (const item of transfer.items) {
    // Determine source and destination based on transfer type
    let sourceInventoryQuery: any = {};
    let destinationInventoryQuery: any = {};

    if (transfer.sourceWarehouseId) {
      sourceInventoryQuery = {
        productId: item.productId,
        warehouseId: transfer.sourceWarehouseId,
      };
    } else if (transfer.sourceStoreId) {
      sourceInventoryQuery = {
        productId: item.productId,
        storeId: transfer.sourceStoreId,
      };
    }

    if (transfer.destinationWarehouseId) {
      destinationInventoryQuery = {
        productId: item.productId,
        warehouseId: transfer.destinationWarehouseId,
      };
    } else if (transfer.destinationStoreId) {
      destinationInventoryQuery = {
        productId: item.productId,
        storeId: transfer.destinationStoreId,
      };
    }

    // Update source inventory (reduce quantity and release reserved)
    if (Object.keys(sourceInventoryQuery).length > 0) {
      const sourceInventory = await prisma.inventoryItem.findFirst({
        where: sourceInventoryQuery,
      });

      if (sourceInventory) {
        await prisma.inventoryItem.update({
          where: { id: sourceInventory.id },
          data: {
            quantity: {
              decrement: item.requestedQuantity,
            },
            reservedQuantity: {
              decrement: item.requestedQuantity,
            },
          },
        });

        // Log inventory adjustment
        await createAuditLog({
          entityType: "InventoryItem",
          entityId: sourceInventory.id,
          action: "ADJUSTMENT",
          details: {
            type: "TRANSFER_OUT",
            transferId: transfer.id,
            productId: item.productId,
            quantity: -item.requestedQuantity,
            previousQuantity: sourceInventory.quantity,
            newQuantity: sourceInventory.quantity - item.requestedQuantity,
          },
        });
      }
    }

    // Update destination inventory (increase quantity)
    if (Object.keys(destinationInventoryQuery).length > 0) {
      const destinationInventory = await prisma.inventoryItem.findFirst({
        where: destinationInventoryQuery,
      });

      if (destinationInventory) {
        // Update existing inventory
        await prisma.inventoryItem.update({
          where: { id: destinationInventory.id },
          data: {
            quantity: {
              increment: item.requestedQuantity,
            },
            costPrice: item.destinationCostPrice || destinationInventory.costPrice,
            retailPrice: item.destinationRetailPrice || destinationInventory.retailPrice,
          },
        });

        // Log inventory adjustment
        await createAuditLog({
          entityType: "InventoryItem",
          entityId: destinationInventory.id,
          action: "ADJUSTMENT",
          details: {
            type: "TRANSFER_IN",
            transferId: transfer.id,
            productId: item.productId,
            quantity: item.requestedQuantity,
            previousQuantity: destinationInventory.quantity,
            newQuantity: destinationInventory.quantity + item.requestedQuantity,
            previousCostPrice: destinationInventory.costPrice,
            newCostPrice: item.destinationCostPrice || destinationInventory.costPrice,
            previousRetailPrice: destinationInventory.retailPrice,
            newRetailPrice: item.destinationRetailPrice || destinationInventory.retailPrice,
          },
        });
      } else {
        // Create new inventory item
        const newInventory = await prisma.inventoryItem.create({
          data: {
            productId: item.productId,
            ...(transfer.destinationWarehouseId ? { warehouseId: transfer.destinationWarehouseId } : {}),
            ...(transfer.destinationStoreId ? { storeId: transfer.destinationStoreId } : {}),
            quantity: item.requestedQuantity,
            reservedQuantity: 0,
            costPrice: item.destinationCostPrice || item.sourceCostPrice,
            retailPrice: item.destinationRetailPrice || item.sourceRetailPrice,
            status: "AVAILABLE",
          },
        });

        // Log inventory creation
        await createAuditLog({
          entityType: "InventoryItem",
          entityId: newInventory.id,
          action: "CREATE",
          details: {
            type: "TRANSFER_IN",
            transferId: transfer.id,
            productId: item.productId,
            quantity: item.requestedQuantity,
            costPrice: item.destinationCostPrice || item.sourceCostPrice,
            retailPrice: item.destinationRetailPrice || item.sourceRetailPrice,
          },
        });
      }
    }

    // Update transfer item status
    await prisma.transferItem.update({
      where: { id: item.id },
      data: {
        status: "COMPLETED",
        completedQuantity: item.requestedQuantity,
      },
    });
  }
}

async function releaseReservedInventory(transfer: any) {
  // Process each item in the transfer
  for (const item of transfer.items) {
    // Determine source based on transfer type
    let sourceInventoryQuery: any = {};

    if (transfer.sourceWarehouseId) {
      sourceInventoryQuery = {
        productId: item.productId,
        warehouseId: transfer.sourceWarehouseId,
      };
    } else if (transfer.sourceStoreId) {
      sourceInventoryQuery = {
        productId: item.productId,
        storeId: transfer.sourceStoreId,
      };
    }

    // Release reserved quantity
    if (Object.keys(sourceInventoryQuery).length > 0) {
      const sourceInventory = await prisma.inventoryItem.findFirst({
        where: sourceInventoryQuery,
      });

      if (sourceInventory) {
        await prisma.inventoryItem.update({
          where: { id: sourceInventory.id },
          data: {
            reservedQuantity: {
              decrement: item.requestedQuantity,
            },
          },
        });

        // Log inventory adjustment
        await createAuditLog({
          entityType: "InventoryItem",
          entityId: sourceInventory.id,
          action: "ADJUSTMENT",
          details: {
            type: "RELEASE_RESERVED",
            transferId: transfer.id,
            productId: item.productId,
            quantity: item.requestedQuantity,
            previousReservedQuantity: sourceInventory.reservedQuantity,
            newReservedQuantity: sourceInventory.reservedQuantity - item.requestedQuantity,
          },
        });
      }
    }

    // Update transfer item status
    await prisma.transferItem.update({
      where: { id: item.id },
      data: {
        status: "REJECTED",
      },
    });
  }
}
