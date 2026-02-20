import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { CourseModel } from "@/server/models/Course";
import { AssignmentModel } from "@/server/models/Assignment";

export default async function TeacherGradebookPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "teacher") redirect("/dashboard");

  await connectToDatabase();

  const courses = await CourseModel.find({ teacherId: session.user.id }).sort({ createdAt: -1 }).lean();
  const courseIds = courses.map((c) => c._id);
  const assignments = courseIds.length
    ? await AssignmentModel.find({ courseId: { $in: courseIds } }).sort({ dueAt: 1 }).limit(6).lean()
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gradebook</h1>
        <p className="mt-2 text-sm text-zinc-600">Submissions and grading UI will appear here next.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">What you can do now</div>
          <div className="mt-2 text-sm text-zinc-700">Create assignments so students have coursework to submit.</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/teacher/courses"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              My courses
            </Link>
            <Link
              href="/teacher/assignments"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              Assignments
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Recent assignments</div>
          <div className="mt-1 text-xs text-zinc-600">Helps the demo look populated</div>
          <div className="mt-3 space-y-2">
            {assignments.length ? (
              assignments.map((a) => (
                <div key={String(a._id)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <div className="text-sm font-semibold text-zinc-900">{a.title}</div>
                  <div className="mt-0.5 text-xs text-zinc-600">
                    Due {a.dueAt ? new Date(a.dueAt as unknown as string).toLocaleDateString() : "—"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600">No assignments yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
