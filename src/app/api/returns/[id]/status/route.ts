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

    const returnId = params.id;
    const data = await req.json();
    const { status, notes, userId } = data;

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Check if return exists
    const returnData = await prisma.return.findUnique({
      where: { id: returnId },
    });

    if (!returnData) {
      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      );
    }

    // Update return status
    const updateData: any = {
      status,
      notes: notes || returnData.notes,
    };

    // Update refund status based on return status
    if (status === "APPROVED") {
      updateData.refundStatus = "PENDING";
    } else if (status === "COMPLETED") {
      updateData.refundStatus = "PROCESSED";
    } else if (status === "REJECTED") {
      updateData.refundStatus = "REJECTED";
    }

    // Update return
    const updatedReturn = await prisma.return.update({
      where: { id: returnId },
      data: updateData,
      include: {
        store: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If status is COMPLETED, update inventory
    if (status === "COMPLETED") {
      // Process each return item
      for (const item of updatedReturn.items) {
        // Get the product's inventory in the store
        const inventoryItem = await prisma.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            storeId: updatedReturn.storeId,
          },
        });

        if (inventoryItem) {
          // Decrease inventory quantity
          await prisma.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });

          // Create inventory transaction record
          await prisma.inventoryTransaction.create({
            data: {
              type: "RETURN",
              quantity: -item.quantity,
              inventoryItemId: inventoryItem.id,
              productId: item.productId,
              storeId: updatedReturn.storeId,
              referenceId: returnId,
              referenceType: "RETURN",
              notes: `Return #${updatedReturn.returnNumber}`,
              createdById: userId || session.user.id,
            },
          });
        }
      }
    }

    // Create audit log
    await createAuditLog({
      entityType: 'Return',
      entityId: returnId,
      action: 'UPDATE_STATUS',
      userId: userId || session.user.id,
      details: {
        returnNumber: updatedReturn.returnNumber,
        oldStatus: returnData.status,
        newStatus: status,
        notes,
      },
    });

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error("Error updating return status:", error);
    return NextResponse.json(
      { error: "Failed to update return status" },
      { status: 500 }
    );
  }
}
