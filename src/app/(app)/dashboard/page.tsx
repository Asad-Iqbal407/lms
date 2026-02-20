import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role === "admin") redirect("/admin");
  if (session.user.role === "teacher") redirect("/teacher");
  redirect("/student");
}

