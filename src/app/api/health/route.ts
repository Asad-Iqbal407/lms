import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isAuthError = /bad auth|authentication failed/i.test(message);
    return NextResponse.json(
      {
        ok: false,
        error: isAuthError
          ? "Database authentication failed. Check MONGODB_URI username/password and Atlas IP Access List."
          : "Database connection failed. Check MONGODB_URI in .env.local.",
      },
      { status: 500 }
    );
  }
}
