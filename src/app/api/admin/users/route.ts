import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/server/db";
import { UserModel } from "@/server/models/User";
import type { Role } from "@/types/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  await connectToDatabase();
  const users = await UserModel.find({})
    .select({ passwordHash: 0 })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, users });
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "teacher", "admin"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  await connectToDatabase();
  const existing = await UserModel.findOne({ email: parsed.data.email }).lean();
  if (existing) return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await UserModel.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: parsed.data.role as Role,
  });

  return NextResponse.json({
    ok: true,
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
  });
}

