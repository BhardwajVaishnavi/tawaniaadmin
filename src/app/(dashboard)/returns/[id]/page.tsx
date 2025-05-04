import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReturnDetails } from "../_components/return-details";

export default async function ReturnDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  const returnId = params.id;

  // Get return details
  // @ts-ignore - Dynamically access the model
  const returnData = await prisma.return.findUnique({
    where: { id: returnId },
    include: {
      store: true,
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      processedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!returnData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Return #{returnData.returnNumber}
        </h1>
      </div>

      <ReturnDetails
        returnData={returnData}
        currentUserId={session.user.id}
      />
    </div>
  );
}

