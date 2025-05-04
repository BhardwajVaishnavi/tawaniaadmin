import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { POSInterface } from "../_components/pos-interface";

export default async function NewPOSPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get store ID from query params or use the first active store
  let storeId = searchParams.store as string | undefined;

  // Get all active stores
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  // If no store ID provided or invalid, use the first store
  if (!storeId || !stores.some(store => store.id === storeId)) {
    if (stores.length > 0) {
      storeId = stores[0].id;
    } else {
      // No stores available
      return (
        <div className="flex h-full flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-800">No Stores Available</h1>
          <p className="mt-2 text-gray-800">Please create a store before using the POS system.</p>
        </div>
      );
    }
  }

  // Get store details
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    redirect("/pos");
  }

  // Get all active customers for dropdown
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  // Get all products with inventory in this store
  const productsWithInventory = await prisma.inventoryItem.findMany({
    where: {
      storeId: storeId,
      quantity: { gt: 0 },
      status: "AVAILABLE",
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [
      { product: { name: 'asc' } },
    ],
  });

  // Get tax rates
  const taxRates = await prisma.taxRate.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  // Default tax rate
  const defaultTaxRate = taxRates.find(tax => tax.isDefault) || taxRates[0] || { id: 'none', rate: 0 };

  return (
    <div className="h-full">
      <POSInterface
        store={store}
        stores={stores}
        customers={customers}
        inventoryItems={productsWithInventory}
        taxRates={taxRates}
        defaultTaxRate={defaultTaxRate}
        userId={session.user.id}
      />
    </div>
  );
}
