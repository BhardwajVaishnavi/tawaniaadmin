import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ReceivedItem {
  transferItemId: string;
  productId: string;
  receivedQuantity: number;
  binId?: string | null;
  notes?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const transferId = params.id;
    
    // Parse request body
    const body = await req.json();
    const { receivedItems, notes } = body;
    
    // Validate required fields
    if (!receivedItems || !Array.isArray(receivedItems)) {
      return NextResponse.json(
        { message: "Missing or invalid receivedItems" },
        { status: 400 }
      );
    }
    
    // Get the transfer
    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        items: true,
      },
    });
    
    if (!transfer) {
      return NextResponse.json(
        { message: "Transfer not found" },
        { status: 404 }
      );
    }
    
    // Check if transfer is in IN_TRANSIT status
    if (transfer.status !== "IN_TRANSIT") {
      return NextResponse.json(
        { message: "Transfer can only be received when in IN_TRANSIT status" },
        { status: 400 }
      );
    }
    
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the transfer status
      const updatedTransfer = await tx.transfer.update({
        where: { id: transferId },
        data: {
          status: "COMPLETED",
          receivedAt: new Date(),
          receivedByUserId: session.user.id,
          receivingNotes: notes || null,
        },
      });
      
      // Process each received item
      for (const receivedItem of receivedItems) {
        const transferItem = transfer.items.find(item => item.id === receivedItem.transferItemId);
        
        if (!transferItem) {
          throw new Error(`Transfer item not found: ${receivedItem.transferItemId}`);
        }
        
        // Update the transfer item with received quantity
        await tx.transferItem.update({
          where: { id: receivedItem.transferItemId },
          data: {
            receivedQuantity: receivedItem.receivedQuantity,
            receivingNotes: receivedItem.notes || null,
          },
        });
        
        // Skip if received quantity is 0
        if (receivedItem.receivedQuantity <= 0) {
          continue;
        }
        
        // Handle based on transfer type
        if (transfer.transferType === "WAREHOUSE_TO_WAREHOUSE" && transfer.destinationWarehouseId) {
          // Check if inventory item already exists at destination
          let destinationInventoryItem = await tx.inventoryItem.findFirst({
            where: {
              productId: receivedItem.productId,
              warehouseId: transfer.destinationWarehouseId,
              binId: receivedItem.binId || null,
            },
          });
          
          if (destinationInventoryItem) {
            // Update existing inventory item
            await tx.inventoryItem.update({
              where: { id: destinationInventoryItem.id },
              data: {
                quantity: {
                  increment: receivedItem.receivedQuantity,
                },
                costPrice: transferItem.costPrice || undefined,
                retailPrice: transferItem.retailPrice || undefined,
              },
            });
            
            // Create inventory transaction (TRANSFER_IN)
            await tx.inventoryTransaction.create({
              data: {
                inventoryItemId: destinationInventoryItem.id,
                productId: receivedItem.productId,
                transactionType: "TRANSFER_IN",
                quantity: receivedItem.receivedQuantity,
                notes: `Transfer in: ${transfer.referenceNumber}`,
                userId: session.user.id,
              },
            });
          } else {
            // Create new inventory item at destination
            const newInventoryItem = await tx.inventoryItem.create({
              data: {
                productId: receivedItem.productId,
                warehouseId: transfer.destinationWarehouseId,
                binId: receivedItem.binId || null,
                quantity: receivedItem.receivedQuantity,
                reservedQuantity: 0,
                costPrice: transferItem.costPrice || undefined,
                retailPrice: transferItem.retailPrice || undefined,
                status: "AVAILABLE",
              },
            });
            
            // Create inventory transaction (TRANSFER_IN)
            await tx.inventoryTransaction.create({
              data: {
                inventoryItemId: newInventoryItem.id,
                productId: receivedItem.productId,
                transactionType: "TRANSFER_IN",
                quantity: receivedItem.receivedQuantity,
                notes: `Transfer in: ${transfer.referenceNumber}`,
                userId: session.user.id,
              },
            });
          }
        } else if (transfer.transferType === "WAREHOUSE_TO_STORE" && transfer.destinationStoreId) {
          // Check if inventory item already exists at destination store
          let destinationInventoryItem = await tx.inventoryItem.findFirst({
            where: {
              productId: receivedItem.productId,
              storeId: transfer.destinationStoreId,
            },
          });
          
          if (destinationInventoryItem) {
            // Update existing inventory item
            await tx.inventoryItem.update({
              where: { id: destinationInventoryItem.id },
              data: {
                quantity: {
                  increment: receivedItem.receivedQuantity,
                },
                costPrice: transferItem.costPrice || undefined,
                retailPrice: transferItem.retailPrice || undefined,
              },
            });
            
            // Create inventory transaction (TRANSFER_IN)
            await tx.inventoryTransaction.create({
              data: {
                inventoryItemId: destinationInventoryItem.id,
                productId: receivedItem.productId,
                transactionType: "TRANSFER_IN",
                quantity: receivedItem.receivedQuantity,
                notes: `Transfer in: ${transfer.referenceNumber}`,
                userId: session.user.id,
              },
            });
          } else {
            // Create new inventory item at destination store
            const newInventoryItem = await tx.inventoryItem.create({
              data: {
                productId: receivedItem.productId,
                storeId: transfer.destinationStoreId,
                quantity: receivedItem.receivedQuantity,
                reservedQuantity: 0,
                costPrice: transferItem.costPrice || undefined,
                retailPrice: transferItem.retailPrice || undefined,
                status: "AVAILABLE",
              },
            });
            
            // Create inventory transaction (TRANSFER_IN)
            await tx.inventoryTransaction.create({
              data: {
                inventoryItemId: newInventoryItem.id,
                productId: receivedItem.productId,
                transactionType: "TRANSFER_IN",
                quantity: receivedItem.receivedQuantity,
                notes: `Transfer in: ${transfer.referenceNumber}`,
                userId: session.user.id,
              },
            });
          }
        }
      }
      
      return updatedTransfer;
    });
    
    return NextResponse.json({
      message: "Transfer received successfully",
      transfer: result,
    });
  } catch (error) {
    console.error("Error receiving transfer:", error);
    return NextResponse.json(
      { message: "Failed to receive transfer", error: (error as Error).message },
      { status: 500 }
    );
  }
}
