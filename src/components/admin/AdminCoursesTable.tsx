"use client";

import { useMemo, useState } from "react";
import ToggleCourseOffer from "@/components/admin/ToggleCourseOffer";

export type AdminCourseRow = {
  id: string;
  code: string;
  title: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  isOffered: boolean;
  createdAt: string;
};

export type AdminTeacherOption = {
  id: string;
  name: string;
};

export default function AdminCoursesTable({
  courses,
  teachers,
}: {
  courses: AdminCourseRow[];
  teachers: AdminTeacherOption[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "offered" | "not-offered">("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");

  const counts = useMemo(() => {
    return courses.reduce(
      (acc, course) => {
        acc.total += 1;
        if (course.isOffered) acc.offered += 1;
        else acc.notOffered += 1;
        return acc;
      },
      { total: 0, offered: 0, notOffered: 0 }
    );
  }, [courses]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return courses.filter((course) => {
      if (statusFilter === "offered" && !course.isOffered) return false;
      if (statusFilter === "not-offered" && course.isOffered) return false;
      if (teacherFilter !== "all" && course.teacherId !== teacherFilter) return false;
      if (!normalized) return true;
      return (
        course.code.toLowerCase().includes(normalized) ||
        course.title.toLowerCase().includes(normalized) ||
        course.teacherName.toLowerCase().includes(normalized) ||
        course.teacherEmail.toLowerCase().includes(normalized)
      );
    });
  }, [courses, query, statusFilter, teacherFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Catalog</div>
            <div className="mt-1 text-xs text-zinc-600">
              {counts.total} total | {counts.offered} offered | {counts.notOffered} archived
            </div>
          </div>
          <div className="text-xs font-semibold text-zinc-500">
            Showing {filtered.length} of {counts.total}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-600">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
              placeholder="Search code, title, teacher"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-600">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "offered" | "not-offered")}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            >
              <option value="all">All courses</option>
              <option value="offered">Offered</option>
              <option value="not-offered">Archived</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-600">Teacher</span>
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            >
              <option value="all">All teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-12 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-600">
        <div className="col-span-2">Code</div>
        <div className="col-span-4">Title</div>
        <div className="col-span-3">Teacher</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1">Created</div>
      </div>

      <div className="divide-y divide-zinc-200">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">No courses match the current filters.</div>
        ) : (
          filtered.map((course) => (
            <div key={course.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
              <div className="col-span-2 font-medium text-zinc-900">{course.code}</div>
              <div className="col-span-4 text-zinc-900">{course.title}</div>
              <div className="col-span-3 text-xs text-zinc-600">
                <div className="text-sm font-medium text-zinc-900">{course.teacherName}</div>
                <div>{course.teacherEmail}</div>
              </div>
              <div className="col-span-2">
                <ToggleCourseOffer courseId={course.id} isOffered={course.isOffered} />
              </div>
              <div className="col-span-1 text-xs text-zinc-600">{course.createdAt}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
