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

  return <PrintTransferDocument transfer={transfer} />;
}
