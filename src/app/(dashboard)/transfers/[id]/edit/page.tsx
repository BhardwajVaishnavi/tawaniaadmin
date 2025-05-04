import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditTransferForm } from "../../_components/edit-transfer-form";

export default async function EditTransferPage({
  params,
}: {
  params: { id: string };
}) {
  const transferId = params.id;

  // Get transfer with related data
  const transfer = await prisma.transfer.findUnique({
    where: { id: transferId },
    include: {
      fromWarehouse: true,
      toWarehouse: true,
      toStore: true,
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!transfer) {
    notFound();
  }

  // Only allow editing of transfers in DRAFT or PENDING status
  if (transfer.status !== "DRAFT" && transfer.status !== "PENDING") {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
          <h2 className="text-lg font-medium">Cannot Edit Transfer</h2>
          <p className="mt-2">
            This transfer cannot be edited because it is in {transfer.status} status.
            Only transfers in DRAFT or PENDING status can be edited.
          </p>
          <div className="mt-4">
            <a
              href={`/transfers/${transfer.id}`}
              className="rounded-md bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-200"
            >
              Back to Transfer Details
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Get warehouses and stores for the form
  const [warehouses, stores, products] = await Promise.all([
    prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Transfer #{transfer.transferNumber}
        </h1>
      </div>

      <EditTransferForm
        transfer={transfer}
        warehouses={warehouses}
        stores={stores}
        products={products}
      />
    </div>
  );
}
