import mongoose, { type Model, type Types } from "mongoose";

export type CourseDoc = {
  _id: Types.ObjectId;
  code: string;
  title: string;
  description?: string;
  teacherId: Types.ObjectId;
  isOffered: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const courseSchema = new mongoose.Schema<CourseDoc>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    teacherId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    isOffered: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const CourseModel: Model<CourseDoc> =
  (mongoose.models.Course as Model<CourseDoc> | undefined) ??
  mongoose.model<CourseDoc>("Course", courseSchema);
