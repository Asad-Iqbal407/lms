import { auth } from "@/auth";
import AppShell from "@/components/AppShell";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "student") redirect("/dashboard");

  return (
    <AppShell
      title="UoG LMS"
      role={session.user.role}
      userName={session.user.name ?? session.user.email ?? "Student"}
      nav={[
        { href: "/student", label: "Overview" },
        { href: "/student/courses", label: "Subjects" },
        { href: "/student/assignments", label: "Assignments" },
        { href: "/student/grades", label: "Grades" },
      ]}
    >
      {children}
    </AppShell>
  );
}
