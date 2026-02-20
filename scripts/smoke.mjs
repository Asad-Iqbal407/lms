import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

const db = mongoose.connection.db;
if (!db) throw new Error("No db handle");

const courses = db.collection("courses");
const users = db.collection("users");
const enrollments = db.collection("enrollments");

const totalCourses = await courses.countDocuments({});
const offeredCourses = await courses.countDocuments({ isOffered: { $ne: false } });

const sampleCourse = await courses.findOne({ isOffered: { $ne: false } }, { projection: { _id: 1, code: 1 } });
if (!sampleCourse) throw new Error("No offered course found");

const email = `enrolltest-${Date.now()}@uog.test`;
await users.insertOne({
  email,
  name: "Enroll Test",
  role: "student",
  passwordHash: "x",
  createdAt: new Date(),
  updatedAt: new Date(),
});
const user = await users.findOne({ email }, { projection: { _id: 1 } });
if (!user) throw new Error("Failed to create student");

await enrollments.updateOne(
  { courseId: sampleCourse._id, studentId: user._id },
  { $setOnInsert: { courseId: sampleCourse._id, studentId: user._id, createdAt: new Date(), updatedAt: new Date() } },
  { upsert: true }
);

const myEnrollment = await enrollments.find({ studentId: user._id }).toArray();
const myCourseIds = myEnrollment.map((e) => e.courseId);
const myCourses = await courses.find({ _id: { $in: myCourseIds } }, { projection: { code: 1 } }).toArray();

console.log(
  JSON.stringify({
    totalCourses,
    offeredCourses,
    enrolledCount: myCourses.length,
    enrolledCodes: myCourses.map((c) => c.code),
  })
);

await mongoose.disconnect();

