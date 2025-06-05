import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { UserCreateForm } from "../_components/user-create-form";

export default async function NewUserPage() {
  // Check for auth token in cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  // Verify the JWT token and check admin role
  let user;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any;
    user = decoded;
  } catch (error) {
    redirect("/auth/login");
  }

  // Check if user has admin role
  if (!user?.role || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <UserCreateForm />
      </div>
    </div>
  );
}
