import { auth } from "@/auth";
import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/auth/AuthShell";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return (
    <AuthShell title="Sign in" subtitle="Access student, teacher, and admin dashboards with role-based permissions.">
      <LoginForm />
    </AuthShell>
  );
}
