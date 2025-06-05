import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { QualityControlDetail } from "../_components/quality-control-detail";

// This function is used to generate static params for the page
export async function generateStaticParams() {
  // We don't need to generate any static params
  return [];
}

// This tells Next.js to dynamically render this page
export const dynamic = 'force-dynamic';

export default async function QualityControlDetailPage({
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
  try {
    jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret");
  } catch (error) {
    redirect("/auth/login");
  }

  const resolvedParams = await params;
  const qualityControlId = resolvedParams.id;

  // We'll always render the detail component and let it handle the data fetching
  return <QualityControlDetail id={qualityControlId} />;
}
