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
    const search = url.searchParams.get("search");
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    
    // Build filters
    const filters: any = {};
    
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status === "active") {
      filters.isActive = true;
    } else if (status === "inactive") {
      filters.isActive = false;
    }
    
    // Get suppliers with pagination
    const [suppliers, totalItems] = await Promise.all([
      prisma.supplier.findMany({
        where: filters,
        orderBy: {
          name: "asc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.supplier.count({
        where: filters,
      }),
    ]);
    
    // Get product count for each supplier
    const suppliersWithProductCount = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await prisma.product.count({
          where: {
            supplierId: supplier.id,
          },
        });
        
        return {
          ...supplier,
          productCount,
        };
      })
    );
    
    return NextResponse.json({
      suppliers: suppliersWithProductCount,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
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
      contactPerson, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      postalCode, 
      country, 
      taxId, 
      paymentTerms, 
      notes, 
      isActive 
    } = data;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      );
    }

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactPerson,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        taxId,
        paymentTerms,
        notes,
        isActive: isActive !== undefined ? isActive : true,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
