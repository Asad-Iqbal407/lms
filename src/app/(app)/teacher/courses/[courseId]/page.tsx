import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { AssignmentModel } from "@/server/models/Assignment";
import { CourseModel } from "@/server/models/Course";
import CreateAssignmentForm from "@/components/teacher/CreateAssignmentForm";

export default async function TeacherCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "teacher") redirect("/dashboard");

  await connectToDatabase();
  const course = await CourseModel.findById(courseId).lean();
  if (!course) redirect("/teacher/courses");
  if (String(course.teacherId) !== session.user.id) redirect("/teacher/courses");

  const assignments = await AssignmentModel.find({ courseId }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-medium text-zinc-500">{course.code}</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{course.title}</h1>
        {course.description ? <p className="mt-2 text-sm text-zinc-600">{course.description}</p> : null}
      </div>

      <CreateAssignmentForm courseId={String(course._id)} />

      <div>
        <h2 className="text-sm font-semibold text-zinc-900">Assignments</h2>
        <div className="mt-3 space-y-3">
          {assignments.length ? (
            assignments.map((a) => (
              <div key={String(a._id)} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold">{a.title}</div>
                    {a.description ? <div className="mt-2 text-sm text-zinc-600">{a.description}</div> : null}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {a.dueAt ? `Due: ${new Date(a.dueAt).toLocaleString()}` : "No due date"}
                  </div>
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

