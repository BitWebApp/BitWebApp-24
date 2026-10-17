import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { HiRefresh, HiSearch, HiTrash, HiUserAdd } from "react-icons/hi";
import Swal from "sweetalert2";
import {
  categoryLabel,
  courseLabel,
  coursesForProgram,
} from "../utils/courses";
import { DEFAULT_PROGRAM, programLabel } from "../utils/programs";
import { sessionLabel, sessionLongLabel } from "../utils/sessions";

const readApiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const inputClass =
  "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const EMPTY_FORM = { course: "", professorId: "", remarks: "" };

/**
 * Admin page for allotting mentors to back paper students: students who
 * repeat a project course in a later session and so are outside the normal
 * group application flow. Coordinators only see their own batches.
 */
const AdminBackPaperAllotment = () => {
  const [options, setOptions] = useState(null);
  const [session, setSession] = useState("");

  const [rollNumber, setRollNumber] = useState("");
  const [student, setStudent] = useState(null);
  const [studentAllotments, setStudentAllotments] = useState([]);
  const [finding, setFinding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [allotments, setAllotments] = useState([]);
  const [listSession, setListSession] = useState("");
  const [listCourse, setListCourse] = useState("");
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    axios
      .get("/api/v1/allotments/admin/options")
      .then((response) => {
        const data = response.data.data;
        setOptions(data);
        setSession(data.currentSession);
        setListSession(data.currentSession);
      })
      .catch((err) =>
        Swal.fire({
          icon: "error",
          title: "Could not load the page",
          text: readApiError(err, "Failed to load sessions and mentors."),
        })
      );
  }, []);

  const loadAllotments = useCallback(async () => {
    if (!options) return;
    try {
      setLoadingList(true);
      const response = await axios.get("/api/v1/allotments/admin/list", {
        params: {
          category: "back_paper",
          session: listSession || undefined,
          course: listCourse || undefined,
          search: search.trim() || undefined,
        },
      });
      setAllotments(response.data.data);
    } catch (err) {
      setAllotments([]);
      Swal.fire({
        icon: "error",
        title: "Could not load allotments",
        text: readApiError(err, "Failed to load back paper allotments."),
      });
    } finally {
      setLoadingList(false);
    }
  }, [options, listSession, listCourse, search]);

  useEffect(() => {
    const timer = setTimeout(loadAllotments, 300);
    return () => clearTimeout(timer);
  }, [loadAllotments]);

  const handleFindStudent = async (event) => {
    event?.preventDefault();
    if (!rollNumber.trim()) return;
    try {
      setFinding(true);
      const response = await axios.get("/api/v1/allotments/admin/student", {
        params: { rollNumber: rollNumber.trim() },
      });
      const { student: found, allotments: existing } = response.data.data;
      setStudent(found);
      setStudentAllotments(existing);
      setForm(EMPTY_FORM);
    } catch (err) {
      setStudent(null);
      setStudentAllotments([]);
      Swal.fire({
        icon: "error",
        title:
          err?.response?.status === 403
            ? "Not in your batches"
            : "Student not found",
        text: readApiError(err, "Could not find that student."),
      });
    } finally {
      setFinding(false);
    }
  };

  const handleAllot = async (event) => {
    event.preventDefault();
    const mentor = options.professors.find((p) => p._id === form.professorId);
    const confirmed = await Swal.fire({
      icon: "question",
      title: "Allot this mentor?",
      html: `<b>${student.rollNumber}</b> (${student.fullName}) will be allotted to <b>${mentor?.fullName}</b> for <b>${courseLabel(form.course)}</b> as a back paper student in <b>${sessionLongLabel(session)}</b>.`,
      showCancelButton: true,
      confirmButtonText: "Yes, allot",
      confirmButtonColor: "#2563eb",
    });
    if (!confirmed.isConfirmed) return;

    try {
      setSaving(true);
      const response = await axios.post("/api/v1/allotments/admin/back-paper", {
        rollNumber: student.rollNumber,
        session,
        ...form,
      });
      Swal.fire({
        icon: "success",
        title: "Mentor allotted",
        text: response.data.message,
      });
      setStudentAllotments((prev) => [response.data.data, ...prev]);
      setForm(EMPTY_FORM);
      loadAllotments();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not allot the mentor",
        text: readApiError(err, "Failed to create the allotment."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (allotment) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Remove this allotment?",
      html: `${allotment.student?.rollNumber} will no longer be allotted to ${allotment.professor?.fullName} for ${courseLabel(allotment.course)} (${sessionLabel(allotment.session)}).`,
      showCancelButton: true,
      confirmButtonText: "Remove",
      confirmButtonColor: "#dc2626",
    });
    if (!confirmed.isConfirmed) return;
    try {
      await axios.delete(`/api/v1/allotments/admin/${allotment._id}`);
      setAllotments((prev) => prev.filter((a) => a._id !== allotment._id));
      setStudentAllotments((prev) =>
        prev.filter((a) => a._id !== allotment._id)
      );
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not remove the allotment",
        text: readApiError(err, "Failed to remove the allotment."),
      });
    }
  };

  if (!options) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const studentCourses = student
    ? coursesForProgram(student.program || DEFAULT_PROGRAM)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-blue-700">
            <HiUserAdd /> Back Paper Allotment
          </h1>
          <p className="mt-1 text-gray-600">
            Allot a mentor to a student repeating a project course (back paper)
            in a given session. These students are outside the normal group
            application flow and do not use up the mentor&apos;s seats.
            {options.assignedBatches && (
              <>
                {" "}
                You can allot students of batch{" "}
                <b>
                  {options.assignedBatches.map((b) => `K${b}`).join(", ") ||
                    "none"}
                </b>
                .
              </>
            )}
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            1. Find the student
          </h2>
          <form
            onSubmit={handleFindStudent}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="w-full max-w-xs">
              <label
                htmlFor="bp-roll"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                Roll number
              </label>
              <input
                id="bp-roll"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. BTECH/10123/22"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={finding || !rollNumber.trim()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <HiSearch /> {finding ? "Searching..." : "Find student"}
            </button>
          </form>

          {student && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-blue-50 p-4 text-sm">
                <p className="text-lg font-semibold capitalize text-gray-900">
                  {student.fullName}
                </p>
                <p className="text-gray-600">{student.rollNumber}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-gray-700">
                  <dt className="font-semibold">Program</dt>
                  <dd>{programLabel(student.program)}</dd>
                  <dt className="font-semibold">Batch</dt>
                  <dd>K{student.batch}</dd>
                  <dt className="font-semibold">Branch</dt>
                  <dd>{student.branch?.toUpperCase() || "—"}</dd>
                </dl>
                {studentAllotments.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold text-gray-700">
                      Existing allotments
                    </p>
                    <ul className="mt-1 list-disc pl-5 text-gray-600">
                      {studentAllotments.map((a) => (
                        <li key={a._id}>
                          {courseLabel(a.course)}, {sessionLabel(a.session)} —{" "}
                          {a.professor?.fullName} ({categoryLabel(a.category)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <form onSubmit={handleAllot} className="space-y-3">
                <h3 className="font-semibold text-gray-800">
                  2. Allot a mentor
                </h3>
                <div>
                  <label
                    htmlFor="bp-session"
                    className="mb-1 block text-sm font-semibold text-gray-700"
                  >
                    Session
                  </label>
                  <select
                    id="bp-session"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className={inputClass}
                  >
                    {options.sessions.map((s) => (
                      <option key={s} value={s}>
                        {sessionLabel(s)} ({sessionLongLabel(s)})
                        {s === options.currentSession ? " — current" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="bp-course"
                    className="mb-1 block text-sm font-semibold text-gray-700"
                  >
                    Course
                  </label>
                  <select
                    id="bp-course"
                    value={form.course}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, course: e.target.value }))
                    }
                    required
                    className={inputClass}
                  >
                    <option value="">Select a course</option>
                    {studentCourses.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="bp-mentor"
                    className="mb-1 block text-sm font-semibold text-gray-700"
                  >
                    Mentor
                  </label>
                  <select
                    id="bp-mentor"
                    value={form.professorId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, professorId: e.target.value }))
                    }
                    required
                    className={inputClass}
                  >
                    <option value="">Select a mentor</option>
                    {options.professors.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.fullName} ({p.idNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="bp-remarks"
                    className="mb-1 block text-sm font-semibold text-gray-700"
                  >
                    Remarks (optional)
                  </label>
                  <input
                    id="bp-remarks"
                    value={form.remarks}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, remarks: e.target.value }))
                    }
                    placeholder="e.g. Failed in MO 2025"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {saving ? "Allotting..." : "Allot mentor"}
                </button>
              </form>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Back paper allotments
            </h2>
            <button
              type="button"
              onClick={loadAllotments}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              <HiRefresh /> Refresh
            </button>
          </div>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <select
              aria-label="Filter by session"
              value={listSession}
              onChange={(e) => setListSession(e.target.value)}
              className={inputClass}
            >
              <option value="">All sessions</option>
              {options.sessions.map((s) => (
                <option key={s} value={s}>
                  {sessionLabel(s)}
                  {s === options.currentSession ? " (current)" : ""}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by course"
              value={listCourse}
              onChange={(e) => setListCourse(e.target.value)}
              className={inputClass}
            >
              <option value="">All courses</option>
              {options.courses.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              aria-label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roll number or name"
              className={inputClass}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="px-4 py-3">Roll Number</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Mentor</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loadingList && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                )}
                {!loadingList && allotments.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No back paper allotments match these filters.
                    </td>
                  </tr>
                )}
                {!loadingList &&
                  allotments.map((a) => (
                    <tr key={a._id} className="border-t border-gray-100">
                      <td className="px-4 py-3">{a.student?.rollNumber}</td>
                      <td className="px-4 py-3 capitalize">
                        {a.student?.fullName}
                      </td>
                      <td className="px-4 py-3">{programLabel(a.program)}</td>
                      <td className="px-4 py-3">K{a.batch}</td>
                      <td className="px-4 py-3">{courseLabel(a.course)}</td>
                      <td className="px-4 py-3">{sessionLabel(a.session)}</td>
                      <td className="px-4 py-3">{a.professor?.fullName}</td>
                      <td className="px-4 py-3">{a.marks ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {a.remarks || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {(a.marks === null || a.marks === undefined) && (
                          <button
                            type="button"
                            onClick={() => handleRemove(a)}
                            title="Remove allotment"
                            className="rounded p-1.5 text-red-600 transition hover:bg-red-50"
                          >
                            <HiTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminBackPaperAllotment;
