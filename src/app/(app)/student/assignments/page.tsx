import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { AssignmentModel } from "@/server/models/Assignment";
import { CourseModel } from "@/server/models/Course";
import { EnrollmentModel } from "@/server/models/Enrollment";

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "student") redirect("/dashboard");

  await connectToDatabase();

  const enrollments = await EnrollmentModel.find({ studentId: session.user.id }).select("courseId").lean();
  const courseIds = enrollments.map((e) => e.courseId);

  const courses = await CourseModel.find({ _id: { $in: courseIds } }).lean();
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));

  const assignments = await AssignmentModel.find({ courseId: { $in: courseIds } })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
      <p className="mt-2 text-sm text-zinc-600">All assignments across your enrolled courses.</p>

      <div className="mt-6 space-y-3">
        {assignments.length ? (
          assignments.map((a) => {
            const course = courseMap.get(String(a.courseId));
            return (
              <Link
                key={String(a._id)}
                href={course ? `/student/courses/${course._id}` : "/student/courses"}
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

