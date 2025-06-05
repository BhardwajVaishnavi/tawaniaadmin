import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { QualityControlForm } from "../../_components/quality-control-form";

export default async function NewReturnQCPage() {
  // Check for auth token in cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  // Verify the JWT token
  try {
    jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret");
  } catch (error) {
    redirect("/auth/login");
  }

  // Fetch warehouses and products for the form
  const [warehouses, products] = await Promise.all([
    prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">New Return Quality Control</h1>
      </div>

      <QualityControlForm
        warehouses={warehouses}
        products={products}
        type="RETURN"
      />
    </div>
  );
}
