"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ToggleCourseOffer({
  courseId,
  isOffered,
}: {
  courseId: string;
  isOffered: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onToggle() {
    if (loading) return;
    setLoading(true);

    await fetch(`/api/courses/${courseId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isOffered: !isOffered }),
    }).finally(() => setLoading(false));

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Saving..." : isOffered ? "Offered" : "Not offered"}
    </button>
  );
}

