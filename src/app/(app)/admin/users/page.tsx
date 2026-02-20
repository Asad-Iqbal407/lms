import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { UserModel } from "@/server/models/User";
import CreateUserForm from "@/components/admin/CreateUserForm";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  await connectToDatabase();
  const users = await UserModel.find({}).select({ passwordHash: 0 }).sort({ createdAt: -1 }).lean();
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const userRows = users.map((user) => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt ? dateFormatter.format(new Date(user.createdAt)) : "-",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-2 text-sm text-zinc-600">Manage accounts and roles.</p>
      </div>

      <CreateUserForm />

      <AdminUsersTable users={userRows} />
    </div>
  );
}
