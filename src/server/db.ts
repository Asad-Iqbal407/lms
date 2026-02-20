import "server-only";
import mongoose from "mongoose";
import { getServerEnv } from "@/server/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

function normalizeMongoUri(uri: string) {
  return uri.replace(/:<(.*?)>@/g, ":$1@");
}

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  const env = getServerEnv();
  const mongoUri = normalizeMongoUri(env.MONGODB_URI);

  for (let attempt = 0; attempt < 2; attempt++) {
    if (!cache.promise) {
      cache.promise = mongoose.connect(mongoUri, { bufferCommands: false }).then((m) => m);
    }

    try {
      cache.conn = await cache.promise;
      return cache.conn;
    } catch (err) {
      cache.promise = null;
      cache.conn = null;
      if (attempt === 1) throw err;
    }
  }

  throw new Error("Failed to connect to MongoDB");
}
