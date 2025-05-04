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

    // Get warehouses, products, and inventory items
    const [warehouses, products, inventoryItems] = await Promise.all([
      prisma.warehouse.findMany({
        where: { isActive: true },
        select: { 
          id: true, 
          name: true, 
          code: true 
        },
        orderBy: { name: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { 
          id: true, 
          name: true, 
          sku: true, 
          minStockLevel: true,
          reorderPoint: true,
          categoryId: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.inventoryItem.findMany({
        select: {
          id: true,
          productId: true,
          warehouseId: true,
          storeId: true,
          quantity: true,
          status: true,
        },
      }),
    ]);

    return NextResponse.json({
      warehouses,
      products,
      inventoryItems,
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory data" },
      { status: 500 }
    );
  }
}
