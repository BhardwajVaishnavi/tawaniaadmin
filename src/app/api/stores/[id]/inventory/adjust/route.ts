import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    const storeId = params.id;
    const data = await req.json();
    const { 
      productId, 
      adjustmentType, 
      quantity, 
      reason, 
      notes 
    } = data;
    
    // Validate required fields
    if (!productId || !adjustmentType || quantity === undefined || !reason) {
      return NextResponse.json(
        { error: "Product ID, adjustment type, quantity, and reason are required" },
        { status: 400 }
      );
    }
    
    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });
    
    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }
    
    // Check if inventory item exists
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        productId,
        storeId,
      },
    });
    
    if (!inventoryItem) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }
    
    // Calculate new quantity based on adjustment type
    let newQuantity = inventoryItem.quantity;
    
    if (adjustmentType === "add") {
      newQuantity += quantity;
    } else if (adjustmentType === "remove") {
      newQuantity = Math.max(0, newQuantity - quantity);
    } else if (adjustmentType === "set") {
      newQuantity = quantity;
    } else {
      return NextResponse.json(
        { error: "Invalid adjustment type" },
        { status: 400 }
      );
    }
    
    // Update inventory item
    const updatedInventoryItem = await prisma.inventoryItem.update({
      where: {
        id: inventoryItem.id,
      },
      data: {
        quantity: newQuantity,
        status: newQuantity > 0 ? "AVAILABLE" : "OUT_OF_STOCK",
      },
    });
    
    // Create inventory transaction record if the model exists
    try {
      const inventoryTransaction = await prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: inventoryItem.id,
          transactionType: adjustmentType.toUpperCase(),
          quantity,
          previousQuantity: inventoryItem.quantity,
          newQuantity,
          reason: reason.toUpperCase(),
          notes,
          createdById: session.user.id,
        },
      });
      
      return NextResponse.json({
        inventoryItem: updatedInventoryItem,
        transaction: inventoryTransaction,
      });
    } catch (error) {
      // If InventoryTransaction model doesn't exist, just return the updated item
      return NextResponse.json({
        inventoryItem: updatedInventoryItem,
      });
    }
  } catch (error) {
    console.error("Error adjusting store inventory:", error);
    return NextResponse.json(
      { error: "Failed to adjust store inventory" },
      { status: 500 }
    );
  }
}
