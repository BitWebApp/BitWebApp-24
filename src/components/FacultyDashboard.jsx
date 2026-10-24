import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi";
import { toast, Toaster } from "react-hot-toast";
import Dashboard from "./Dashboard";
import FrozenMarksBadge from "./FrozenMarksBadge";
import { categoryLabel } from "../utils/courses";
import { exportMyStudents } from "../utils/exportMyStudents";
import { PROGRAMS, programLabel } from "../utils/programs";
import {
  sessionLabel,
  sessionLongLabel,
  sessionOptions,
} from "../utils/sessions";

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const ALL = "all";

/** Batches (newest first) that have students for a program and session. */
const batchesFor = (combinations, program, session) =>
  [
    ...new Set(
      combinations
        .filter(
          (c) =>
            (program === ALL || c.program === program) &&
            (session === ALL || c.session === session)
        )
        .map((c) => c.batch)
    ),
  ].sort((a, b) => b - a);

/**
 * Picks the starting filters: the current session, the first program with
 * students in it, and that program's newest batch, so a mentor lands on
 * their current students.
 */
const defaultFilters = (options) => {
  const session = options.currentSession;
  const inSession = options.combinations.filter((c) => c.session === session);
  const program =
    PROGRAMS.find((p) => inSession.some((c) => c.program === p.value))?.value ||
    options.programs[0] ||
    PROGRAMS[0].value;
  const batch = batchesFor(options.combinations, program, session)[0];
  return { session, program, batch: batch ? String(batch) : ALL };
};

/**
 * Faculty home page: the mentor's students, filtered by program, batch and
 * session, followed by the roll number search.
 */
