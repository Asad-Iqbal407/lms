import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

dotenv.config({ path: ".env.local" });
dotenv.config();

const mongodbUri = process.env.MONGODB_URI;
const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const adminName = process.env.SEED_ADMIN_NAME ?? "UoG Admin";
const seedSampleCourses =
  process.argv.includes("--sample-courses") || process.env.SEED_SAMPLE_COURSES === "1";
const seedDemo = process.argv.includes("--demo") || process.env.SEED_DEMO === "1";
const teacherEmail = process.env.SEED_TEACHER_EMAIL ?? "teacher@uog.edu.pk";
const generatePassword = () => randomBytes(12).toString("base64url");
const teacherPassword = process.env.SEED_TEACHER_PASSWORD ?? generatePassword();
const teacherName = process.env.SEED_TEACHER_NAME ?? "UoG Teacher";
const demoStudentPassword = process.env.SEED_DEMO_STUDENT_PASSWORD ?? generatePassword();
const demoStudentCount = Number(process.env.SEED_DEMO_STUDENT_COUNT ?? "12");

if (!mongodbUri) {
  throw new Error("MONGODB_URI is required");
}
if (!adminEmail || !adminPassword) {
  throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required");
}

await mongoose.connect(mongodbUri, { bufferCommands: false });

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ["student", "teacher", "admin"] },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User ?? mongoose.model("User", userSchema);

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    teacherId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    isOffered: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const enrollmentSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Course" },
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

