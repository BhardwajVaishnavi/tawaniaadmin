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
    const warehouseId = searchParams.get("warehouseId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (warehouseId) {
      filter.warehouseId = warehouseId;
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    // Get quality controls with pagination
    const [qualityControls, totalItems] = await Promise.all([
      prisma.qualityControl.findMany({
        where: filter,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.qualityControl.count({
        where: filter,
      }),
    ]);

    return NextResponse.json({
      qualityControls,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    console.error("Error fetching quality controls:", error);
    return NextResponse.json(
      { error: "Failed to fetch quality controls" },
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
      type, 
      warehouseId, 
      purchaseOrderId, 
      returnId, 
      notes, 
      items 
    } = data;

    // Validate required fields
    if (!type || !warehouseId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate reference number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    const count = await prisma.qualityControl.count({
      where: {
        createdAt: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
    });
    
    const sequence = (count + 1).toString().padStart(3, "0");
    const referenceNumber = `QC-${year}${month}${day}-${sequence}`;

    // Create quality control with items
    const qualityControl = await prisma.qualityControl.create({
      data: {
        referenceNumber,
        type,
        status: "PENDING",
        warehouseId,
        purchaseOrderId: purchaseOrderId || null,
        returnId: returnId || null,
        inspectionDate: new Date(),
        inspectedById: session.user.id,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            passedQuantity: item.passedQuantity || 0,
            failedQuantity: item.failedQuantity || 0,
            pendingQuantity: item.pendingQuantity || item.quantity,
            status: item.status || "PENDING",
            reason: item.reason || null,
            action: item.action || null,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        warehouse: true,
        inspectedBy: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      entityType: "QualityControl",
      entityId: qualityControl.id,
      action: "CREATE",
      details: {
        referenceNumber,
        type,
        warehouseId,
        purchaseOrderId: purchaseOrderId || null,
        returnId: returnId || null,
        itemCount: items.length,
      },
    });

    return NextResponse.json(qualityControl);
  } catch (error) {
    console.error("Error creating quality control:", error);
    return NextResponse.json(
      { error: "Failed to create quality control" },
      { status: 500 }
    );
  }
}