const FacultyDashboard = () => {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    axios
      .get("/api/v1/prof/my-students")
      .then((response) => {
        setData(response.data.data);
        setFilters(defaultFilters(response.data.data.options));
      })
      .catch((err) =>
        toast.error(
          err.response?.data?.message || "Failed to load your students"
        )
      );
  }, []);

  const batchChoices = useMemo(
    () =>
      data && filters
        ? batchesFor(
            data.options.combinations,
            filters.program,
            filters.session
          )
        : [],
    [data, filters]
  );

  const sessionChoices = useMemo(() => {
    if (!data) return [];
    return [...new Set([...sessionOptions(), ...data.options.sessions])].sort(
      (a, b) => b.slice(2).localeCompare(a.slice(2)) || a.localeCompare(b)
    );
  }, [data]);

  const students = useMemo(() => {
    if (!data || !filters) return [];
    return data.students.filter(
      (s) =>
        (filters.program === ALL || s.program === filters.program) &&
        (filters.batch === ALL || String(s.batch) === filters.batch) &&
        (filters.session === ALL || s.session === filters.session)
    );
  }, [data, filters]);

  const courseCounts = useMemo(() => {
    const counts = {};
    students.forEach((s) => {
      counts[s.courseLabel] = (counts[s.courseLabel] || 0) + 1;
    });
    return Object.entries(counts);
  }, [students]);

  // Changing program or session keeps the batch when it still has students,
  // otherwise moves to the newest batch that does.
  const changeFilter = (name, value) => {
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      if (name !== "batch") {
        const batches = batchesFor(
          data.options.combinations,
          next.program,
          next.session
        );
        if (next.batch !== ALL && !batches.includes(Number(next.batch))) {
          next.batch = batches.length ? String(batches[0]) : ALL;
        }
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="flex items-center justify-center gap-2 text-center text-3xl font-bold md:text-4xl">
              <HiAcademicCap /> My Students
            </h1>
            <p className="mt-2 text-center text-blue-100">
              Students you mentor across Summer Training, Minor, Major and
              Project 1 groups and individual allotments.
            </p>
          </div>

          {!data || !filters ? (
            <p className="p-10 text-center text-gray-500">Loading...</p>
          ) : (
            <>
              <div className="grid gap-4 border-b bg-gray-50 p-6 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="dashboard-program"
                    className="mb-1 block text-sm font-semibold text-gray-700"
                  >
                    Program
                  </label>
                  <select
                    id="dashboard-program"
                    value={filters.program}
                    onChange={(e) => changeFilter("program", e.target.value)}
                    className={selectClass}
                  >
                    {PROGRAMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                    <option value={ALL}>All programs</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="dashboard-batch"
                    className="mb-1 block text-sm font-semibold text-gray-700"
                  >
                    Batch
                  </label>
                  <select
                    id="dashboard-batch"
                    value={filters.batch}
                    onChange={(e) => changeFilter("batch", e.target.value)}
                    className={selectClass}
                  >
                    {batchChoices.map((b) => (
                      <option key={b} value={String(b)}>
                        K{b}
                      </option>
                    ))}
                    <option value={ALL}>All batches</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="dashboard-session"
                    className="mb-1 block text-sm font-semibold text-gray-700"
                  >
                    Session
                  </label>
                  <select
                    id="dashboard-session"
                    value={filters.session}
                    onChange={(e) => changeFilter("session", e.target.value)}
                    className={selectClass}
                  >
                    {sessionChoices.map((s) => (
                      <option key={s} value={s}>
                        {sessionLabel(s)} ({sessionLongLabel(s)})
                        {s === data.options.currentSession ? " — current" : ""}
                      </option>
                    ))}
                    <option value={ALL}>All sessions</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 px-6 pt-5 text-sm">
                <span className="rounded-full bg-blue-600 px-3 py-1 font-semibold text-white">
                  {students.length} student(s)
                </span>
                {courseCounts.map(([label, count]) => (
                  <span
                    key={label}
                    className="rounded-full bg-blue-50 px-3 py-1 text-blue-800 ring-1 ring-blue-200"
                  >
                    {label}: {count}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    exportMyStudents(
                      students,
                      [
                        filters.program === ALL
                          ? "All_programs"
                          : programLabel(filters.program),
                        filters.batch === ALL
                          ? "All_batches"
                          : `K${filters.batch}`,
                        filters.session === ALL
                          ? "All_sessions"
                          : sessionLabel(filters.session),
                      ].join("_")
                    ).catch(() =>
                      toast.error("Could not create the Excel file")
                    )
                  }
                  disabled={students.length === 0}
                  className="ml-auto flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <FaFileExcel /> Download Excel
                </button>
              </div>

              <div className="overflow-x-auto p-6">
                {students.length === 0 ? (
                  <p className="py-10 text-center text-gray-500">
                    No students for{" "}
                    {filters.program === ALL
                      ? "any program"
                      : programLabel(filters.program)}
                    {filters.batch === ALL ? "" : `, K${filters.batch}`}
                    {filters.session === ALL
                      ? ""
                      : ` in ${sessionLabel(filters.session)}`}
                    .
                  </p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Roll Number</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Program</th>
                        <th className="px-4 py-3">Batch</th>
                        <th className="px-4 py-3">Branch</th>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Group / Type</th>
                        <th className="px-4 py-3">Session</th>
                        <th className="px-4 py-3">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {students.map((s) => (
                        <tr
                          key={`${s.studentId}-${s.course}-${s.session}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">{s.rollNumber}</td>
                          <td className="px-4 py-3 capitalize">{s.fullName}</td>
                          <td className="px-4 py-3">
                            {programLabel(s.program)}
                          </td>
                          <td className="px-4 py-3">K{s.batch}</td>
                          <td className="px-4 py-3">
                            {s.branch?.toUpperCase() || "—"}
                          </td>
                          <td className="px-4 py-3">{s.courseLabel}</td>
                          <td className="px-4 py-3">
                            {s.source === "group" ? (
                              <span title={s.projectTitle}>{s.groupId}</span>
                            ) : (
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  s.category === "back_paper"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {categoryLabel(s.category)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {sessionLabel(s.session)}
                          </td>
                          <td className="px-4 py-3">
                            {s.marksFrozen ? (
                              <FrozenMarksBadge
                                marks={s.marks}
                                maxMarks={s.maxMarks}
                              />
                            ) : (
                              <span className="text-gray-500">
                                Not submitted
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Dashboard />
    </div>
  );
};

export default FacultyDashboard;
