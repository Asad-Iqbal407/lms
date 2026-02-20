import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/server/db";
import { UserModel } from "@/server/models/User";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await UserModel.findOne({ email: parsed.data.email }).lean();
    if (existing) {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await UserModel.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "student",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isAuthError = /bad auth|authentication failed/i.test(message);

    return NextResponse.json(
      {
        ok: false,
        error: isAuthError
          ? "Database authentication failed. Check MONGODB_URI username/password and Atlas IP Access List."
          : "Registration failed due to a server error.",
      },
      { status: 500 }
    );
  }
}
