import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EnhancedTransferForm } from "../_components/enhanced-transfer-form";

export default async function NewTransferPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get the main warehouse
  const warehouse = await prisma.warehouse.findFirst({
    where: { isActive: true },
  });

  if (!warehouse) {
    redirect("/warehouse/setup");
  }

  // Get all active stores
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Get warehouse inventory with products
  const warehouseInventory = await prisma.inventoryItem.findMany({
    where: {
      warehouseId: warehouse.id,
      quantity: { gt: 0 },
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      product: {
        name: "asc",
      },
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Transfer</h1>
        <p className="mt-2 text-gray-800">
          Transfer products from the warehouse to stores with optional price adjustments.
        </p>
      </div>

      <EnhancedTransferForm
        warehouseId={warehouse.id}
        warehouseName={warehouse.name}
        stores={stores}
        warehouseInventory={warehouseInventory}
      />
    </div>
  );
}
