import mongoose, { type Model, type Types } from "mongoose";

export type AssignmentDoc = {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  description?: string;
  dueAt?: Date;
  createdById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const assignmentSchema = new mongoose.Schema<AssignmentDoc>(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Course" },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    dueAt: { type: Date, required: false },
    createdById: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

assignmentSchema.index({ courseId: 1, createdAt: -1 });

export const AssignmentModel: Model<AssignmentDoc> =
  (mongoose.models.Assignment as Model<AssignmentDoc> | undefined) ??
  mongoose.model<AssignmentDoc>("Assignment", assignmentSchema);

