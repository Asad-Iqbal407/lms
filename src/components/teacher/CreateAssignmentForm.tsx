"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

export default function CreateAssignmentForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => title.trim().length >= 2, [title]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/courses/${courseId}/assignments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        description: description.trim().length ? description : undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Failed to create assignment.");
      return;
    }

    setTitle("");
    setDescription("");
    setDueAt("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">New assignment</h2>
          <p className="mt-1 text-xs text-zinc-600">Publish to enrolled students</p>
        </div>
        <button
          disabled={!canSubmit || loading}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-medium text-zinc-700">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            placeholder="Assignment title"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-zinc-700">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            placeholder="Optional instructions"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-zinc-700">Due date</span>
          <input
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            type="datetime-local"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </form>
  );
}
