"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email.length > 0 && password.length > 0, [email, password]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setError("Invalid email or password.");
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-600">University of Gujrat LMS</p>
      </div>

      <div className="space-y-4">
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
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          disabled={!canSubmit || loading}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm text-zinc-600">
          No account?{" "}
          <Link className="font-medium text-zinc-900 hover:underline" href="/register">
            Create one
          </Link>
        </p>
      </div>
    </form>
  );
}
