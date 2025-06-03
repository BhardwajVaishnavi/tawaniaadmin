import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (token) {
      redirect("/dashboard");
    } else {
      redirect("/auth/login");
    }
  } catch (error) {
    console.error("Auth error:", error);
    // If there's an auth error, redirect to login
    redirect("/auth/login");
  }

  // This will never be reached, but is needed for TypeScript
  return null;
}
