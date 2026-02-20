import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { CourseModel } from "@/server/models/Course";
import { AssignmentModel } from "@/server/models/Assignment";

export default async function TeacherHomePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "teacher") redirect("/dashboard");

  await connectToDatabase();

  const courses = await CourseModel.find({ teacherId: session.user.id }).sort({ createdAt: -1 }).lean();
  const courseIds = courses.map((c) => c._id);

  const assignments = courseIds.length
    ? await AssignmentModel.find({ courseId: { $in: courseIds } }).sort({ dueAt: 1, createdAt: -1 }).limit(8).lean()
    : [];

  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingCount = courseIds.length
    ? await AssignmentModel.countDocuments({ courseId: { $in: courseIds }, dueAt: { $gte: now, $lte: soon } })
    : 0;

  const courseMap = new Map(courses.map((c) => [String(c._id), c]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Teacher Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">Your courses and upcoming coursework.</p>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold text-zinc-600">My courses</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{courses.length}</div>
          <div className="mt-2 text-sm text-zinc-600">Courses assigned to you</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold text-zinc-600">Upcoming (7 days)</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{upcomingCount}</div>
          <div className="mt-2 text-sm text-zinc-600">Assignments due soon</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold text-zinc-600">Quick actions</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/teacher/courses"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              View courses
            </Link>
            <Link
              href="/teacher/assignments"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              All assignments
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Upcoming & recent assignments</div>
            <div className="text-xs text-zinc-600">Across your courses</div>
          </div>
          <Link className="text-sm font-medium text-zinc-900 hover:underline" href="/teacher/assignments">
            View all
          </Link>
        </div>
        <div className="divide-y divide-zinc-200">
          {assignments.length ? (
            assignments.map((a) => {
              const course = courseMap.get(String(a.courseId));
              const due =
                a.dueAt instanceof Date ? a.dueAt : a.dueAt ? new Date(a.dueAt as unknown as string) : null;
              return (
                <div key={String(a._id)} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">{a.title}</div>
                    <div className="mt-0.5 text-xs text-zinc-600">
                      {course ? `${course.code} • ${course.title}` : "Course"}
                    </div>
                    {a.description ? <div className="mt-1 text-sm text-zinc-700">{a.description}</div> : null}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-zinc-600">Due</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      {due ? due.toLocaleDateString() : "—"}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-sm text-zinc-600">No assignments yet. Open a course to create one.</div>
          )}
        </div>
      </section>
    </div>
  );
}
