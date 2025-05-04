import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const supplierId = searchParams.get("supplierId");

    // Build the query
    const query: any = {
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        },
        qualityControls: {
          where: {
            type: "RECEIVING"
          },
          include: {
            items: {
              where: {
                status: "FAILED"
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    };

    // Add filters if provided
    if (status) {
      query.where = { ...query.where, status };
    }

    if (supplierId) {
      query.where = { ...query.where, supplierId };
    }

    // Get purchase orders from the database
    const purchaseOrders = await prisma.purchaseOrder.findMany(query);

    // Transform the data to include total items, value, and damaged items flag
    const inwards = purchaseOrders.map(po => {
      const totalItems = po.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = po.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

      // Check if there are any failed quality control items (damaged items)
      const hasDamagedItems = po.qualityControls.some(qc => qc.items.length > 0);

      return {
        id: po.id,
        referenceNumber: po.referenceNumber,
        date: po.createdAt,
        supplier: po.supplier?.name || "Unknown Supplier",
        status: po.status,
        totalItems,
        totalValue,
        hasDamagedItems
      };
    });

    return NextResponse.json({ inwards });
  } catch (error) {
    console.error("Error fetching inward shipments:", error);
    return NextResponse.json({ error: "Failed to fetch inward shipments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.supplierId || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create purchase order
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        referenceNumber: data.referenceNumber || `PO-${Date.now()}`,
        supplierId: data.supplierId,
        status: data.status || "PENDING",
        warehouseId: data.warehouseId,
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
        notes: data.notes,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            notes: item.notes
          }))
        }
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // If the status is RECEIVED, update inventory
    if (data.status === "RECEIVED") {
      for (const item of data.items) {
        // Check if inventory item exists
        const existingItem = await prisma.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            warehouseId: data.warehouseId
          }
        });

        if (existingItem) {
          // Update existing inventory item
          await prisma.inventoryItem.update({
            where: {
              id: existingItem.id
            },
            data: {
              quantity: {
                increment: item.quantity
              },
              costPrice: item.unitPrice // Update cost price with latest purchase price
            }
          });
        } else {
          // Create new inventory item
          await prisma.inventoryItem.create({
            data: {
              productId: item.productId,
              warehouseId: data.warehouseId,
              quantity: item.quantity,
              costPrice: item.unitPrice
            }
          });
        }
      }

      // Create a quality control record for the received items
      await prisma.qualityControl.create({
        data: {
          referenceNumber: `QC-${purchaseOrder.referenceNumber}`,
          type: "RECEIVING",
          status: "COMPLETED",
          warehouseId: data.warehouseId,
          purchaseOrderId: purchaseOrder.id,
          inspectionDate: new Date(),
          completedDate: new Date(),
          inspectedById: session.user.id,
          notes: "Automatic quality control for received items",
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              passedQuantity: item.quantity,
              failedQuantity: 0,
              pendingQuantity: 0,
              status: "PASSED"
            }))
          }
        }
      });
    }

    return NextResponse.json({ purchaseOrder });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}
