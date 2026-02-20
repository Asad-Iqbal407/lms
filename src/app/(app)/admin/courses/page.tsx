import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { CourseModel } from "@/server/models/Course";
import { UserModel } from "@/server/models/User";
import CreateCourseForm from "@/components/admin/CreateCourseForm";
import AdminCoursesTable from "@/components/admin/AdminCoursesTable";

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  await connectToDatabase();
  const courses = await CourseModel.find({}).sort({ createdAt: -1 }).lean();
  const teachers = await UserModel.find({ role: "teacher" }).select({ passwordHash: 0 }).sort({ createdAt: -1 }).lean();

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const teacherMap = new Map(teachers.map((t) => [String(t._id), t]));
  const courseRows = courses.map((course) => {
    const teacher = teacherMap.get(String(course.teacherId));
    return {
      id: String(course._id),
      code: course.code,
      title: course.title,
      teacherId: String(course.teacherId),
      teacherName: teacher?.name ?? "Unassigned",
      teacherEmail: teacher?.email ?? "-",
      isOffered: course.isOffered !== false,
      createdAt: course.createdAt ? dateFormatter.format(new Date(course.createdAt)) : "-",
    };
  });
  const teacherOptions = teachers.map((teacher) => ({
    id: String(teacher._id),
    name: teacher.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
        <p className="mt-2 text-sm text-zinc-600">Create and assign courses to teachers.</p>
      </div>

      <CreateCourseForm
        teachers={teachers.map((t) => ({ id: String(t._id), name: t.name, email: t.email }))}
      />

      <AdminCoursesTable courses={courseRows} teachers={teacherOptions} />
    </div>
  );
}
