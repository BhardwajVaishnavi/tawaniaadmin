import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { TransferReceiveForm } from "../../_components/transfer-receive-form";

export default async function TransferReceivePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const transferId = params.id;

  // Get transfer with related data
  const transfer = await prisma.transfer.findUnique({
    where: { id: transferId },
    include: {
      sourceWarehouse: true,
      destinationWarehouse: true,
      destinationStore: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!transfer) {
    notFound();
  }

  // Redirect if transfer is not in IN_TRANSIT status
  if (transfer.status !== "IN_TRANSIT") {
    redirect(`/transfers/${transferId}`);
  }

  // Get destination bins if it's a warehouse-to-warehouse transfer
  let destinationBins = [];
  if (transfer.transferType === "WAREHOUSE_TO_WAREHOUSE" && transfer.destinationWarehouseId) {
    destinationBins = await prisma.bin.findMany({
      where: {
        shelf: {
          aisle: {
            zone: {
              warehouseId: transfer.destinationWarehouseId,
            },
          },
        },
      },
      include: {
        shelf: {
          include: {
            aisle: {
              include: {
                zone: true,
              },
            },
          },
        },
      },
      orderBy: [
        { shelf: { aisle: { zone: { name: 'asc' } } } },
        { shelf: { aisle: { name: 'asc' } } },
        { shelf: { name: 'asc' } },
        { name: 'asc' },
      ],
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Receive Transfer #{transfer.referenceNumber}</h1>
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Source</h3>
            <p className="mt-1 text-base font-medium text-gray-900">{transfer.sourceWarehouse?.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Destination</h3>
            <p className="mt-1 text-base font-medium text-gray-900">
              {transfer.destinationWarehouse?.name || transfer.destinationStore?.name}
            </p>
            <p className="text-sm text-gray-500">
              {transfer.transferType === "WAREHOUSE_TO_WAREHOUSE" ? "Warehouse" : "Store"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Shipping Info</h3>
            <p className="mt-1 text-base font-medium text-gray-900">
              {transfer.shippingMethod || "Not specified"}
            </p>
            {transfer.trackingNumber && (
              <p className="text-sm text-gray-500">
                Tracking: {transfer.trackingNumber}
              </p>
            )}
          </div>
        </div>
        
        <TransferReceiveForm 
          transfer={transfer} 
          destinationBins={destinationBins}
        />
      </div>
    </div>
  );
}
