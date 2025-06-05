import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReturnDetails } from "../_components/return-details";

export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check for auth token in cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  // Verify the JWT token
  let user;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any;
    user = decoded;
  } catch (error) {
    redirect("/auth/login");
  }

  const resolvedParams = await params;
  const returnId = resolvedParams.id;

  // Get return details
  // @ts-ignore - Dynamically access the model
  const returnData = await prisma.return.findUnique({
    where: { id: returnId },
    include: {
      Store: true,
      Customer: true,
      ReturnItem: {
        include: {
          Product: true,
        },
      },
      User: {
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

  // Transform the data to match the expected format in the client component
  const formattedReturnData = {
    ...returnData,
    store: returnData.Store,
    customer: returnData.Customer,
    items: (returnData.ReturnItem || []).map(item => ({
      ...item,
      product: item.Product
    })),
    processedBy: returnData.User,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Return #{returnData.returnNumber}
        </h1>
      </div>

      <ReturnDetails
        returnData={formattedReturnData}
        currentUserId={session.user.id}
      />
    </div>
  );
}

