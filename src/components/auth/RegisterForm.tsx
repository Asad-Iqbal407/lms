"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && email.length > 0 && password.length >= 8,
    [name, email, password]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/login");
      return;
    }

    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setError(json?.error ?? "Registration failed.");
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-zinc-600">Student self-registration</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none ring-0 transition focus:border-zinc-400"
            placeholder="Your name"
            autoComplete="name"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none ring-0 transition focus:border-zinc-400"
            placeholder="student@uog.edu.pk"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none ring-0 transition focus:border-zinc-400"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          disabled={!canSubmit || loading}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-zinc-600">
          Already have an account?{" "}
          <Link className="font-medium text-zinc-900 hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
