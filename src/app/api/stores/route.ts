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
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    
    // Build filters
    const filters: any = {};
    
    if (status === "active") {
      filters.isActive = true;
    } else if (status === "inactive") {
      filters.isActive = false;
    }
    
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get stores with pagination
    const [stores, totalItems] = await Promise.all([
      prisma.store.findMany({
        where: filters,
        include: {
          inventoryItems: {
            select: {
              id: true,
            },
          },
          staff: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.store.count({
        where: filters,
      }),
    ]);
    
    // Add inventory count to each store
    const storesWithStats = stores.map(store => {
      return {
        ...store,
        inventoryCount: store.inventoryItems.length,
        staffCount: store.staff.length,
      };
    });
    
    return NextResponse.json({
      stores: storesWithStats,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
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
      code, 
      address, 
      phone, 
      email, 
      openingHours,
      isActive 
    } = data;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingStore = await prisma.store.findUnique({
      where: { code },
    });
    
    if (existingStore) {
      return NextResponse.json(
        { error: "Store code already exists" },
        { status: 400 }
      );
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        name,
        code,
        address,
        phone,
        email,
        openingHours,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
