import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/server/db";
import { CourseModel } from "@/server/models/Course";
import { EnrollmentModel } from "@/server/models/Enrollment";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "student") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const course = await CourseModel.findById(courseId).lean();
  if (!course) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (course.isOffered === false) {
    return NextResponse.json({ ok: false, error: "Course is not currently offered" }, { status: 409 });
  }

  await EnrollmentModel.updateOne(
    { courseId, studentId: session.user.id },
    { $setOnInsert: { courseId, studentId: session.user.id } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
