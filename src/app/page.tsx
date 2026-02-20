import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import HeroSlider from "@/components/landing/HeroSlider";
import { connectToDatabase } from "@/server/db";
import { AssignmentModel } from "@/server/models/Assignment";
import { CourseModel } from "@/server/models/Course";
import { EnrollmentModel } from "@/server/models/Enrollment";
import { UserModel } from "@/server/models/User";

const numberFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const formatCount = (value: number | null) =>
  value === null ? "—" : numberFormatter.format(value);

const formatDate = (value: Date) => dateFormatter.format(value);

type CourseHighlight = {
  code: string;
  title: string;
  meta: string;
};

const featurePillars = [
  {
    title: "Unified Student Hub",
    description:
      "One home for schedules, tasks, grades, and progress with real-time updates.",
    tone: "bg-emerald-100 text-emerald-700",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    title: "Smart Assignments",
    description:
      "Rubrics, auto-grading, plagiarism checks, and iterative feedback loops.",
    tone: "bg-sky-100 text-sky-700",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Live Classrooms",
    description:
      "Integrated video, attendance, polls, and whiteboards for hybrid teaching.",
    tone: "bg-amber-100 text-amber-700",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-2 6H5a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    title: "Adaptive Learning Paths",
    description:
      "Personalized paths that unlock modules based on mastery and pace.",
    tone: "bg-rose-100 text-rose-700",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 6l6-2 6 2v12l-6-2-6 2-6-2V4l6 2z"
        />
      </svg>
    ),
  },
  {
    title: "Collaboration Spaces",
    description:
      "Group workspaces, peer review, and social learning channels.",
    tone: "bg-teal-100 text-teal-700",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20v-2a4 4 0 00-3-3.87m-4 0A4 4 0 007 18v2m10-10a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    title: "Mobile and Offline",
    description:
      "Download modules, sync notes, and keep learning with spotty connectivity.",
    tone: "bg-lime-100 text-lime-700",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm5 15h.01"
        />
      </svg>
    ),
  },
];
const modules = [
  {
    title: "Course Studio",
    description: "Drag-and-drop syllabus builder with reusable templates.",
    tag: "Authoring",
  },
  {
    title: "Assessment Engine",
    description: "Question banks, timed exams, and analytics on mastery.",
    tag: "Assessment",
  },
  {
    title: "Gradebook",
    description: "Weighted scoring, grade release controls, and exports.",
    tag: "Evaluation",
  },
  {
    title: "Attendance",
    description: "QR check-ins, seating charts, and auto alerts.",
    tag: "Engagement",
  },
  {
    title: "Office Hours",
    description: "Booking, queues, and shared meeting notes.",
    tag: "Support",
  },
  {
    title: "Portfolio Builder",
    description: "Collect work, showcase skills, and export CV-ready pages.",
    tag: "Career",
  },
  {
    title: "Research Library",
    description: "Shared repositories, citations, and reading lists.",
    tag: "Library",
  },
  {
    title: "Academic Integrity",
    description: "Identity checks, proctoring, and plagiarism detection.",
    tag: "Security",
  },
];

const fallbackCourseHighlights: CourseHighlight[] = [];

const pathSteps = [
  {
    title: "Orientation",
    detail: "Baseline diagnostics, onboarding tasks, and goal setting.",
  },
  {
    title: "Core Modules",
    detail: "Weekly lessons with checkpoints, labs, and quizzes.",
  },
  {
    title: "Applied Practice",
    detail: "Peer review, case studies, and project sprints.",
  },
  {
    title: "Capstone",
    detail: "Portfolio deliverable with faculty review and feedback.",
  },
];

const communityTools = [
  "Persistent discussion threads with teaching assistant moderation",
  "Team workspaces with shared docs, tasks, and file staging",
  "Peer feedback cycles with structured rubrics",
  "Mentor office hours and advisor scheduling",
  "Student clubs and cohort channels",
];
const testimonials = [
  {
    quote:
      "The new LMS made it easy to keep up with assignments and see how I was progressing week by week.",
    name: "Ayesha Malik",
    role: "BS Computer Science",
  },
  {
    quote:
      "Grading time dropped by half. The rubric tools and feedback workflows are the best we have used.",
    name: "Dr. Umar Khan",
    role: "Faculty, Business School",
  },
];

