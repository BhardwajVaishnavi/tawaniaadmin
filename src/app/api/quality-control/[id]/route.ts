import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(
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

    const qualityControlId = params.id;

    // Get quality control details
    const qualityControl = await prisma.qualityControl.findUnique({
      where: {
        id: qualityControlId,
      },
      include: {
        warehouse: true,
        inspectedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            orderNumber: true,
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        return: {
          select: {
            id: true,
            returnNumber: true,
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!qualityControl) {
      return NextResponse.json(
        { error: "Quality control not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(qualityControl);
  } catch (error) {
    console.error("Error fetching quality control:", error);
    return NextResponse.json(
      { error: "Failed to fetch quality control" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const qualityControlId = params.id;
    const data = await req.json();
    
    // Check if quality control exists
    const existingQC = await prisma.qualityControl.findUnique({
      where: {
        id: qualityControlId,
      },
      include: {
        items: true,
      },
    });

    if (!existingQC) {
      return NextResponse.json(
        { error: "Quality control not found" },
        { status: 404 }
      );
    }

    // Extract data
    const { 
      status,
      notes,
      items = [],
    } = data;

    // Update quality control
    const updatedQC = await prisma.qualityControl.update({
      where: {
        id: qualityControlId,
      },
      data: {
        status: status || existingQC.status,
        notes: notes !== undefined ? notes : existingQC.notes,
        completedDate: status === "COMPLETED" ? new Date() : existingQC.completedDate,
      },
      include: {
        items: true,
      },
    });

    // Update items if provided
    if (items.length > 0) {
      await Promise.all(
        items.map(async (item: any) => {
          return prisma.qualityControlItem.update({
            where: {
              id: item.id,
            },
            data: {
              passedQuantity: item.passedQuantity,
              failedQuantity: item.failedQuantity,
              pendingQuantity: item.pendingQuantity,
              status: item.status,
              reason: item.reason,
              action: item.action,
              notes: item.notes,
            },
          });
        })
      );
    }

    // Create audit log
    await createAuditLog({
      entityType: "QualityControl",
      entityId: qualityControlId,
      action: "UPDATE",
      details: {
        status,
        itemsUpdated: items.length,
      },
    });

    // If completed, update inventory based on QC results
    if (status === "COMPLETED" && existingQC.status !== "COMPLETED") {
      await handleQualityControlCompletion(qualityControlId);
    }

    return NextResponse.json({
      qualityControl: await prisma.qualityControl.findUnique({
        where: {
          id: qualityControlId,
        },
        include: {
          warehouse: true,
          inspectedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
    });
  } catch (error) {
    console.error("Error updating quality control:", error);
    return NextResponse.json(
      { error: "Failed to update quality control" },
      { status: 500 }
    );
  }
}

async function handleQualityControlCompletion(qualityControlId: string) {
  // Get quality control with items
  const qc = await prisma.qualityControl.findUnique({
    where: {
      id: qualityControlId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      purchaseOrder: true,
      return: true,
    },
  });

  if (!qc) return;

  // Process based on QC type
  if (qc.type === "RECEIVING" && qc.purchaseOrderId) {
    // For receiving QC, add passed items to inventory
    for (const item of qc.items) {
      if (item.passedQuantity > 0) {
        // Check if inventory item exists
        const existingInventory = await prisma.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            warehouseId: qc.warehouseId,
          },
        });

        if (existingInventory) {
          // Update existing inventory
          await prisma.inventoryItem.update({
            where: {
              id: existingInventory.id,
            },
            data: {
              quantity: {
                increment: item.passedQuantity,
              },
            },
          });

          // Create audit log
          await createAuditLog({
            entityType: "InventoryItem",
            entityId: existingInventory.id,
            action: "ADJUSTMENT",
            details: {
              type: "QC_PASSED",
              qualityControlId: qc.id,
              productId: item.productId,
              quantity: item.passedQuantity,
              previousQuantity: existingInventory.quantity,
              newQuantity: existingInventory.quantity + item.passedQuantity,
            },
          });
        } else {
          // Create new inventory item
          const newInventory = await prisma.inventoryItem.create({
            data: {
              productId: item.productId,
              warehouseId: qc.warehouseId,
              quantity: item.passedQuantity,
              costPrice: item.product.costPrice,
              retailPrice: item.product.retailPrice,
              status: "AVAILABLE",
              inventoryMethod: "FIFO",
              receivedDate: new Date(),
            },
          });

          // Create audit log
          await createAuditLog({
            entityType: "InventoryItem",
            entityId: newInventory.id,
            action: "CREATE",
            details: {
              type: "QC_PASSED",
              qualityControlId: qc.id,
              productId: item.productId,
              quantity: item.passedQuantity,
            },
          });
        }
      }

      // Update purchase order item received quantity
      if (qc.purchaseOrderId) {
        const poItem = await prisma.purchaseOrderItem.findFirst({
          where: {
            purchaseOrderId: qc.purchaseOrderId,
            productId: item.productId,
          },
        });

        if (poItem) {
          await prisma.purchaseOrderItem.update({
            where: {
              id: poItem.id,
            },
            data: {
              receivedQuantity: {
                increment: item.passedQuantity,
              },
            },
          });
        }
      }
    }

    // Update purchase order status if all items received
    if (qc.purchaseOrderId) {
      const poItems = await prisma.purchaseOrderItem.findMany({
        where: {
          purchaseOrderId: qc.purchaseOrderId,
        },
      });

      const allItemsReceived = poItems.every(item => item.receivedQuantity >= item.quantity);
      const partiallyReceived = poItems.some(item => item.receivedQuantity > 0);

      if (allItemsReceived) {
        await prisma.purchaseOrder.update({
          where: {
            id: qc.purchaseOrderId,
          },
          data: {
            status: "RECEIVED",
          },
        });
      } else if (partiallyReceived) {
        await prisma.purchaseOrder.update({
          where: {
            id: qc.purchaseOrderId,
          },
          data: {
            status: "PARTIALLY_RECEIVED",
          },
        });
      }
    }
  } else if (qc.type === "RETURN" && qc.returnId) {
    // For return QC, process return items
    for (const item of qc.items) {
      if (item.passedQuantity > 0 && item.action === "ACCEPT") {
        // Check if inventory item exists
        const existingInventory = await prisma.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            warehouseId: qc.warehouseId,
          },
        });

        if (existingInventory) {
          // Update existing inventory
          await prisma.inventoryItem.update({
            where: {
              id: existingInventory.id,
            },
            data: {
              quantity: {
                increment: item.passedQuantity,
              },
            },
          });

          // Create audit log
          await createAuditLog({
            entityType: "InventoryItem",
            entityId: existingInventory.id,
            action: "ADJUSTMENT",
            details: {
              type: "RETURN_ACCEPTED",
              qualityControlId: qc.id,
              returnId: qc.returnId,
              productId: item.productId,
              quantity: item.passedQuantity,
              previousQuantity: existingInventory.quantity,
              newQuantity: existingInventory.quantity + item.passedQuantity,
            },
          });
        } else {
          // Create new inventory item
          const newInventory = await prisma.inventoryItem.create({
            data: {
              productId: item.productId,
              warehouseId: qc.warehouseId,
              quantity: item.passedQuantity,
              costPrice: item.product.costPrice,
              retailPrice: item.product.retailPrice,
              status: "AVAILABLE",
              inventoryMethod: "FIFO",
              receivedDate: new Date(),
            },
          });

          // Create audit log
          await createAuditLog({
            entityType: "InventoryItem",
            entityId: newInventory.id,
            action: "CREATE",
            details: {
              type: "RETURN_ACCEPTED",
              qualityControlId: qc.id,
              returnId: qc.returnId,
              productId: item.productId,
              quantity: item.passedQuantity,
            },
          });
        }
      }
    }

    // Update return status
    if (qc.returnId) {
      await prisma.return.update({
        where: {
          id: qc.returnId,
        },
        data: {
          status: "COMPLETED",
        },
      });
    }
  }
}
