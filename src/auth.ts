import NextAuth, { type NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/server/db";
import { UserModel } from "@/server/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        await connectToDatabase();
        const user = await UserModel.findOne({ email: parsed.data.email }).lean();
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return { id: String(user._id), email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.uid = (user as { id?: string }).id;
        token.role = (user as { role?: "student" | "teacher" | "admin" }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = String(token.uid ?? "");
        session.user.role = token.role ?? "student";
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

export default NextAuth(authOptions);
