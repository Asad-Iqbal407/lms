import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { CourseModel } from "@/server/models/Course";
import { EnrollmentModel } from "@/server/models/Enrollment";
import { AssignmentModel } from "@/server/models/Assignment";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "student") redirect("/dashboard");

  await connectToDatabase();

  const enrollment = await EnrollmentModel.findOne({ courseId, studentId: session.user.id }).lean();
  if (!enrollment) redirect("/student/courses");

  const course = await CourseModel.findById(courseId).lean();
  if (!course) redirect("/student/courses");

  const assignments = await AssignmentModel.find({ courseId }).sort({ createdAt: -1 }).lean();

  return (
    <div>
      <div>
        <div className="text-xs font-medium text-zinc-500">{course.code}</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{course.title}</h1>
        {course.description ? <p className="mt-2 text-sm text-zinc-600">{course.description}</p> : null}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-zinc-900">Assignments</h2>
        <div className="mt-3 space-y-3">
          {assignments.length ? (
            assignments.map((a) => (
              <div key={String(a._id)} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="text-base font-semibold">{a.title}</div>
                {a.description ? <div className="mt-2 text-sm text-zinc-600">{a.description}</div> : null}
                <div className="mt-3 text-xs text-zinc-500">
                  {a.dueAt ? `Due: ${new Date(a.dueAt).toLocaleString()}` : "No due date"}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              No assignments yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

