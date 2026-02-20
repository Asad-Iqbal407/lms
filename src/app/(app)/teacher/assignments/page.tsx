import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { AssignmentModel } from "@/server/models/Assignment";
import { CourseModel } from "@/server/models/Course";

export default async function TeacherAssignmentsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "teacher") redirect("/dashboard");

  await connectToDatabase();
  const courses = await CourseModel.find({ teacherId: session.user.id }).lean();
  const courseIds = courses.map((c) => c._id);
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));

  const assignments = await AssignmentModel.find({ courseId: { $in: courseIds } })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
      <p className="mt-2 text-sm text-zinc-600">All assignments across your courses.</p>

      <div className="mt-6 space-y-3">
        {assignments.length ? (
          assignments.map((a) => {
            const course = courseMap.get(String(a.courseId));
            return (
              <Link
                key={String(a._id)}
                href={course ? `/teacher/courses/${course._id}` : "/teacher/courses"}
                className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold">{a.title}</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {course ? `${course.code} • ${course.title}` : "Course"}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {a.dueAt ? `Due: ${new Date(a.dueAt).toLocaleString()}` : "No due date"}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No assignments yet.
          </div>
        )}
      </div>
    </div>
  );
}

