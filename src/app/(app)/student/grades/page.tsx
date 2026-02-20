import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { EnrollmentModel } from "@/server/models/Enrollment";
import { CourseModel } from "@/server/models/Course";

export default async function StudentGradesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "student") redirect("/dashboard");

  await connectToDatabase();
  const enrollments = await EnrollmentModel.find({ studentId: session.user.id }).select("courseId").lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const myCourses = courseIds.length ? await CourseModel.find({ _id: { $in: courseIds } }).lean() : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Grades</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Gradebook will appear here once submissions and grading are implemented.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">What you can do now</div>
          <div className="mt-2 text-sm text-zinc-700">Enroll in subjects and track upcoming assignments.</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/student/courses"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              Subjects
            </Link>
            <Link
              href="/student/assignments"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              Assignments
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">My enrolled subjects</div>
          <div className="mt-1 text-xs text-zinc-600">For a real-looking dashboard</div>
          <div className="mt-3 space-y-2">
            {myCourses.length ? (
              myCourses.slice(0, 6).map((c) => (
                <div key={String(c._id)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <div className="text-xs font-semibold text-zinc-500">{c.code}</div>
                  <div className="text-sm font-semibold text-zinc-900">{c.title}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600">No subjects yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
