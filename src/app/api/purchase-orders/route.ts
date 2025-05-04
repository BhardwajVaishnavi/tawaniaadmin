import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const supplierId = url.searchParams.get("supplier");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    
    // Build filters
    const filters: any = {};
    
    if (supplierId) {
      filters.supplierId = supplierId;
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (search) {
      filters.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    // Get purchase orders with pagination
    const [purchaseOrders, totalItems] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: filters,
        include: {
          supplier: true,
          warehouse: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.purchaseOrder.count({
        where: filters,
      }),
    ]);
    
    return NextResponse.json({
      purchaseOrders,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase orders" },
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
      supplierId, 
      warehouseId, 
      expectedDeliveryDate, 
      notes, 
      items 
    } = data;

    // Validate required fields
    if (!supplierId || !warehouseId || !items || !items.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Calculate totals
    let subtotal = 0;
    let tax = 0;
    let discount = 0;
    
    // Prepare items for creation
    const orderItems = items.map((item: any) => {
      const itemSubtotal = item.unitPrice * item.orderedQuantity;
      const itemTax = (item.tax || 0);
      const itemDiscount = (item.discount || 0);
      const itemTotal = itemSubtotal + itemTax - itemDiscount;
      
      subtotal += itemSubtotal;
      tax += itemTax;
      discount += itemDiscount;
      
      return {
        productId: item.productId,
        description: item.description,
        orderedQuantity: item.orderedQuantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
        subtotal: itemSubtotal,
        total: itemTotal,
        notes: item.notes,
      };
    });
    
    const total = subtotal + tax - discount;

    // Create purchase order
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        warehouseId,
        status: "DRAFT",
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        subtotal,
        totalAmount: total,
        notes,
        createdById: session.user.id,
        items: {
          create: orderItems,
        },
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ purchaseOrder });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { error: "Failed to create purchase order" },
      { status: 500 }
    );
  }
}

// Helper function to generate a unique order number
async function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get count of purchase orders for today
  const todayStart = new Date(date.setHours(0, 0, 0, 0));
  const todayEnd = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await prisma.purchaseOrder.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });
  
  // Format: PO-YYMMDD-XXXX (XXXX is a sequential number)
  const sequentialNumber = (count + 1).toString().padStart(4, '0');
  return `PO-${year}${month}${day}-${sequentialNumber}`;
}







