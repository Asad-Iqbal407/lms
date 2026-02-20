import { auth } from "@/auth";
import RegisterForm from "@/components/auth/RegisterForm";
import AuthShell from "@/components/auth/AuthShell";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return (
    <AuthShell title="Create a student account" subtitle="Students can register and enroll in offered UoG courses.">
      <RegisterForm />
    </AuthShell>
  );
}
