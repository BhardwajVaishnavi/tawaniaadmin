import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// This is a catch-all route that will handle all requests to /api/quality-control
// It returns mock data instead of trying to access the database

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
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Return mock data
    return NextResponse.json({
      qualityControls: [],
      totalItems: 0,
      page,
      limit,
      totalPages: 0,
    });
  } catch (error) {
    console.error("Error in quality control API:", error);
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

    // Return mock success response
    return NextResponse.json({
      id: "mock-id",
      referenceNumber: "QC-MOCK-001",
      type: "RECEIVING",
      status: "PENDING",
      warehouseId: "mock-warehouse-id",
      inspectionDate: new Date().toISOString(),
      inspectedById: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
      warehouse: {
        id: "mock-warehouse-id",
        name: "Mock Warehouse",
      },
      inspectedBy: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error("Error in quality control API:", error);
    return NextResponse.json(
      { error: "Failed to create quality control" },
      { status: 500 }
    );
  }
}
