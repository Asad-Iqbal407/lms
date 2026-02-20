import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { UserModel } from "@/server/models/User";
import { CourseModel } from "@/server/models/Course";
import { EnrollmentModel } from "@/server/models/Enrollment";
import { AssignmentModel } from "@/server/models/Assignment";

export default async function AdminHomePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  await connectToDatabase();

  const [usersTotal, studentsTotal, teachersTotal, adminsTotal] = await Promise.all([
    UserModel.countDocuments({}),
    UserModel.countDocuments({ role: "student" }),
    UserModel.countDocuments({ role: "teacher" }),
    UserModel.countDocuments({ role: "admin" }),
  ]);

  const [coursesTotal, offeredCoursesTotal, enrollmentsTotal, assignmentsTotal] = await Promise.all([
    CourseModel.countDocuments({}),
    CourseModel.countDocuments({ isOffered: { $ne: false } }),
    EnrollmentModel.countDocuments({}),
    AssignmentModel.countDocuments({}),
  ]);

  const [latestUsers, latestCourses] = await Promise.all([
    UserModel.find({}).select({ passwordHash: 0 }).sort({ createdAt: -1 }).limit(6).lean(),
    CourseModel.find({}).sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const now = new Date();
  const updatedLabel = `${dateFormatter.format(now)} ${timeFormatter.format(now)}`;

  const roleBreakdown = [
    {
      label: "Students",
      count: studentsTotal,
      percent: usersTotal === 0 ? 0 : Math.round((studentsTotal / usersTotal) * 100),
      color: "bg-emerald-500",
    },
    {
      label: "Teachers",
      count: teachersTotal,
      percent: usersTotal === 0 ? 0 : Math.round((teachersTotal / usersTotal) * 100),
      color: "bg-blue-500",
    },
    {
      label: "Admins",
      count: adminsTotal,
      percent: usersTotal === 0 ? 0 : Math.round((adminsTotal / usersTotal) * 100),
      color: "bg-amber-500",
    },
  ];

  const archivedCoursesTotal = Math.max(0, coursesTotal - offeredCoursesTotal);
  const courseBreakdown = [
    {
      label: "Offered",
      count: offeredCoursesTotal,
      percent: coursesTotal === 0 ? 0 : Math.round((offeredCoursesTotal / coursesTotal) * 100),
      color: "bg-emerald-500",
    },
    {
      label: "Archived",
      count: archivedCoursesTotal,
      percent: coursesTotal === 0 ? 0 : Math.round((archivedCoursesTotal / coursesTotal) * 100),
      color: "bg-amber-500",
    },
  ];

  const roleBadgeStyles: Record<string, string> = {
    student: "border-emerald-200 bg-emerald-50 text-emerald-900",
    teacher: "border-blue-200 bg-blue-50 text-blue-900",
    admin: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">System overview, users, courses, and platform activity.</p>
        <p className="mt-1 text-xs text-zinc-500">Last updated: {updatedLabel}</p>
      </div>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold text-zinc-600">Total users</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{usersTotal}</div>
          <div className="mt-2 text-sm text-zinc-600">
            {studentsTotal} students | {teachersTotal} teachers | {adminsTotal} admins
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold text-zinc-600">Courses</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{coursesTotal}</div>
          <div className="mt-2 text-sm text-zinc-600">{offeredCoursesTotal} offered to students</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold text-zinc-600">Enrollments</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{enrollmentsTotal}</div>
          <div className="mt-2 text-sm text-zinc-600">Active subject registrations</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold text-zinc-600">Assignments</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{assignmentsTotal}</div>
          <div className="mt-2 text-sm text-zinc-600">Published coursework items</div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Quick actions</div>
          <p className="mt-1 text-xs text-zinc-600">Jump to high impact admin tasks.</p>
          <div className="mt-4 grid gap-2">
            <Link
              className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
              href="/admin/users"
            >
              Manage users
              <span className="text-xs text-zinc-500">{usersTotal} total</span>
            </Link>
            <Link
              className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
              href="/admin/courses"
            >
              Manage courses
              <span className="text-xs text-zinc-500">{coursesTotal} total</span>
            </Link>
            <Link
              className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
              href="/admin/settings"
            >
              Platform settings
              <span className="text-xs text-zinc-500">Policies</span>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">User roles</div>
          <p className="mt-1 text-xs text-zinc-600">Distribution of active accounts.</p>
          <div className="mt-4 space-y-3">
            {roleBreakdown.map((role) => (
              <div key={role.label}>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-600">
                  <span>{role.label}</span>
                  <span>
                    {role.count} ({role.percent}%)
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-100">
                  <div className={`h-2 rounded-full ${role.color}`} style={{ width: `${role.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Course status</div>
          <p className="mt-1 text-xs text-zinc-600">Offered vs archived courses.</p>
          <div className="mt-4 space-y-3">
            {courseBreakdown.map((course) => (
              <div key={course.label}>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-600">
                  <span>{course.label}</span>
                  <span>
                    {course.count} ({course.percent}%)
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-100">
                  <div
                    className={`h-2 rounded-full ${course.color}`}
                    style={{ width: `${course.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Latest users</div>
              <div className="text-xs text-zinc-600">Newly created accounts</div>
            </div>
            <Link className="text-sm font-medium text-zinc-900 hover:underline" href="/admin/users">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-zinc-200">
            {latestUsers.map((user) => (
              <div key={String(user._id)} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">{user.name}</div>
                  <div className="text-xs text-zinc-600">{user.email}</div>
                  <div className="mt-1 text-[10px] text-zinc-500">
                    {user.createdAt ? dateFormatter.format(new Date(user.createdAt)) : "-"}
                  </div>
                </div>
                <div
                  className={`rounded-xl border px-3 py-1 text-xs font-semibold ${
                    roleBadgeStyles[user.role] ?? "border-zinc-200 bg-zinc-50 text-zinc-700"
                  }`}
                >
                  {user.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Latest courses</div>
              <div className="text-xs text-zinc-600">Recently created</div>
            </div>
            <Link className="text-sm font-medium text-zinc-900 hover:underline" href="/admin/courses">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-zinc-200">
            {latestCourses.map((course) => (
              <div key={String(course._id)} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-xs font-semibold text-zinc-500">{course.code}</div>
                  <div className="text-sm font-semibold text-zinc-900">{course.title}</div>
                  <div className="mt-1 text-[10px] text-zinc-500">
                    {course.createdAt ? dateFormatter.format(new Date(course.createdAt)) : "-"}
                  </div>
                </div>
                <div
                  className={`rounded-xl border px-3 py-1 text-xs font-semibold ${
                    course.isOffered === false
                      ? "border-zinc-200 bg-zinc-50 text-zinc-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-900"
                  }`}
                >
                  {course.isOffered === false ? "Not offered" : "Offered"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
