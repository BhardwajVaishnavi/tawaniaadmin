import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const purchaseOrderId = params.id;

    // Get purchase order
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            product: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ purchaseOrder });
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const purchaseOrderId = params.id;
    const data = await req.json();
    
    // Check if purchase order exists
    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    // Only allow updates to draft orders
    if (existingOrder.status !== "DRAFT" && !data.status) {
      return NextResponse.json(
        { error: "Only draft orders can be updated" },
        { status: 400 }
      );
    }

    // Extract data
    const { 
      supplierId, 
      warehouseId, 
      expectedDeliveryDate, 
      notes, 
      items,
      status,
      shipping,
      discount
    } = data;

    // Prepare transaction
    const result = await prisma.$transaction(async (tx) => {
      // If items are provided, update them
      if (items && items.length > 0) {
        // Delete existing items
        await tx.purchaseOrderItem.deleteMany({
          where: {
            purchaseOrderId,
          },
        });
        
        // Calculate totals
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;
        
        // Create new items
        const orderItems = items.map((item: any) => {
          const itemSubtotal = item.unitPrice * item.orderedQuantity;
          const itemTax = (item.tax || 0);
          const itemDiscount = (item.discount || 0);
          const itemTotal = itemSubtotal + itemTax - itemDiscount;
          
          subtotal += itemSubtotal;
          totalTax += itemTax;
          totalDiscount += itemDiscount;
          
          return {
            purchaseOrderId,
            productId: item.productId,
            description: item.description,
            orderedQuantity: item.orderedQuantity,
            receivedQuantity: item.receivedQuantity || 0,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            subtotal: itemSubtotal,
            total: itemTotal,
            notes: item.notes,
          };
        });
        
        // Create new items
        await tx.purchaseOrderItem.createMany({
          data: orderItems,
        });
        
        // Calculate final total
        const shippingAmount = shipping || 0;
        const discountAmount = discount || totalDiscount;
        const total = subtotal + totalTax + shippingAmount - discountAmount;
        
        // Update purchase order
        const updatedOrder = await tx.purchaseOrder.update({
          where: {
            id: purchaseOrderId,
          },
          data: {
            supplierId: supplierId || undefined,
            warehouseId: warehouseId || undefined,
            expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
            notes: notes !== undefined ? notes : undefined,
            status: status || undefined,
            subtotal,
            tax: totalTax,
            shipping: shippingAmount,
            discount: discountAmount,
            total,
            updatedById: session.user.id,
          },
          include: {
            supplier: true,
            warehouse: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });
        
        return updatedOrder;
      } else {
        // Update purchase order without changing items
        const updatedOrder = await tx.purchaseOrder.update({
          where: {
            id: purchaseOrderId,
          },
          data: {
            supplierId: supplierId || undefined,
            warehouseId: warehouseId || undefined,
            expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
            notes: notes !== undefined ? notes : undefined,
            status: status || undefined,
            shipping: shipping !== undefined ? shipping : undefined,
            discount: discount !== undefined ? discount : undefined,
            updatedById: session.user.id,
          },
          include: {
            supplier: true,
            warehouse: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });
        
        // If shipping or discount changed, recalculate total
        if (shipping !== undefined || discount !== undefined) {
          const total = updatedOrder.subtotal + updatedOrder.tax + updatedOrder.shipping - updatedOrder.discount;
          
          return await tx.purchaseOrder.update({
            where: {
              id: purchaseOrderId,
            },
            data: {
              total,
            },
            include: {
              supplier: true,
              warehouse: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          });
        }
        
        return updatedOrder;
      }
    });

    return NextResponse.json({ purchaseOrder: result });
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return NextResponse.json(
      { error: "Failed to update purchase order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const purchaseOrderId = params.id;

    // Check if purchase order exists
    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of draft orders
    if (existingOrder.status !== "DRAFT") {
      return NextResponse.json(
        { 
          error: "Only draft orders can be deleted. Consider cancelling the order instead.",
          suggestion: "Use PUT to update the status to CANCELLED"
        },
        { status: 400 }
      );
    }

    // Delete purchase order and its items
    await prisma.$transaction([
      prisma.purchaseOrderItem.deleteMany({
        where: {
          purchaseOrderId,
        },
      }),
      prisma.purchaseOrder.delete({
        where: {
          id: purchaseOrderId,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Purchase order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase order" },
      { status: 500 }
    );
  }
}
