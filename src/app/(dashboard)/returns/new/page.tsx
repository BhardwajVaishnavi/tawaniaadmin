import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewReturnForm } from "../_components/new-return-form";
import { redirect } from "next/navigation";

export default async function NewReturnPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Get stores and products for the form
  const [stores, products, customers] = await Promise.all([
    prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.customer.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">New Return</h1>
      </div>

      <NewReturnForm 
        stores={stores} 
        products={products} 
        customers={customers} 
        userId={session.user.id}
      />
    </div>
  );
}
