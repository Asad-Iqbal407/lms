"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TeacherOption = { id: string; name: string; email: string };

export default function CreateCourseForm({ teachers }: { teachers: TeacherOption[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [isOffered, setIsOffered] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => code.trim().length >= 2 && title.trim().length >= 2 && teacherId, [
    code,
    title,
    teacherId,
  ]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code,
        title,
        description: description.trim().length ? description : undefined,
        teacherId,
        isOffered,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Failed to create course.");
      return;
    }

    setCode("");
    setTitle("");
    setDescription("");
    setIsOffered(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Create course</h2>
          <p className="mt-1 text-xs text-zinc-600">Assign a teacher and publish</p>
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
        <label className="grid gap-1">
          <span className="text-xs font-medium text-zinc-700">Course code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            placeholder="CS-101"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-zinc-700">Teacher</span>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            placeholder="Introduction to Programming"
          />
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            placeholder="Optional"
          />
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            checked={isOffered}
            onChange={(e) => setIsOffered(e.target.checked)}
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span className="text-xs font-medium text-zinc-700">Offer this course in student catalog</span>
        </label>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
