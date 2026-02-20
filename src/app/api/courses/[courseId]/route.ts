import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/server/db";
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

  if (session.user.role === "admin") return NextResponse.json({ ok: true, course });
  if (session.user.role === "teacher" && String(course.teacherId) === session.user.id) {
    return NextResponse.json({ ok: true, course });
  }

  const enrollment = await EnrollmentModel.findOne({ courseId, studentId: session.user.id }).lean();
  if (!enrollment) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ ok: true, course });
}

const patchSchema = z.object({
  isOffered: z.boolean(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  await connectToDatabase();

  const course = await CourseModel.findByIdAndUpdate(
    courseId,
    { $set: { isOffered: parsed.data.isOffered } },
    { new: true }
  ).lean();

  if (!course) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, course });
}
