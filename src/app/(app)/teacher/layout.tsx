import { auth } from "@/auth";
import AppShell from "@/components/AppShell";
import { redirect } from "next/navigation";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "teacher") redirect("/dashboard");

  return (
    <AppShell
      title="UoG LMS"
      role={session.user.role}
      userName={session.user.name ?? session.user.email ?? "Teacher"}
      nav={[
        { href: "/teacher", label: "Overview" },
        { href: "/teacher/courses", label: "Courses" },
        { href: "/teacher/assignments", label: "Assignments" },
        { href: "/teacher/gradebook", label: "Gradebook" },
      ]}
    >
      {children}
    </AppShell>
  );
}
