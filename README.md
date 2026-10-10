University of Gujrat Learning Management System (LMS) built with Next.js (App Router) and MongoDB.

## Getting Started

### 1) Configure environment

Create `.env.local` based on `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Set `MONGODB_URI` to your MongoDB Atlas connection string.

Never hardcode passwords or commit them to git. If a password was shared in chat, rotate it in MongoDB Atlas and update `.env.local`.

### 2) Run the dev server

Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3) Quick health check

Once running, this should return `{ "ok": true }` if the database connects successfully:

`GET /api/health`

### 4) Seed an initial admin

Set these in `.env.local` and run:

```bash
npm run seed
```

To also seed a sample teacher and offered courses for testing:

```bash
npm run seed:courses
```

To seed a more realistic demo dataset (teachers, students, enrollments, assignments):

```bash
npm run seed:demo
```

### 5) How teacher/admin login works

- Everyone uses the same sign-in page: `/login`
- Students can self-register at `/register`
- Teachers and admins must already exist in the database:
  - Create them from `Admin → Users` (after you have an admin account), or
  - Seed them in development with `npm run seed:courses` (creates a teacher user)

### First admin

There is no default account. Create the first admin by running the seed script with your own credentials:

```bash
MONGODB_URI=... SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='a-long-unique-password' npm run seed
```

Teacher and demo-student passwords are taken from `SEED_TEACHER_PASSWORD` / `SEED_DEMO_STUDENT_PASSWORD`; if unset, a random password is generated and printed once.

### Deployment checklist

Set these environment variables on your host (e.g. Vercel) or the app cannot reach the database or sign users in: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Then run the seed once against that database.

## Interfaces and Roles (in progress)

- Student: courses, enrollments, assignments, grades
- Teacher: course management, assignments, grading
- Admin: user management, departments, global settings

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
