import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { UserEditForm } from "../../_components/user-edit-form";

export default async function UserEditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  // Check if user has admin role
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  const userId = params.id;
  
  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        <UserEditForm user={user} />
      </div>
    </div>
  );
}
