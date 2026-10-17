import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import { toast, Toaster } from "react-hot-toast";
import { categoryLabel, courseLabel, getCourse } from "../utils/courses";
import { programLabel } from "../utils/programs";
import { sessionLabel, sessionLongLabel } from "../utils/sessions";

const selectClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

/**
 * Students allotted to the logged in mentor outside the group flow (back
 * paper students), one session at a time.
 */
const FacultyAllottedStudents = () => {
  const [session, setSession] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [marksInput, setMarksInput] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/allotments/mine", {
        params: session ? { session } : {},
      });
      setData(response.data.data);
      if (!session) setSession(response.data.data.session);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load allotted students"
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveMarks = async (allotment) => {
    try {
      const response = await axios.post(
        `/api/v1/allotments/${allotment._id}/marks`,
        {
          marks: marksInput,
        }
      );
      toast.success(response.data.message);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save marks");
    }
  };

  const allotments = data?.allotments || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="flex items-center justify-center gap-2 text-center text-3xl font-bold md:text-4xl">
            <HiUserGroup /> Allotted Students
          </h1>
          <p className="mt-2 text-center text-blue-100">
            Students allotted to you by the department outside the group
            application flow, such as back paper students.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50 p-6">
          <label
            htmlFor="allotted-session"
            className="text-sm font-semibold text-gray-700"
          >
            Session
          </label>
          <select
            id="allotted-session"
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className={selectClass}
          >
            {(data?.sessions || []).map((s) => (
              <option key={s} value={s}>
                {sessionLabel(s)} ({sessionLongLabel(s)})
                {s === data?.currentSession ? " — current" : ""}
              </option>
            ))}
            <option value="all">All sessions</option>
          </select>
          <span className="text-sm text-gray-500">
            {allotments.length} student(s)
          </span>
        </div>

        <div className="overflow-x-auto p-6">
          {loading ? (
            <p className="py-10 text-center text-gray-500">Loading...</p>
          ) : allotments.length === 0 ? (
            <p className="py-10 text-center text-gray-500">
              No students are allotted to you for this session.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Roll Number</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {allotments.map((a) => {
                  const maxMarks = getCourse(a.course)?.maxMarks;
                  return (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{a.student?.rollNumber}</td>
                      <td className="px-4 py-3 capitalize">
                        {a.student?.fullName}
                      </td>
                      <td className="px-4 py-3">{programLabel(a.program)}</td>
                      <td className="px-4 py-3">K{a.batch}</td>
                      <td className="px-4 py-3">{courseLabel(a.course)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            a.category === "back_paper"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {categoryLabel(a.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{sessionLabel(a.session)}</td>
                      <td className="px-4 py-3">
                        {editing === a._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              value={marksInput}
                              onChange={(e) => setMarksInput(e.target.value)}
                              aria-label={`Marks for ${a.student?.rollNumber}`}
                              className="w-20 rounded border border-gray-300 px-2 py-1"
                            />
                            <span className="text-xs text-gray-500">
                              /{maxMarks}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSaveMarks(a)}
                              className="rounded bg-green-600 px-2 py-1 text-white transition hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing(null)}
                              className="rounded bg-gray-200 px-2 py-1 text-gray-700 transition hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(a._id);
                              setMarksInput(a.marks ?? "");
                            }}
                            className="flex items-center rounded bg-blue-100 px-3 py-1 text-blue-700 transition hover:bg-blue-200"
                          >
                            {a.marks ?? "—"}/{maxMarks}
                            <FaEdit className="ml-2 text-sm" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyAllottedStudents;
