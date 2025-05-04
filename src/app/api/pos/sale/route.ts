import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface SaleItem {
  inventoryItemId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

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
      taxRateId,
      taxRate,
      subtotalAmount,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      amountPaid,
      referenceNumber,
      notes,
    } = body;

    // Validate required fields
    if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate receipt number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const prefix = `S${year}${month}${day}`;

    // Get the count of sales for today
    const salesCount = await prisma.sale.count({
      where: {
        receiptNumber: {
          startsWith: prefix,
        },
      },
    });

    // Generate the receipt number with a sequential number
    const sequentialNumber = (salesCount + 1).toString().padStart(4, "0");
    const receiptNumber = `${prefix}-${sequentialNumber}`;

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the sale record
      const sale = await tx.sale.create({
        data: {
          receiptNumber,
          storeId,
          customerId,
          createdById: session.user.id,
          subtotal: subtotalAmount,
          taxAmount,
          totalAmount,
          paymentMethod,
          paymentStatus,
          notes,
        },
      });

      // Process each item in the sale
      for (const item of items) {
        // Get the inventory item
        const inventoryItem = await tx.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
          include: {
            product: true,
          },
        });

        if (!inventoryItem) {
          throw new Error(`Inventory item not found: ${item.inventoryItemId}`);
        }

        // Check if there's enough quantity
        const availableQuantity = inventoryItem.quantity - inventoryItem.reservedQuantity;
        if (availableQuantity < item.quantity) {
          throw new Error(`Not enough quantity available for ${inventoryItem.product.name}. Available: ${availableQuantity}, Requested: ${item.quantity}`);
        }

        // Calculate total price
        const totalPrice = item.quantity * item.unitPrice * (1 - item.discount / 100);

        // Create sale item record
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            inventoryItemId: item.inventoryItemId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            discountAmount: (item.unitPrice * item.quantity * item.discount) / 100,
            taxAmount: 0,
            totalPrice,
          },
        });

        // Update inventory quantity
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        // We've removed the inventory transaction model in our simplified schema
      }

      // Create payment record if amount paid > 0
      if (amountPaid > 0) {
        await tx.payment.create({
          data: {
            saleId: sale.id,
            amount: amountPaid,
            paymentMethod,
            referenceNumber,
            processedById: session.user.id,
            processedByName: session.user.name || undefined,
          },
        });
      }

      return { sale };
    });

    return NextResponse.json({
      message: "Sale completed successfully",
      sale: result.sale,
    });
  } catch (error) {
    console.error("Error processing sale:", error);
    return NextResponse.json(
      { message: "Failed to process sale", error: (error as Error).message },
      { status: 500 }
    );
  }
}
