import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PrintTransferDocument } from "../../_components/print-transfer-document";

export default async function PrintTransferPage({
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

  // Create a compatible transfer object with all required fields
  const adaptedTransfer = {
    ...transfer,
    approvedAt: transfer.approvedDate,
    shippedAt: transfer.actualDeliveryDate || null, // Use actualDeliveryDate instead of shippedDate
    receivedAt: transfer.completedDate || null,
  };

  return <PrintTransferDocument transfer={adaptedTransfer as any} />;
}


