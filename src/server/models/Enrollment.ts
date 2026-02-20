import mongoose, { type Model, type Types } from "mongoose";

export type EnrollmentDoc = {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const enrollmentSchema = new mongoose.Schema<EnrollmentDoc>(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Course" },
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

export const EnrollmentModel: Model<EnrollmentDoc> =
  (mongoose.models.Enrollment as Model<EnrollmentDoc> | undefined) ??
  mongoose.model<EnrollmentDoc>("Enrollment", enrollmentSchema);