const assignmentSchema = new mongoose.Schema(
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

const Course = mongoose.models.Course ?? mongoose.model("Course", courseSchema);
const Enrollment = mongoose.models.Enrollment ?? mongoose.model("Enrollment", enrollmentSchema);
const Assignment = mongoose.models.Assignment ?? mongoose.model("Assignment", assignmentSchema);

const passwordHash = await bcrypt.hash(adminPassword, 12);

await User.updateOne(
  { email: adminEmail },
  { $set: { name: adminName, role: "admin", passwordHash } },
  { upsert: true }
);

console.log(`Seeded admin: ${adminEmail}`);

if (seedSampleCourses || seedDemo) {
  const teacherHash = await bcrypt.hash(teacherPassword, 12);
  await User.updateOne(
    { email: teacherEmail },
    { $set: { name: teacherName, role: "teacher", passwordHash: teacherHash } },
    { upsert: true }
  );

  const teacher = await User.findOne({ email: teacherEmail }).lean();
  if (!teacher) throw new Error("Failed to create teacher user for seeding courses");

  const courses = [
    { code: "CS-101", title: "Introduction to Programming", description: "Basics of programming and problem solving." },
    { code: "CS-102", title: "Discrete Mathematics", description: "Logic, sets, relations, and combinatorics." },
    { code: "CS-201", title: "Data Structures", description: "Arrays, linked lists, stacks, queues, trees, graphs." },
    { code: "CS-202", title: "Database Systems", description: "Relational model, SQL, normalization, transactions." },
    { code: "ENG-101", title: "English Composition", description: "Academic writing and communication skills." },
  ];

  for (const c of courses) {
    await Course.updateOne(
      { code: c.code },
      {
        $set: {
          code: c.code,
          title: c.title,
          description: c.description,
          teacherId: teacher._id,
          isOffered: true,
        },
      },
      { upsert: true }
    );
  }

  console.log(`Seeded teacher: ${teacherEmail}`);
  if (!process.env.SEED_TEACHER_PASSWORD) console.log(`Generated teacher password (shown once): ${teacherPassword}`);
  console.log(`Seeded offered courses: ${courses.length}`);
}

if (seedDemo) {
  const teachers = [
    { email: teacherEmail, name: teacherName, password: teacherPassword },
    { email: "teacher2@uog.edu.pk", name: "UoG Teacher (CS Dept)", password: teacherPassword },
  ];

  for (const t of teachers) {
    const hash = await bcrypt.hash(t.password, 12);
    await User.updateOne(
      { email: t.email },
      { $set: { email: t.email, name: t.name, role: "teacher", passwordHash: hash } },
      { upsert: true }
    );
  }

  const teacherDocs = await User.find({ role: "teacher" }).lean();
  const teacherByEmail = new Map(teacherDocs.map((t) => [t.email, t]));
  const t1 = teacherByEmail.get(teacherEmail);
  const t2 = teacherByEmail.get("teacher2@uog.edu.pk");
  if (!t1 || !t2) throw new Error("Failed to load teacher users for demo seeding");

  const extraCourses = [
    { code: "CS-203", title: "Object Oriented Programming", description: "Classes, objects, inheritance, and design." },
    { code: "CS-301", title: "Operating Systems", description: "Processes, memory, scheduling, and file systems." },
    { code: "MTH-101", title: "Calculus I", description: "Limits, derivatives, and integrals." },
  ];

  for (const c of extraCourses) {
    const teacherId = c.code.startsWith("CS-3") ? t2._id : t1._id;
    await Course.updateOne(
      { code: c.code },
      {
        $set: {
          code: c.code,
          title: c.title,
          description: c.description,
          teacherId,
          isOffered: true,
        },
      },
      { upsert: true }
    );
  }

  await Course.updateOne({ code: "ENG-101" }, { $set: { isOffered: false } });

  const studentHash = await bcrypt.hash(demoStudentPassword, 12);
  const students = [
    { name: "Ayesha Iqbal", email: "ayesha.iqbal@uog.edu.pk" },
    { name: "Ali Raza", email: "ali.raza@uog.edu.pk" },
    { name: "Hira Khan", email: "hira.khan@uog.edu.pk" },
    { name: "Usman Ahmed", email: "usman.ahmed@uog.edu.pk" },
    { name: "Fatima Noor", email: "fatima.noor@uog.edu.pk" },
    { name: "Hamza Ali", email: "hamza.ali@uog.edu.pk" },
  ];

  const extraCount = Math.max(0, demoStudentCount - students.length);
  for (let i = 0; i < extraCount; i++) {
    const n = i + 1;
    students.push({ name: `UoG Student ${n}`, email: `student${n}@uog.edu.pk` });
  }

  for (const s of students) {
    await User.updateOne(
      { email: s.email },
      { $set: { email: s.email, name: s.name, role: "student", passwordHash: studentHash } },
      { upsert: true }
    );
  }

  const courseDocs = await Course.find({ isOffered: { $ne: false } }).sort({ createdAt: 1 }).lean();
  const studentDocs = await User.find({ role: "student" }).sort({ createdAt: 1 }).lean();

  for (let i = 0; i < studentDocs.length; i++) {
    const student = studentDocs[i];
    const a = courseDocs[i % courseDocs.length];
    const b = courseDocs[(i + 1) % courseDocs.length];
    const c = courseDocs[(i + 2) % courseDocs.length];
    const enroll = [a, b, i % 3 === 0 ? c : null].filter(Boolean);

    for (const course of enroll) {
      await Enrollment.updateOne(
        { courseId: course._id, studentId: student._id },
        { $setOnInsert: { courseId: course._id, studentId: student._id } },
        { upsert: true }
      );
    }
  }

  const assignmentsByCourse = [
    { title: "Quiz 1", description: "Short quiz covering basics.", daysFromNow: 3 },
    { title: "Lab Task", description: "Hands-on practice exercise.", daysFromNow: 7 },
    { title: "Midterm Preparation", description: "Practice questions and reading.", daysFromNow: 14 },
  ];

  const allCourses = await Course.find({}).lean();
  for (const course of allCourses) {
    const creator = String(course.teacherId) === String(t2._id) ? t2 : t1;
    for (const a of assignmentsByCourse) {
      const dueAt = new Date(Date.now() + a.daysFromNow * 24 * 60 * 60 * 1000);
      await Assignment.updateOne(
        { courseId: course._id, title: a.title },
        {
          $set: {
            courseId: course._id,
            title: a.title,
            description: a.description,
            dueAt,
            createdById: creator._id,
          },
        },
        { upsert: true }
      );
    }
  }

  const totalStudents = await User.countDocuments({ role: "student" });
  const totalCourses = await Course.countDocuments({});
  const totalEnrollments = await Enrollment.countDocuments({});
  const totalAssignments = await Assignment.countDocuments({});

  console.log(`Seeded demo teachers: ${teachers.length}`);
  console.log(`Seeded demo students: ${totalStudents}`);
  console.log(`Seeded demo courses: ${totalCourses}`);
  console.log(`Seeded demo enrollments: ${totalEnrollments}`);
  console.log(`Seeded demo assignments: ${totalAssignments}`);
  console.log(`Demo student password: ${demoStudentPassword}`);
}

await mongoose.disconnect();
