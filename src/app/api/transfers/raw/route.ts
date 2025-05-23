import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

// Import the sql tag for safe SQL queries
const { sql } = Prisma;

// Define the debug function to help troubleshoot
function debug(...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Transfer API Debug]', ...args);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const {
      fromWarehouseId,
      toStoreId,
      transferType,
      priority,
      requestedDate,
      expectedDeliveryDate,
      items,
      notes
    } = data;

    debug("Received transfer request:", {
      fromWarehouseId,
      toStoreId,
      transferType,
      priority,
      items: items?.length || 0
    });

    // Validate required fields
    if (!fromWarehouseId || !toStoreId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a transfer number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const transferCount = await prisma.transfer.count() + 1;
    const transferNumber = `TRF-${year}${month}${day}-${String(transferCount).padStart(4, "0")}`;

    // Calculate totals
    let totalItems = 0;
    let totalCost = 0;
    let totalRetail = 0;

    items.forEach((item: any) => {
      totalItems += item.quantity;
      totalCost += (item.sourceCostPrice * item.quantity);
      totalRetail += (item.sourceRetailPrice * item.quantity);
    });

    // Create transfer with items using a transaction
    const transfer = await prisma.$transaction(async (tx) => {
      // 1. Create the transfer
      const newTransfer = await tx.transfer.create({
        data: {
          transferNumber,
          fromWarehouseId,
          toStoreId,
          transferType: transferType || "RESTOCK",
          priority: priority || "NORMAL",
          status: "DRAFT",
          requestedDate: requestedDate ? new Date(requestedDate) : new Date(),
          expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
          notes,
          requestedById: session.user.id,
          totalItems,
          totalCost,
          totalRetail,
        },
      });

      // 2. Create transfer items separately
      for (const item of items) {
        await tx.transferItem.create({
          data: {
            transferId: newTransfer.id,
            productId: item.productId,
            quantity: item.quantity,
            sourceCostPrice: item.sourceCostPrice,
            sourceRetailPrice: item.sourceRetailPrice,
            targetCostPrice: item.targetCostPrice || item.sourceCostPrice,
            targetRetailPrice: item.targetRetailPrice || item.sourceRetailPrice,
            condition: item.condition || "NEW",
            adjustmentReason: item.adjustmentReason || null,
          },
        });
      }

      // 3. Get the complete transfer with items
      return await tx.transfer.findUnique({
        where: { id: newTransfer.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          fromWarehouse: true,
          toStore: true,
        },
      });
    });

    // Create audit log
    try {
      await createAuditLog({
        entityType: 'Transfer',
        entityId: transfer.id,
        action: 'CREATE',
        details: {
          transferNumber: transfer.transferNumber,
          fromWarehouseId,
          toStoreId,
          itemCount: items.length,
          totalItems,
          totalCost,
          totalRetail,
        },
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
      // Continue without failing the transfer creation
    }

    debug("Transfer created successfully:", transfer.id);
    return NextResponse.json(transfer);
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: "Failed to create transfer", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
