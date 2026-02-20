import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/server/db";
import { CourseModel } from "@/server/models/Course";
import { EnrollmentModel } from "@/server/models/Enrollment";
import EnrollButton from "@/components/courses/EnrollButton";

export default async function StudentCoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "student") redirect("/dashboard");

  await connectToDatabase();

  const enrollments = await EnrollmentModel.find({ studentId: session.user.id }).select("courseId").lean();
  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  const enrolledCourses = enrolledCourseIds.length
    ? await CourseModel.find({ _id: { $in: enrolledCourseIds } }).sort({ createdAt: -1 }).lean()
    : [];

  const catalogCourses = await CourseModel.find({
    isOffered: { $ne: false },
    _id: { $nin: enrolledCourseIds },
  })
    .sort({ createdAt: -1 })
    .lean();

  const courseImages = [
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=800&auto=format&fit=crop",
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="mt-2 text-zinc-500">Explore the offered UoG courses catalog and manage your enrolled subjects.</p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-6 w-1.5 rounded-full bg-zinc-900" />
          <h2 className="text-xl font-bold">My Enrolled Subjects</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.length ? (
            enrolledCourses.map((c, i) => (
              <Link
                key={String(c._id)}
                href={`/student/courses/${c._id}`}
                className="group overflow-hidden rounded-[2rem] border border-zinc-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50"
              >
                <div 
                  className="h-32 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${courseImages[i % courseImages.length]}')` }}
                >
                  <div className="h-full w-full bg-zinc-900/20" />
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{c.code}</div>
                  <h3 className="mt-2 text-lg font-bold text-zinc-900">{c.title}</h3>
                  {c.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-zinc-500 leading-relaxed">
                      {c.description}
                    </p>
                  ) : null}
                  <div className="mt-6 flex items-center gap-2 text-sm font-bold text-zinc-900">
                    Go to Subject
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4 4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-[2rem] border-2 border-dashed border-zinc-100 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="mt-4 font-bold text-zinc-400">No enrolled subjects yet.</p>
              <p className="mt-1 text-sm text-zinc-400">Enroll from the catalog below to start learning.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-6 w-1.5 rounded-full bg-zinc-900" />
          <h2 className="text-xl font-bold">Course Catalog</h2>
        </div>
        <div className="grid gap-6">
          {catalogCourses.length ? (
            catalogCourses.map((c, i) => (
              <div
                key={String(c._id)}
                className="group flex flex-col overflow-hidden rounded-[2rem] border border-zinc-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 md:flex-row"
              >
                <div 
                  className="h-48 w-full shrink-0 bg-cover bg-center md:h-auto md:w-64"
                  style={{ backgroundImage: `url('${courseImages[(i + 2) % courseImages.length]}')` }}
                />
                <div className="flex flex-1 flex-col justify-between p-8">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{c.code}</div>
                    <h3 className="mt-2 text-2xl font-bold text-zinc-900">{c.title}</h3>
                    {c.description ? (
                      <p className="mt-4 text-zinc-500 leading-relaxed">
                        {c.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-zinc-50 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Available for Enrollment</span>
                    </div>
                    <EnrollButton courseId={String(c._id)} enrolled={false} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[2rem] border-2 border-dashed border-zinc-100 p-12 text-center text-zinc-400 font-bold">
              No new courses available in the catalog right now.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
