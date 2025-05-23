import { redirect } from "next/navigation";

// This is a catch-all route that will redirect any access to the loyalty program pages
export default function LoyaltyProgramRedirect() {
  // Redirect to the dashboard
  redirect("/dashboard");
}
