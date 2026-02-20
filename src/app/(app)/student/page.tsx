import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { EnrollmentModel } from "@/server/models/Enrollment";
import { CourseModel } from "@/server/models/Course";
import { AssignmentModel } from "@/server/models/Assignment";

export default async function StudentHomePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "student") redirect("/dashboard");

  await connectToDatabase();

  const enrollments = await EnrollmentModel.find({ studentId: session.user.id }).select("courseId").lean();
  const courseIds = enrollments.map((e) => e.courseId);

  const [myCourses, upcoming] = await Promise.all([
    courseIds.length ? CourseModel.find({ _id: { $in: courseIds } }).sort({ createdAt: -1 }).lean() : [],
    courseIds.length
      ? AssignmentModel.find({ courseId: { $in: courseIds }, dueAt: { $ne: null } })
          .sort({ dueAt: 1 })
          .limit(6)
          .lean()
      : [],
  ]);

  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingCount = courseIds.length
    ? await AssignmentModel.countDocuments({ courseId: { $in: courseIds }, dueAt: { $gte: now, $lte: soon } })
    : 0;

  const courseMap = new Map(myCourses.map((c) => [String(c._id), c]));

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 p-8 text-white md:p-12">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-green-500/20 to-transparent blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Welcome back, {session.user.name?.split(' ')[0]}!</h1>
          <p className="mt-4 max-w-lg text-lg text-zinc-400">
            You have <span className="font-bold text-white">{upcomingCount}</span> assignments due in the next 7 days. Keep up the great work!
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/student/courses"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 shadow-xl shadow-white/5"
            >
              Continue Learning
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="group rounded-[2rem] border border-zinc-100 bg-zinc-50/50 p-6 transition hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 transition group-hover:scale-110">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">{myCourses.length}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">My Subjects</div>
        </div>

        <div className="group rounded-[2rem] border border-zinc-100 bg-zinc-50/50 p-6 transition hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition group-hover:scale-110">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">{upcomingCount}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Due Soon</div>
        </div>

        <div className="group rounded-[2rem] border border-zinc-100 bg-zinc-50/50 p-6 transition hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-110">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">{upcoming.length}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Assignments</div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-zinc-100 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">My Subjects</h2>
            <Link href="/student/courses" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition">View All</Link>
          </div>
          <div className="mt-8 space-y-4">
            {myCourses.length ? (
              myCourses.slice(0, 4).map((c, i) => (
                <Link
                  key={String(c._id)}
                  href={`/student/courses/${c._id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-zinc-50 p-4 transition hover:bg-zinc-50"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-lg
                    ${i % 3 === 0 ? 'bg-indigo-500 shadow-indigo-100' : i % 3 === 1 ? 'bg-emerald-500 shadow-emerald-100' : 'bg-orange-500 shadow-orange-100'}`}>
                    {c.code.split('-')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-zinc-900">{c.title}</div>
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">{c.code}</div>
                  </div>
                  <svg className="h-5 w-5 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-zinc-400">
                No subjects yet. Explore the catalog to enroll.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-zinc-100 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Upcoming Deadlines</h2>
            <Link href="/student/assignments" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition">View All</Link>
          </div>
          <div className="mt-8 space-y-4">
            {upcoming.length ? (
              upcoming.slice(0, 4).map((a) => {
                const course = courseMap.get(String(a.courseId));
                const due = a.dueAt instanceof Date ? a.dueAt : a.dueAt ? new Date(a.dueAt as unknown as string) : null;
                const isOverdue = due && due < now;
                return (
                  <div key={String(a._id)} className="flex items-center gap-4 rounded-2xl border border-zinc-50 p-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2
                      ${isOverdue ? 'border-red-100 bg-red-50 text-red-600' : 'border-orange-100 bg-orange-50 text-orange-600'}`}>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-zinc-900">{a.title}</div>
                      <div className="truncate text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                        {course ? course.code : 'General'} • {due ? due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                      </div>
                    </div>
                    {isOverdue && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 uppercase">Overdue</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-zinc-400">
                No upcoming deadlines. You&apos;re all caught up!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
