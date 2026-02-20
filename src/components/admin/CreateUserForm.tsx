"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import type { Role } from "@/types/auth";

function generatePassword(length = 12) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  let out = "";
  for (let i = 0; i < values.length; i++) {
    out += alphabet[values[i] % alphabet.length];
  }
  return out;
}

export default function CreateUserForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [created, setCreated] = useState<{ name: string; email: string; role: Role; password: string } | null>(null);

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && email.length > 0 && password.length >= 8,
    [name, email, password]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setCreated(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    setLoading(false);

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Failed to create user.");
      return;
    }

    setCreated({ name, email, role, password });
    setName("");
    setEmail("");
    setPassword("");
    setRole("student");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Create user</h2>
          <p className="mt-1 text-xs text-zinc-600">Students, teachers, administrators</p>
        </div>
        <button
          disabled={!canSubmit || loading}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            placeholder="Full name"
          />
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            placeholder="email@uog.edu.pk"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-zinc-700">Password</span>
          <div className="flex gap-2">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={() => setPassword(generatePassword(12))}
              className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Generate
            </button>
          </div>
          <label className="mt-2 flex items-center gap-2">
            <input
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-xs text-zinc-600">Show password</span>
          </label>
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-zinc-700">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>

      {created ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-sm font-semibold text-emerald-900">Login details</div>
          <div className="mt-2 grid gap-1 text-sm text-emerald-900">
            <div>
              <span className="font-medium">Role:</span> {created.role}
            </div>
            <div>
              <span className="font-medium">Name:</span> {created.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {created.email}
            </div>
            <div>
              <span className="font-medium">Password:</span> {created.password}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(
                  `Role: ${created.role}\nName: ${created.name}\nEmail: ${created.email}\nPassword: ${created.password}`
                );
              }}
              className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100/40"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => setCreated(null)}
              className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100/40"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
