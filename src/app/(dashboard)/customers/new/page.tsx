import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { CustomerForm } from "../new/_components/customer-form";

export default async function NewCustomerPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Add New Customer</h1>
      </div>

      <CustomerForm />
    </div>
  );
}
