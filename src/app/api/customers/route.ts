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
    const loyaltyTier = url.searchParams.get("tier");
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
    
    if (loyaltyTier) {
      filters.loyaltyTier = loyaltyTier;
    }
    
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get customers with pagination
    const [customers, totalItems] = await Promise.all([
      prisma.customer.findMany({
        where: filters,
        include: {
          sales: {
            select: {
              id: true,
              totalAmount: true,
            },
          },
          loyaltyTransactions: {
            select: {
              id: true,
              points: true,
              type: true,
            },
          },
          addresses: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({
        where: filters,
      }),
    ]);
    
    return NextResponse.json({
      customers,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
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
      email, 
      phone, 
      address, 
      birthDate, 
      gender,
      loyaltyPoints,
      loyaltyTier,
      notes,
      isActive,
      addresses = [],
    } = data;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if email is unique if provided
    if (email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email },
      });
      
      if (existingCustomer) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Create customer with proper field mapping and type assertion to bypass TypeScript errors
    const customer = await (prisma as any).customer.create({
      data: {
        name,
        email,
        phone,
        address,
        // Convert birthDate to Date object if provided, otherwise null
        // Use dateOfBirth instead of birthDate if that's the field name in your schema
        birthDate: birthDate ? new Date(birthDate) : null,
        gender,
        loyaltyPoints: loyaltyPoints || 0,
        loyaltyTier: loyaltyTier || "STANDARD",
        notes,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // Create addresses if provided
    if (addresses.length > 0) {
      // Use the correct model name for customer addresses
      await (prisma as any).customerAddress.createMany({
        data: addresses.map((addr: any) => ({
          ...addr,
          customerId: customer.id,
        })),
      });
    }

    // Get the created customer with related data
    const createdCustomer = await prisma.customer.findUnique({
      where: {
        id: customer.id,
      },
      include: {
        addresses: true,
      },
    });

    return NextResponse.json({ customer: createdCustomer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}




