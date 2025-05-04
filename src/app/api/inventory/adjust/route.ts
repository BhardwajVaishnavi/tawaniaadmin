import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

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
      warehouseId, 
      productId, 
      adjustmentType, 
      quantity, 
      reason, 
      notes 
    } = data;

    // Validate required fields
    if (!warehouseId || !productId || !adjustmentType || quantity <= 0 || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current inventory item
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        warehouseId,
        productId,
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
        status: newQuantity > 0 ? "AVAILABLE" : "EXPIRED",
      },
    });

    // Create inventory transaction record
    let inventoryTransaction;
    try {
      inventoryTransaction = await prisma.$queryRaw`
        INSERT INTO "InventoryTransaction" (
          "id", 
          "inventoryItemId", 
          "transactionType", 
          "quantity", 
          "previousQuantity", 
          "newQuantity", 
          "reason", 
          "notes", 
          "createdById", 
          "createdAt", 
          "updatedAt"
        ) VALUES (
          ${randomUUID()}, 
          ${inventoryItem.id}, 
          ${adjustmentType.toUpperCase()}, 
          ${quantity}, 
          ${inventoryItem.quantity}, 
          ${newQuantity}, 
          ${reason.toUpperCase()}, 
          ${notes || null}, 
          ${session.user.id}, 
          ${new Date()}, 
          ${new Date()}
        ) RETURNING *
      `;
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      // Continue with the process even if transaction creation fails
    }

    return NextResponse.json({
      inventoryItem: updatedInventoryItem,
      transaction: inventoryTransaction,
    });
  } catch (error) {
    console.error("Error adjusting inventory:", error);
    return NextResponse.json(
      { error: "Failed to adjust inventory" },
      { status: 500 }
    );
  }
}



