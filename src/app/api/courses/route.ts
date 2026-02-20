import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/server/db";
import { CourseModel } from "@/server/models/Course";
import { EnrollmentModel } from "@/server/models/Enrollment";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();

  if (session.user.role === "admin") {
    const courses = await CourseModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, courses });
  }

  if (session.user.role === "teacher") {
    const courses = await CourseModel.find({ teacherId: session.user.id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, courses });
  }

  const enrollments = await EnrollmentModel.find({ studentId: session.user.id }).select("courseId").lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await CourseModel.find({ _id: { $in: courseIds } }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, courses });
}

const createSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional(),
  teacherId: z.string().optional(),
  isOffered: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "student") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  await connectToDatabase();

  const teacherId = session.user.role === "teacher" ? session.user.id : parsed.data.teacherId;
  if (!teacherId) return NextResponse.json({ ok: false, error: "teacherId required" }, { status: 400 });

  const course = await CourseModel.create({
    code: parsed.data.code,
    title: parsed.data.title,
    description: parsed.data.description,
    teacherId,
    isOffered: parsed.data.isOffered ?? true,
  });

  return NextResponse.json({ ok: true, course });
}
