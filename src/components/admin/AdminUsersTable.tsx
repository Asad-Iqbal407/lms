"use client";

import { useMemo, useState } from "react";
import type { Role } from "@/types/auth";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

const roleStyles: Record<Role, string> = {
  student: "border-emerald-200 bg-emerald-50 text-emerald-900",
  teacher: "border-blue-200 bg-blue-50 text-blue-900",
  admin: "border-amber-200 bg-amber-50 text-amber-900",
};

const roleLabels: Record<Role, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
};

export default function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");

  const counts = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.total += 1;
        acc[user.role] += 1;
        return acc;
      },
      { total: 0, student: 0, teacher: 0, admin: 0 }
    );
  }, [users]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!normalized) return true;
      return (
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized)
      );
    });
  }, [users, query, roleFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Directory</div>
            <div className="mt-1 text-xs text-zinc-600">
              {counts.total} total users | {counts.student} students | {counts.teacher} teachers | {counts.admin} admins
            </div>
          </div>
          <div className="text-xs font-semibold text-zinc-500">
            Showing {filtered.length} of {counts.total}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-600">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
              placeholder="Search name or email"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-600">Role</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            >
              <option value="all">All roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
          </label>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
            Tip: Use role filters to manage onboarding and permissions quickly.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-600">
        <div className="col-span-4">Name</div>
        <div className="col-span-4">Email</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-2">Created</div>
      </div>

      <div className="divide-y divide-zinc-200">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">No users match the current filters.</div>
        ) : (
          filtered.map((user) => (
            <div key={user.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
              <div className="col-span-4 font-medium text-zinc-900">{user.name}</div>
              <div className="col-span-4 text-zinc-700">{user.email}</div>
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-semibold ${
                    roleStyles[user.role]
                  }`}
                >
                  {roleLabels[user.role]}
                </span>
              </div>
              <div className="col-span-2 text-xs text-zinc-600">{user.createdAt}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
