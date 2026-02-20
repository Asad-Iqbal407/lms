import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/server/db";
import { AssignmentModel } from "@/server/models/Assignment";
import { CourseModel } from "@/server/models/Course";
import { EnrollmentModel } from "@/server/models/Enrollment";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const course = await CourseModel.findById(courseId).lean();
  if (!course) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (session.user.role === "admin") {
    const assignments = await AssignmentModel.find({ courseId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, assignments });
  }

  if (session.user.role === "teacher") {
    if (String(course.teacherId) !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const assignments = await AssignmentModel.find({ courseId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, assignments });
  }

  const enrollment = await EnrollmentModel.findOne({ courseId, studentId: session.user.id }).lean();
  if (!enrollment) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const assignments = await AssignmentModel.find({ courseId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, assignments });
}

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  dueAt: z.string().datetime().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  await connectToDatabase();
  const course = await CourseModel.findById(courseId).lean();
  if (!course) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (session.user.role === "teacher" && String(course.teacherId) !== session.user.id) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const assignment = await AssignmentModel.create({
    courseId,
    title: parsed.data.title,
    description: parsed.data.description,
    dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
    createdById: session.user.id,
  });

  return NextResponse.json({ ok: true, assignment });
}

