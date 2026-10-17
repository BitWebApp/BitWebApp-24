import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HiPencilAlt, HiRefresh } from "react-icons/hi";
import Swal from "sweetalert2";
import { categoryLabel } from "../utils/courses";
import { programLabel } from "../utils/programs";
import { sessionLabel } from "../utils/sessions";

const KINDS = [
  { value: "minor_project", label: "Minor Project groups" },
  { value: "major_project", label: "Major Project groups" },
  { value: "summer_training", label: "Summer Training groups" },
  { value: "project1", label: "Project 1 groups" },
  {
    value: "individual",
    label: "Individual allotments (back paper, MCA, M.Tech)",
  },
];

const ALL = "all";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const readApiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]
  );

/**
 * Admin page to change the mentor of an existing allotment, e.g. when a
 * faculty member leaves. Master admins see everything; batch coordinators
 * only see and edit allotments of their own batches.
 */
const AdminEditAllotment = () => {
  const [options, setOptions] = useState(null);
  const [kind, setKind] = useState(KINDS[0].value);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState(ALL);
  const [session, setSession] = useState(ALL);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newMentor, setNewMentor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get("/api/v1/allotments/admin/options")
      .then((response) => setOptions(response.data.data))
      .catch((err) =>
        Swal.fire({
          icon: "error",
          title: "Could not load the page",
          text: readApiError(err, "Failed to load mentors."),
        })
      );
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/allotments/admin/edit", {
        params: { course: kind },
      });
      setRows(response.data.data);
    } catch (err) {
      setRows([]);
      Swal.fire({
        icon: "error",
        title: "Could not load allotments",
        text: readApiError(err, "Failed to load allotments."),
      });
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    setEditingId(null);
    setBatch(ALL);
    setSession(ALL);
    load();
  }, [load]);

  const batchChoices = useMemo(
    () => [...new Set(rows.flatMap((r) => r.batches))].sort((a, b) => b - a),
    [rows]
  );
  const sessionChoices = useMemo(
    () =>
      [...new Set(rows.map((r) => r.session))].sort(
        (a, b) => b.slice(2).localeCompare(a.slice(2)) || a.localeCompare(b)
      ),
    [rows]
  );

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (batch === ALL || r.batches.includes(Number(batch))) &&
        (session === ALL || r.session === session) &&
        (!term ||
          r.groupId.toLowerCase().includes(term) ||
          r.members.some(
            (m) =>
              m.rollNumber.toLowerCase().includes(term) ||
              m.fullName.toLowerCase().includes(term)
          ))
    );
  }, [rows, batch, session, search]);

  const startEdit = (row) => {
    setEditingId(row.id);
    setNewMentor("");
  };

  const handleReassign = async (row) => {
    const mentor = options.professors.find((p) => p._id === newMentor);
    if (!mentor) return;
    const what = row.groupId
      ? `group <b>${escapeHtml(row.groupId)}</b> (${row.members.length} student(s))`
      : `<b>${escapeHtml(row.members[0]?.rollNumber)}</b>`;
    const confirmed = await Swal.fire({
      icon: "question",
      title: "Change the mentor?",
      html: `${row.courseLabel} ${what} will move from <b>${escapeHtml(
        row.mentor?.fullName || "—"
      )}</b> to <b>${escapeHtml(mentor.fullName)}</b>. Marks already given stay as they are.`,
      showCancelButton: true,
      confirmButtonText: "Yes, change mentor",
      confirmButtonColor: "#2563eb",
    });
    if (!confirmed.isConfirmed) return;

    try {
      setSaving(true);
      const response = await axios.post(
        "/api/v1/allotments/admin/edit/reassign",
        {
          course: kind,
          id: row.id,
          newProfessorId: newMentor,
        }
      );
      Swal.fire({
        icon: "success",
        title: "Mentor changed",
        text: response.data.message,
      });
      setEditingId(null);
      load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not change the mentor",
        text: readApiError(err, "Failed to change the mentor."),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!options) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-blue-700">
            <HiPencilAlt /> Edit Allotment
          </h1>
          <p className="mt-1 text-gray-600">
            Move an existing allotment to another mentor, for example when a
            faculty member leaves the institute. Seat counts and the
            students&apos; records are updated together.
            {options.assignedBatches && (
              <>
                {" "}
                As a batch coordinator you can edit allotments of batch{" "}
                <b>
                  {options.assignedBatches.map((b) => `K${b}`).join(", ") ||
                    "none"}
                </b>{" "}
                only.
              </>
            )}
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <select
              aria-label="Allotment type"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className={`${inputClass} md:col-span-2`}
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className={inputClass}
            >
              <option value={ALL}>All batches</option>
              {batchChoices.map((b) => (
                <option key={b} value={String(b)}>
                  K{b}
                </option>
              ))}
            </select>
            <select
              aria-label="Session"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className={inputClass}
            >
              <option value={ALL}>All sessions</option>
              {sessionChoices.map((s) => (
                <option key={s} value={s}>
                  {sessionLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              aria-label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search group ID, roll number or name"
              className={`${inputClass} max-w-md`}
            />
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              <HiRefresh /> Refresh
            </button>
            <span className="text-sm text-gray-500">
              {visibleRows.length} allotment(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="px-4 py-3">Group / Type</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Mentor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && visibleRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No allotments match these filters.
                    </td>
                  </tr>
                )}
                {!loading &&
                  visibleRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-100 align-top"
                    >
                      <td className="px-4 py-3">
                        {row.groupId ? (
                          <>
                            <p className="font-semibold">{row.groupId}</p>
                            {row.projectTitle && (
                              <p className="text-xs text-gray-500">
                                {row.projectTitle}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="font-semibold">{row.courseLabel}</p>
                            <p className="text-xs text-gray-500">
                              {categoryLabel(row.category)}
                            </p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ul className="space-y-0.5">
                          {row.members.map((m) => (
                            <li key={m._id}>
                              {m.rollNumber}{" "}
                              <span className="capitalize text-gray-600">
                                {m.fullName}
                              </span>
                              {m.program !== "BTECH" && (
                                <span className="ml-1 text-xs text-gray-500">
                                  ({programLabel(m.program)})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3">
                        {row.batches.map((b) => `K${b}`).join(", ")}
                      </td>
                      <td className="px-4 py-3">{sessionLabel(row.session)}</td>
                      <td className="px-4 py-3">
                        {row.mentor?.fullName}
                        <span className="block text-xs text-gray-500">
                          {row.mentor?.idNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === row.id ? (
                          <div className="flex min-w-[18rem] items-center gap-2">
                            <select
                              aria-label="New mentor"
                              value={newMentor}
                              onChange={(e) => setNewMentor(e.target.value)}
                              className={inputClass}
                            >
                              <option value="">Choose new mentor</option>
                              {options.professors
                                .filter((p) => p._id !== row.mentor?._id)
                                .map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.fullName} ({p.idNumber})
                                  </option>
                                ))}
                            </select>
                            <button
                              type="button"
                              disabled={!newMentor || saving}
                              onClick={() => handleReassign(row)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-lg bg-gray-200 px-3 py-2 text-gray-700 transition hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            className="whitespace-nowrap rounded-lg border border-blue-600 px-3 py-1.5 text-blue-700 transition hover:bg-blue-50"
                          >
                            Change mentor
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

export default AdminEditAllotment;
