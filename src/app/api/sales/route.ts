import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const {
      storeId,
      customerId,
      items,
      paymentMethod,
      notes,
      subtotal,
      taxAmount,
      totalAmount,
    } = body;
    
    // Validate required fields
    if (!storeId || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Start a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Generate receipt number
      const lastSale = await tx.sale.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      
      const receiptNumber = lastSale
        ? `R-${String(parseInt(lastSale.receiptNumber.split('-')[1]) + 1).padStart(6, '0')}`
        : 'R-000001';
      
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          receiptNumber,
          storeId,
          customerId: customerId || null,
          userId: session.user.id,
          paymentMethod,
          paymentStatus: "PAID", // Assuming payment is completed immediately
          notes: notes || null,
          subtotalAmount: subtotal,
          taxAmount,
          totalAmount,
          items: {
            create: items.map((item: any) => ({
              inventoryItemId: item.inventoryItemId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });
      
      // Update inventory quantities
      for (const item of items) {
        // Reduce inventory quantity
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
        
        // Create inventory transaction record
        await tx.inventoryTransaction.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            productId: item.productId,
            transactionType: "SALE",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            notes: `Sale: ${receiptNumber}`,
            userId: session.user.id,
          },
        });
      }
      
      // Update customer loyalty points if customer exists
      if (customerId) {
        const pointsEarned = Math.floor(totalAmount); // 1 point per dollar
        
        await tx.customer.update({
          where: { id: customerId },
          data: {
            loyaltyPoints: {
              increment: pointsEarned,
            },
          },
        });
        
        // Create loyalty transaction
        await tx.loyaltyTransaction.create({
          data: {
            customerId,
            points: pointsEarned,
            transactionType: "EARN",
            saleId: newSale.id,
            notes: `Points earned from sale ${receiptNumber}`,
          },
        });
      }
      
      return newSale;
    });
    
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { message: "Failed to create sale", error: (error as Error).message },
      { status: 500 }
    );
  }
}
