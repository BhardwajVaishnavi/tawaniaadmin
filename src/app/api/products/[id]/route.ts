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

    const productId = params.id;

    // Get product
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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

    const productId = params.id;
    const data = await req.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if SKU is being changed and already exists
    if (data.sku && data.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: data.sku,
          id: { not: productId },
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: "SKU already exists" },
          { status: 400 }
        );
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        categoryId: data.categoryId,
        costPrice: data.costPrice !== undefined ? data.costPrice : undefined,
        wholesalePrice: data.wholesalePrice !== undefined ? data.wholesalePrice : undefined,
        retailPrice: data.retailPrice !== undefined ? data.retailPrice : undefined,
        minStockLevel: data.minStockLevel !== undefined ? data.minStockLevel : undefined,
        reorderPoint: data.reorderPoint !== undefined ? data.reorderPoint : undefined,
        barcode: data.barcode,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        condition: data.condition || undefined,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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

    const productId = params.id;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product is used in inventory
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        productId,
      },
    });

    if (inventoryItems.length > 0) {
      // Instead of deleting, mark as inactive
      const updatedProduct = await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          isActive: false,
          updatedById: session.user.id,
        },
      });

      return NextResponse.json({
        product: updatedProduct,
        message: "Product marked as inactive because it is used in inventory",
      });
    }

    // Delete product
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
