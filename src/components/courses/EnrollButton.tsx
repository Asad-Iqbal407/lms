"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EnrollButton({ courseId, enrolled }: { courseId: string; enrolled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onEnroll() {
    if (enrolled || loading) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Failed to enroll.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={enrolled || loading}
        onClick={onEnroll}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enrolled ? "Enrolled" : loading ? "Enrolling..." : "Enroll"}
      </button>
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </div>
  );
}

