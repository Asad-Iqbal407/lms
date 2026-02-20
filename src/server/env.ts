import "server-only";
import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
});

let cached: z.infer<typeof envSchema> | null = null;

export function getServerEnv() {
  if (cached) return cached;
  cached = envSchema.parse({
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  });
  return cached;
}