const accessBase = [
  {
    key: "student",
    name: "Students",
    description: "Self-register to join courses, track progress, and submit work.",
    features: ["Course enrollments", "Assignment submissions", "Progress tracking", "Mobile access"],
    cta: { label: "Create account", href: "/register" },
  },
  {
    key: "teacher",
    name: "Faculty",
    description: "Create courses, publish content, and deliver feedback at scale.",
    features: ["Course authoring", "Assignments and grading", "Office hours", "Learning analytics"],
    cta: { label: "Request access", href: "/login" },
  },
  {
    key: "admin",
    name: "Administrators",
    description: "Manage users, policies, and institution-wide reporting.",
    features: ["User management", "Role controls", "Audit trails", "Data exports"],
    cta: { label: "Contact IT", href: "/login" },
  },
];

const integrations = [
  "Google Workspace",
  "Microsoft 365",
  "Zoom",
  "Microsoft Teams",
  "Turnitin",
  "SIS Sync",
  "Library SSO",
  "Calendar Feeds",
];

const securityFeatures = [
  "Role-based access control with granular permissions",
  "Single sign-on with MFA and session monitoring",
  "Data residency options and automated backups",
  "Audit trails for grades, content, and approvals",
];


const faqs = [
  {
    question: "Can we migrate existing courses and archives?",
    answer:
      "Yes. We provide bulk imports, structured templates, and migration support for past terms.",
  },
  {
    question: "Does the LMS support hybrid and in-person classes?",
    answer:
      "Yes. Attendance, live sessions, and classroom tools work together for blended teaching.",
  },
  {
    question: "How do faculty manage grading at scale?",
    answer:
      "Auto-grading, rubrics, and reusable feedback snippets are built into the gradebook.",
  },
  {
    question: "What security standards do you follow?",
    answer:
      "We support MFA, access controls, audit logs, and role-based data policies.",
  },
  {
    question: "Can students access content on mobile?",
    answer:
      "Yes. The platform is responsive with offline support for key resources.",
  },
];
export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  let stats = [
    { value: "—", label: "Students", detail: "Active learner accounts" },
    { value: "—", label: "Faculty", detail: "Instructors and advisors" },
    { value: "—", label: "Courses", detail: "Active this term" },
    { value: "—", label: "Enrollments", detail: "Course enrollments" },
  ];
  let trustedByLine = "Serving the University of Gujrat learning community.";
  let courseHighlights = fallbackCourseHighlights;
  let recentUpdates: { title: string; date: string }[] = [];
  let accessLevels = accessBase.map((item) => ({ ...item, count: "—" }));
  let analyticsMetrics = [
    { label: "Active courses", value: "—", trend: "Active this term" },
    { label: "Assignments", value: "—", trend: "Across all courses" },
    { label: "Enrollments", value: "—", trend: "Active enrollments" },
  ];
  let accountMix = [
    { label: "Students", value: 0 },
    { label: "Faculty", value: 0 },
    { label: "Admins", value: 0 },
  ];
  let courseStatus = [
    { label: "Active courses", value: 0, color: "bg-[var(--accent)]" },
    { label: "Archived courses", value: 0, color: "bg-[var(--accent-warm)]" },
  ];

  try {
    await connectToDatabase();
    const [
      students,
      teachers,
      admins,
      activeCourses,
      totalCourses,
      enrollments,
      assignments,
    ] = await Promise.all([
      UserModel.countDocuments({ role: "student" }),
      UserModel.countDocuments({ role: "teacher" }),
      UserModel.countDocuments({ role: "admin" }),
      CourseModel.countDocuments({ isOffered: { $ne: false } }),
      CourseModel.countDocuments({}),
      EnrollmentModel.countDocuments({}),
      AssignmentModel.countDocuments({}),
    ]);

    stats = [
      { value: formatCount(students), label: "Students", detail: "Active learner accounts" },
      { value: formatCount(teachers), label: "Faculty", detail: "Instructors and advisors" },
      { value: formatCount(activeCourses), label: "Courses", detail: "Active this term" },
      { value: formatCount(enrollments), label: "Enrollments", detail: "Course enrollments" },
    ];

    trustedByLine = `${formatCount(teachers)} faculty leading ${formatCount(
      activeCourses
    )} active courses for ${formatCount(students)} learners`;

    accessLevels = accessBase.map((item) => {
      const count =
        item.key === "student" ? students : item.key === "teacher" ? teachers : admins;
      return { ...item, count: formatCount(count) };
    });

    analyticsMetrics = [
      { label: "Active courses", value: formatCount(activeCourses), trend: "Active this term" },
      { label: "Assignments", value: formatCount(assignments), trend: "Across all courses" },
      { label: "Enrollments", value: formatCount(enrollments), trend: "Active enrollments" },
    ];

    const totalUsers = students + teachers + admins;
    const toPercent = (count: number) =>
      totalUsers === 0 ? 0 : Math.round((count / totalUsers) * 100);

    accountMix = [
      { label: "Students", value: toPercent(students) },
      { label: "Faculty", value: toPercent(teachers) },
      { label: "Admins", value: toPercent(admins) },
    ];

    const archivedCourses = Math.max(0, totalCourses - activeCourses);
    const toCoursePercent = (count: number) =>
      totalCourses === 0 ? 0 : Math.round((count / totalCourses) * 100);

    courseStatus = [
      { label: "Active courses", value: toCoursePercent(activeCourses), color: "bg-[var(--accent)]" },
      { label: "Archived courses", value: toCoursePercent(archivedCourses), color: "bg-[var(--accent-warm)]" },
    ];

    const recentCourses = await CourseModel.find({ isOffered: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("code title createdAt")
      .lean();

    if (recentCourses.length > 0) {
      recentUpdates = recentCourses.map((course) => ({
        title: `${course.code} · ${course.title}`,
        date: formatDate(new Date(course.createdAt)),
      }));
    }

    const highlightCourses = await CourseModel.find({ isOffered: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(4)
      .select("code title createdAt")
      .lean();

    if (highlightCourses.length > 0) {
      courseHighlights = highlightCourses.map((course) => ({
        code: course.code,
        title: course.title,
        meta: `Added ${formatDate(new Date(course.createdAt))}`,
      }));
    }
  } catch {
    // Keep fallback content if the database is unavailable.
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 page-bg" />

        <nav className="sticky top-0 z-50 border-b border-[var(--line)]/70 bg-[var(--surface)]/80 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-strong)] text-white shadow-lg shadow-emerald-200/40">
                <span className="text-sm font-semibold">UoG</span>
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">UoG LMS</div>
                <div className="text-[10px] font-semibold text-[var(--ink-muted)] uppercase tracking-[0.3em]">
                  University of Gujrat
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-6 text-sm font-semibold text-[var(--ink-muted)] lg:flex">
              <Link href="#features" className="transition hover:text-[var(--ink)]">
                Features
              </Link>
              <Link href="#platform" className="transition hover:text-[var(--ink)]">
                Platform
              </Link>
              <Link href="#courses" className="transition hover:text-[var(--ink)]">
                Courses
              </Link>
              <Link href="#community" className="transition hover:text-[var(--ink)]">
                Community
              </Link>
              <Link href="#access" className="transition hover:text-[var(--ink)]">
                Access
              </Link>
              <Link href="#faq" className="transition hover:text-[var(--ink)]">
                FAQ
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition hover:bg-[var(--accent-strong)]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        <main className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-10">
          <section className="animate-fade-in">
            <HeroSlider />
          </section>

          <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="animate-fade-up rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)]/80 p-5 shadow-sm"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="font-display text-2xl font-semibold text-[var(--ink)]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-semibold text-[var(--ink)]">
                  {stat.label}
                </div>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">{stat.detail}</p>
              </div>
            ))}
          </section>

          <section className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)]/70 px-6 py-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Platform snapshot
              </div>
              <div className="font-display text-lg text-[var(--ink)]">
                {trustedByLine}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--ink-muted)]">
              {[
                "Engineering",
                "Medical Sciences",
                "Business",
                "Education",
                "Law",
                "Arts",
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-1"
                >
                  {label}
                </span>
              ))}
            </div>
          </section>
          <section id="features" className="mt-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                  Why UoG LMS
                </p>
                <h2 className="font-display mt-3 text-3xl font-semibold md:text-4xl">
                  A platform that keeps every role aligned
                </h2>
              </div>
              <p className="max-w-xl text-sm text-[var(--ink-muted)]">
                Designed for students, teachers, and administrators with tools that cover
                instruction, assessment, and student success from day one.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featurePillars.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group animate-fade-up rounded-3xl border border-[var(--line)] bg-[var(--surface-soft)]/80 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.tone}`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-[var(--ink)]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm text-[var(--ink-muted)]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="platform"
            className="mt-20 rounded-[40px] border border-[var(--line)] bg-[var(--surface-soft)]/90 p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)]"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                  Platform modules
                </p>
                <h2 className="font-display mt-3 text-3xl font-semibold md:text-4xl">
                  Everything you need to run a modern campus
                </h2>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--line)] bg-white px-5 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5"
              >
                Explore the platform
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {modules.map((module, index) => (
                <div
                  key={module.title}
                  className="animate-fade-up rounded-3xl border border-[var(--line)] bg-white/80 p-6 shadow-sm"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    {module.tag}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">
                    {module.title}
                  </h3>
                  <p className="mt-3 text-sm text-[var(--ink-muted)]">
                    {module.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section id="courses" className="mt-20 grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Course catalog
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold md:text-4xl">
                Curated courses and rich learning paths
              </h2>
              <p className="mt-4 text-sm text-[var(--ink-muted)]">
                Surface the best of each department with structured modules, labs, and
                practical work that build real skills.
              </p>

              <div className="mt-8 grid gap-4">
                {courseHighlights.length > 0 ? (
                  courseHighlights.map((course) => (
                    <div
                      key={course.code}
                      className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)]/80 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                            {course.code}
                          </div>
                          <div className="mt-2 text-lg font-semibold text-[var(--ink)]">
                            {course.title}
                          </div>
                        </div>
                        <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--ink-muted)]">
                          {course.meta}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-xs text-[var(--ink-muted)]">
                    No courses available yet. Create a course to populate this list.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-soft)]/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                    Guided path
                  </p>
                  <h3 className="font-display mt-3 text-2xl font-semibold">
                    From onboarding to capstone
                  </h3>
                </div>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-[var(--accent)]"
                >
                  Build a path
                </Link>
              </div>

              <div className="mt-6 grid gap-4">
                {pathSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-[var(--line)] bg-white/80 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-[var(--ink)]">
                          {step.title}
                        </div>
                        <p className="mt-1 text-sm text-[var(--ink-muted)]">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/70 p-5">
                <div className="text-sm font-semibold text-[var(--ink)]">
                  Course status
                </div>
                <div className="mt-3 grid gap-3 text-xs font-semibold text-[var(--ink-muted)]">
                  {courseStatus.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section id="community" className="mt-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-soft)]/90 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Community and engagement
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold">
                Build a campus community that feels close
              </h2>
              <p className="mt-4 text-sm text-[var(--ink-muted)]">
                Keep students connected with structured collaboration, guided feedback,
                and academic support built into daily workflows.
              </p>

              <ul className="mt-6 grid gap-3 text-sm text-[var(--ink-muted)]">
                {communityTools.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-3xl border border-[var(--line)] bg-white/80 p-6 shadow-sm"
                >
                  <p className="text-sm text-[var(--ink-muted)]">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-4 text-sm font-semibold text-[var(--ink)]">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-[var(--ink-muted)]">
                    {testimonial.role}
                  </div>
                </div>
              ))}

              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-soft)]/90 p-6">
                <div className="text-sm font-semibold text-[var(--ink)]">Recent updates</div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--ink-muted)]">
                  {recentUpdates.length > 0 ? (
                    recentUpdates.map((event) => (
                      <div
                        key={event.title}
                        className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3"
                      >
                        <span>{event.title}</span>
                        <span className="text-xs font-semibold text-[var(--accent)]">
                          {event.date}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-xs">
                      No recent updates yet. New courses will appear here once added.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
          <section id="insights" className="mt-20 grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Insights and analytics
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold md:text-4xl">
                Turn data into action for every learner
              </h2>
              <p className="mt-4 text-sm text-[var(--ink-muted)]">
                Dashboards surface engagement, attendance, and performance trends so
                advisors and faculty can intervene early.
              </p>
              <ul className="mt-6 grid gap-3 text-sm text-[var(--ink-muted)]">
                <li className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3">
                  Real-time heatmaps for course activity and attendance.
                </li>
                <li className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3">
                  At-risk alerts with recommended interventions.
                </li>
                <li className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3">
                  Program-level outcome tracking and reporting.
                </li>
              </ul>
              <Link
                href="/register"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition hover:bg-[var(--accent-strong)]"
              >
                View sample dashboards
              </Link>
            </div>

            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-soft)]/90 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                    Live snapshot
                  </div>
                  <div className="font-display mt-3 text-2xl font-semibold">
                    Learning activity insights
                  </div>
                </div>
                <span className="rounded-full border border-[var(--line)] bg-white px-4 py-1 text-xs font-semibold text-[var(--ink-muted)]">
                  Live data
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {analyticsMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-[var(--line)] bg-white/80 p-5"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                      {metric.label}
                    </div>
                    <div className="mt-2 flex items-end justify-between">
                      <div className="text-2xl font-semibold text-[var(--ink)]">
                        {metric.value}
                      </div>
                      <div className="text-xs font-semibold text-emerald-600">
                        {metric.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/70 p-5">
                <div className="text-sm font-semibold text-[var(--ink)]">
                  Account mix
                </div>
                <div className="mt-3 space-y-4">
                  {accountMix.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-muted)]">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-white">
                        <div
                          className="h-2 rounded-full bg-[var(--accent)]"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section id="integrations" className="mt-20">
            <div className="rounded-[40px] border border-[var(--line)] bg-[var(--surface-soft)]/90 p-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                    Integrations and security
                  </p>
                  <h2 className="font-display mt-3 text-3xl font-semibold md:text-4xl">
                    Works with your existing campus stack
                  </h2>
                </div>
                <span className="rounded-full border border-[var(--line)] bg-white px-4 py-1 text-xs font-semibold text-[var(--ink-muted)]">
                  Secure by design
                </span>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="grid gap-3">
                  <div className="text-sm font-semibold text-[var(--ink)]">
                    Integrations
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--ink-muted)]">
                    {integrations.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-6">
                  <div className="text-sm font-semibold text-[var(--ink)]">Security</div>
                  <ul className="mt-4 grid gap-3 text-sm text-[var(--ink-muted)]">
                    {securityFeatures.map((item) => (
                      <li
                        key={item}
                        className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="access" className="mt-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                  Access levels
                </p>
                <h2 className="font-display mt-3 text-3xl font-semibold md:text-4xl">
                  Role-based access for every campus team
                </h2>
              </div>
              <p className="max-w-xl text-sm text-[var(--ink-muted)]">
                Accounts are provisioned by UoG IT. Counts reflect active accounts in
                the platform today.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {accessLevels.map((level) => (
                <div
                  key={level.name}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-soft)]/90 p-7 shadow-sm transition hover:-translate-y-1"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    {level.name}
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <div className="font-display text-3xl font-semibold text-[var(--ink)]">
                      {level.count}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                      Active accounts
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--ink-muted)]">
                    {level.description}
                  </p>
                  <ul className="mt-6 grid gap-3 text-sm text-[var(--ink-muted)]">
                    {level.features.map((feature) => (
                      <li
                        key={feature}
                        className="rounded-xl border border-[var(--line)] bg-white/80 px-4 py-2"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={level.cta.href}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5"
                  >
                    {level.cta.label}
                  </Link>
                </div>
              ))}
            </div>
          </section>
          <section id="faq" className="mt-20">
            <div className="rounded-[40px] border border-[var(--line)] bg-[var(--surface-soft)]/90 p-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                    FAQ
                  </p>
                  <h2 className="font-display mt-3 text-3xl font-semibold md:text-4xl">
                    Answers to common questions
                  </h2>
                </div>
                <p className="max-w-xl text-sm text-[var(--ink-muted)]">
                  Want a tailored walkthrough for your faculty? We can schedule a live
                  demo and migration review.
                </p>
              </div>

              <div className="mt-8 grid gap-4">
                {faqs.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-2xl border border-[var(--line)] bg-white/80 p-5"
                  >
                    <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
                      {item.question}
                    </summary>
                    <p className="mt-3 text-sm text-[var(--ink-muted)]">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-20">
            <div className="relative overflow-hidden rounded-[40px] bg-[var(--accent-strong)] px-8 py-12 text-white md:px-12">
              <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-[var(--accent-warm)]/30 blur-[80px]" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />

              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  Ready to launch
                </p>
                <h2 className="font-display mt-3 text-3xl font-semibold md:text-4xl">
                  Give every learner a clear path to success
                </h2>
                <p className="mt-4 text-sm text-white/80">
                  Start a pilot program, migrate your courses, and train your faculty in
                  weeks, not months.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[var(--accent-strong)]"
                  >
                    Start a pilot
                  </Link>
                  <form className="flex w-full flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      placeholder="Email for updates"
                      className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Join updates
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[var(--line)] bg-[var(--surface)]/70">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-strong)] text-white">
                  <span className="text-sm font-semibold">UoG</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--ink)]">UoG LMS</div>
                  <div className="text-xs text-[var(--ink-muted)]">University of Gujrat</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-[var(--ink-muted)]">
                A modern learning platform for students, faculty, and administrators.
              </p>
            </div>

            <div className="text-sm text-[var(--ink-muted)]">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink)]">
                Quick links
              </div>
              <div className="mt-4 grid gap-2">
                <Link href="#features">Features</Link>
                <Link href="#platform">Platform</Link>
                <Link href="#courses">Courses</Link>
                <Link href="#community">Community</Link>
              </div>
            </div>

            <div className="text-sm text-[var(--ink-muted)]">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink)]">
                Contact
              </div>
              <div className="mt-4 grid gap-2">
                <span>support@uoglms.edu.pk</span>
                <span>+92 53 3640 000</span>
                <span>Hafiz Hayat Campus, Gujrat</span>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--line)] py-6 text-center text-xs text-[var(--ink-muted)]">
            (c) 2026 University of Gujrat. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
