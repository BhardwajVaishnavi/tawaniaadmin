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
    const categoryId = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const status = url.searchParams.get("status");
    const condition = url.searchParams.get("condition");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

    // Build filters
    const filters: any = {};

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === "active") {
      filters.isActive = true;
    } else if (status === "inactive") {
      filters.isActive = false;
    }

    if (condition) {
      filters.condition = condition;
    }

    // Get products with pagination
    const [products, totalItems] = await Promise.all([
      prisma.product.findMany({
        where: filters,
        include: {
          category: true,
          inventoryItems: {
            include: {
              warehouse: true,
              store: true,
            }
          },
        },
        orderBy: {
          name: "asc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({
        where: filters,
      }),
    ]);

    return NextResponse.json({
      products,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
      name,
      sku,
      description,
      categoryId,
      costPrice,
      wholesalePrice,
      retailPrice,
      minStockLevel,
      reorderPoint,
      barcode,
      isActive,
      condition
    } = data;

    // Validate required fields
    if (!name || !sku || !categoryId || costPrice === undefined || wholesalePrice === undefined || retailPrice === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingSku = await prisma.product.findFirst({
      where: { sku },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: "SKU already exists" },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        categoryId,
        costPrice,
        wholesalePrice,
        retailPrice,
        minStockLevel: minStockLevel || 10,
        reorderPoint: reorderPoint || 5,
        barcode,
        isActive: isActive !== undefined ? isActive : true,
        condition: condition || "NEW",
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
