import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Warehouse Inwards API: GET request received");

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("Warehouse Inwards API: Unauthorized - no session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId");
    const supplierId = searchParams.get("supplierId");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const skip = (page - 1) * pageSize;

    console.log("Warehouse Inwards API: Query parameters:", { warehouseId, supplierId, status, search, page, pageSize });

    // Try to fetch inwards from the database
    try {
      // Build the filter
      const filter: any = {};

      if (warehouseId) {
        filter.warehouseId = warehouseId;
      }

      if (supplierId) {
        filter.supplierId = supplierId;
      }

      if (status) {
        filter.status = status;
      }

      if (search) {
        filter.OR = [
          { referenceNumber: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Use a simple query without complex includes
      const inwards = await prisma.inwardShipment.findMany({
        where: filter,
        orderBy: {
          createdAt: "desc"
        },
        take: pageSize,
        skip
      });

      console.log(`Warehouse Inwards API: Found ${inwards.length} inward shipments`);

      // Get total count for pagination
      const totalCount = await prisma.inward.count({
        where: filter
      });

      return NextResponse.json({
        inwards,
        pagination: {
          total: totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
    } catch (dbError) {
      console.error("Warehouse Inwards API: Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch inward shipments" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Warehouse Inwards API: Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inward shipments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Warehouse Inwards API: POST request received");

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("Warehouse Inwards API: Unauthorized - no session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await req.json();
    console.log("Warehouse Inwards API: Request data:", data);

    // Generate a reference number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const referenceNumber = `INW-${year}${month}${day}-${randomNum}`;

    // Try to create an inward shipment in the database
    try {
      const inward = await prisma.inwardShipment.create({
        data: {
          referenceNumber,
          status: data.status || "PENDING",
          warehouseId: data.warehouseId,
          supplierId: data.supplierId,
          notes: data.notes || "",
          createdById: session.user.id
        }
      });

      console.log("Warehouse Inwards API: Inward shipment created successfully:", inward);

      return NextResponse.json({
        success: true,
        message: "Inward shipment created successfully",
        inward
      });
    } catch (dbError) {
      console.error("Warehouse Inwards API: Database error:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Warehouse Inwards API: Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to create inward shipment" },
      { status: 500 }
    );
  }
}
