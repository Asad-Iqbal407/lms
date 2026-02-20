import { auth } from "@/auth";
import AppShell from "@/components/AppShell";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  return (
    <AppShell
      title="UoG LMS"
      role={session.user.role}
      userName={session.user.name ?? session.user.email ?? "Admin"}
      nav={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/courses", label: "Courses" },
        { href: "/admin/settings", label: "Settings" },
      ]}
    >
      {children}
    </AppShell>
  );
}

