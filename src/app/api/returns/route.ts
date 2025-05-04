import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (storeId) {
      filter.storeId = storeId;
    }

    if (customerId) {
      filter.customerId = customerId;
    }

    if (status) {
      filter.status = status;
    }

    // Get returns with pagination
    const [returns, totalItems] = await Promise.all([
      prisma.return.findMany({
        where: filter,
        include: {
          store: true,
          customer: true,
          processedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          sale: {
            select: {
              id: true,
              receiptNumber: true,
              saleDate: true,
            },
          },
          items: {
            include: {
              product: true,
              saleItem: true,
            },
          },
        },
        orderBy: {
          returnDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.return.count({
        where: filter,
      }),
    ]);

    return NextResponse.json({
      returns,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    console.error("Error fetching returns:", error);
    return NextResponse.json(
      { error: "Failed to fetch returns" },
      { status: 500 }
    );
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
      storeId, 
      customerId, 
      saleId, 
      items, 
      reason, 
      notes,
      refundMethod,
    } = data;

    // Validate required fields
    if (!storeId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    let totalAmount = 0;

    items.forEach((item: any) => {
      subtotal += item.unitPrice * item.quantity;
      taxAmount += (item.taxAmount || 0) * item.quantity;
      totalAmount += item.totalPrice;
    });

    // Generate return number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    const count = await prisma.return.count({
      where: {
        returnDate: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
    });
    
    const sequence = (count + 1).toString().padStart(3, "0");
    const returnNumber = `RET-${year}${month}${day}-${sequence}`;

    // Create return with items
    const returnData = await prisma.return.create({
      data: {
        returnNumber,
        storeId,
        customerId: customerId || null,
        saleId: saleId || null,
        returnDate: new Date(),
        status: "PENDING",
        subtotal,
        taxAmount,
        totalAmount,
        refundMethod: refundMethod || null,
        refundStatus: "PENDING",
        reason,
        notes,
        processedById: session.user.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            saleItemId: item.saleItemId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            reason: item.reason,
            condition: item.condition || "GOOD",
            notes: item.notes,
          })),
        },
      },
      include: {
        store: true,
        customer: true,
        processedBy: true,
        sale: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      entityType: "Return",
      entityId: returnData.id,
      action: "CREATE",
      details: {
        returnNumber,
        storeId,
        customerId: customerId || null,
        saleId: saleId || null,
        itemCount: items.length,
        totalAmount,
      },
    });

    return NextResponse.json(returnData);
  } catch (error) {
    console.error("Error creating return:", error);
    return NextResponse.json(
      { error: "Failed to create return" },
      { status: 500 }
    );
  }
}
