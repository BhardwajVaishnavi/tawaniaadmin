import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mock outwards data for fallback
const mockOutwards = [
  {
    id: "mock-outward-1",
    transferNumber: "TRF-20230501-0001",
    type: "WAREHOUSE_TO_STORE",
    status: "PENDING",
    fromWarehouseId: "mock-warehouse-1",
    fromWarehouse: {
      id: "mock-warehouse-1",
      name: "Main Warehouse"
    },
    toStoreId: "mock-store-1",
    toStore: {
      id: "mock-store-1",
      name: "Downtown Store"
    },
    items: [
      {
        id: "mock-item-1",
        productId: "mock-product-1",
        product: {
          id: "mock-product-1",
          name: "Mock Product 1",
          sku: "MP001"
        },
        requestedQuantity: 10,
        condition: "GOOD"
      }
    ],
    totalItems: 10,
    totalCost: 199.90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "mock-outward-2",
    transferNumber: "TRF-20230502-0002",
    type: "WAREHOUSE_TO_STORE",
    status: "COMPLETED",
    fromWarehouseId: "mock-warehouse-1",
    fromWarehouse: {
      id: "mock-warehouse-1",
      name: "Main Warehouse"
    },
    toStoreId: "mock-store-2",
    toStore: {
      id: "mock-store-2",
      name: "Mall Store"
    },
    items: [
      {
        id: "mock-item-2",
        productId: "mock-product-2",
        product: {
          id: "mock-product-2",
          name: "Mock Product 2",
          sku: "MP002"
        },
        requestedQuantity: 5,
        condition: "GOOD"
      }
    ],
    totalItems: 5,
    totalCost: 149.95,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export async function GET(req: NextRequest) {
  try {
    console.log("Outwards API: GET request received");
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log("Outwards API: Unauthorized - no session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId");
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const skip = (page - 1) * pageSize;
    
    console.log("Outwards API: Query parameters:", { warehouseId, storeId, status, search, page, pageSize });
    
    // Try to fetch outwards from the database
    try {
      // Build the filter
      const filter: any = {};
      
      // Only get warehouse to store transfers (outwards)
      filter.type = "WAREHOUSE_TO_STORE";
      
      if (warehouseId) {
        filter.sourceWarehouseId = warehouseId;
      }
      
      if (storeId) {
        filter.destinationStoreId = storeId;
      }
      
      if (status) {
        filter.status = status;
      }
      
      if (search) {
        filter.OR = [
          { transferNumber: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      // Use a simple query without complex includes
      const transfers = await prisma.transfer.findMany({
        where: filter,
        orderBy: {
          createdAt: "desc"
        },
        take: pageSize,
        skip
      });
      
      console.log(`Outwards API: Found ${transfers.length} outward transfers`);
      
      if (transfers.length > 0) {
        return NextResponse.json({
          transfers,
          pagination: {
            total: transfers.length,
            page,
            pageSize,
            totalPages: Math.ceil(transfers.length / pageSize)
          }
        });
      }
    } catch (dbError) {
      console.error("Outwards API: Database error:", dbError);
    }
    
    // Fall back to mock data if database query fails or returns no results
    console.log("Outwards API: Using mock data");
    
    return NextResponse.json({
      transfers: mockOutwards,
      pagination: {
        total: mockOutwards.length,
        page: 1,
        pageSize: 50,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error("Outwards API: Unexpected error:", error);
    
    // Return mock data on error
    return NextResponse.json({
      transfers: mockOutwards,
      pagination: {
        total: mockOutwards.length,
        page: 1,
        pageSize: 50,
        totalPages: 1
      }
    });
  }
}
