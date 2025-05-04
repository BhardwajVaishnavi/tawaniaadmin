import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransferType } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";

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

    // Create transfer with items
    const transfer = await prisma.transfer.create({
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
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            sourceCostPrice: item.sourceCostPrice,
            sourceRetailPrice: item.sourceRetailPrice,
            targetCostPrice: item.targetCostPrice || item.sourceCostPrice,
            targetRetailPrice: item.targetRetailPrice || item.sourceRetailPrice,
            condition: item.condition || "NEW",
            adjustmentReason: item.adjustmentReason || null,
          })),
        },
      },
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

    // Create audit log
    await createAuditLog({
      entityType: 'Transfer',
      entityId: transfer.id,
      action: 'CREATE',
      userId: session.user.id,
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

    return NextResponse.json(transfer);
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}

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
    const status = searchParams.get("status");
    const transferType = searchParams.get("transferType");
    const priority = searchParams.get("priority");
    const storeId = searchParams.get("storeId");
    const search = searchParams.get("search");
    const condition = searchParams.get("condition");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Build filter
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (transferType) {
      filter.transferType = transferType;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (storeId) {
      filter.toStoreId = storeId;
    }

    if (condition) {
      filter.items = {
        some: {
          condition: condition
        }
      };
    }

    if (search) {
      filter.OR = [
        { transferNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        {
          items: {
            some: {
              product: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          }
        }
      ];
    }

    // Get transfers with pagination
    const [transfers, totalCount] = await Promise.all([
      prisma.transfer.findMany({
        where: filter,
        include: {
          fromWarehouse: true,
          toWarehouse: true,
          fromStore: true,
          toStore: true,
          items: {
            include: {
              product: true,
            },
          },
          documents: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.transfer.count({
        where: filter,
      }),
    ]);

    return NextResponse.json({
      transfers,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}
