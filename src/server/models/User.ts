import mongoose, { type Model, type Types } from "mongoose";
import type { Role } from "@/types/auth";

export type UserDoc = {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new mongoose.Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ["student", "teacher", "admin"] },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc> | undefined) ?? mongoose.model<UserDoc>("User", userSchema);

