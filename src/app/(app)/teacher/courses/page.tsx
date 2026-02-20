import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { CourseModel } from "@/server/models/Course";

export default async function TeacherCoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "teacher") redirect("/dashboard");

  await connectToDatabase();
  const courses = await CourseModel.find({ teacherId: session.user.id }).sort({ createdAt: -1 }).lean();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
      <p className="mt-2 text-sm text-zinc-600">Your assigned courses.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {courses.length ? (
          courses.map((c) => (
            <Link
              key={String(c._id)}
              href={`/teacher/courses/${c._id}`}
              className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300"
            >
              <div className="text-xs font-medium text-zinc-500">{c.code}</div>
              <div className="mt-1 text-base font-semibold">{c.title}</div>
              {c.description ? <div className="mt-2 text-sm text-zinc-600">{c.description}</div> : null}
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No courses assigned yet.
          </div>
        )}
      </div>
    </div>
  );
}

