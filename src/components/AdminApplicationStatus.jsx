import axios from "axios";
import ExcelJS from "exceljs";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import { HiClipboardList, HiRefresh } from "react-icons/hi";
import Swal from "sweetalert2";

const PROJECTS = [
  { value: "minor_project", label: "Minor Project" },
  { value: "major_project", label: "Major Project" },
  { value: "summer_training", label: "Summer Training" },
  { value: "project1", label: "Project 1" },
];

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const readApiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const SummaryCard = ({ label, value, tone }) => (
  <div className={`rounded-lg border p-4 ${tone}`}>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
  </div>
);

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  tone: PropTypes.string,
};

/** Save rows as a one-sheet Excel file. */
const downloadExcel = async (fileName, columns, rows) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key }));
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => {
    let width = column.header.length;
    column.eachCell((cell) => {
      width = Math.max(width, String(cell.value ?? "").length);
    });
    column.width = Math.min(width + 3, 60);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Admin page showing, for one project and batch, the students who have not
 * applied to any faculty yet and the groups still waiting for a faculty with
 * the faculty they chose in preference order. Coordinators only see their
 * own batches.
 */
const AdminApplicationStatus = () => {
  const [course, setCourse] = useState(PROJECTS[0].value);
  const [batch, setBatch] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("notApplied");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/admin/application-status", {
        params: { course, batch: batch || undefined },
      });
      setData(response.data.data);
      if (!batch && response.data.data.batch) {
        setBatch(String(response.data.data.batch));
      }
    } catch (err) {
      setData(null);
      Swal.fire({
        icon: "error",
        title: "Could not load the list",
        text: readApiError(err, "Failed to load application status."),
      });
    } finally {
      setLoading(false);
    }
  }, [course, batch]);

  useEffect(() => {
    load();
  }, [load]);

  const term = search.trim().toLowerCase();
  const matches = (s) =>
    !term ||
    s.rollNumber?.toLowerCase().includes(term) ||
    s.fullName?.toLowerCase().includes(term);

  const notApplied = useMemo(
    () => (data?.notApplied || []).filter(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, term]
  );
  const notAllotted = useMemo(
    () =>
      (data?.notAllotted || []).filter(
        (g) =>
          !term ||
          g.groupId.toLowerCase().includes(term) ||
          g.members.some(matches) ||
          g.preferences.some((p) => p.fullName.toLowerCase().includes(term))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, term]
  );

  const projectLabel = PROJECTS.find((p) => p.value === course)?.label;
  const filePrefix = `${projectLabel}_K${data?.batch ?? ""}`.replace(
    /\s+/g,
    "_"
  );

  const handleDownload = () => {
    if (tab === "notApplied") {
      return downloadExcel(
        `${filePrefix}_Not_Applied.xlsx`,
        [
          { header: "Roll Number", key: "rollNumber" },
          { header: "Name", key: "fullName" },
          { header: "Branch", key: "branch" },
          { header: "Section", key: "section" },
          { header: "Email", key: "email" },
          { header: "Mobile", key: "mobileNumber" },
          { header: "Group ID", key: "groupId" },
          { header: "Status", key: "reason" },
        ],
        notApplied.map((s) => ({ ...s, fullName: s.fullName?.toUpperCase() }))
      );
    }
    const maxPrefs = Math.max(
      0,
      ...notAllotted.map((g) => g.preferences.length)
    );
    return downloadExcel(
      `${filePrefix}_Not_Allotted_Preferences.xlsx`,
      [
        { header: "Group ID", key: "groupId" },
        { header: "Roll Number", key: "rollNumber" },
        { header: "Name", key: "fullName" },
        ...Array.from({ length: maxPrefs }, (_, i) => ({
          header: `Preference ${i + 1}`,
          key: `pref${i}`,
        })),
        { header: "Declined by", key: "declined" },
        { header: "With current faculty since", key: "waitingSince" },
      ],
      notAllotted.flatMap((g) =>
        g.members.map((m) => ({
          groupId: g.groupId,
          rollNumber: m.rollNumber,
          fullName: m.fullName?.toUpperCase(),
          ...Object.fromEntries(
            g.preferences.map((p, i) => [
              `pref${i}`,
              `${p.fullName} (${p.idNumber})`,
            ])
          ),
          declined: g.declined.map((p) => p.fullName).join(", "),
          waitingSince: formatDate(g.waitingSince),
        }))
      )
    );
  };

  const rowsInTab =
    tab === "notApplied" ? notApplied.length : notAllotted.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-blue-700">
            <HiClipboardList /> Application Status
          </h1>
          <p className="mt-1 text-gray-600">
            B.Tech students of a batch who have not applied to any faculty yet,
            and groups still waiting for a faculty with the faculty they chose
            in order of preference.
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <select
              aria-label="Project"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                // Let the server pick the batch doing this project.
                setBatch("");
              }}
              className={inputClass}
            >
              {PROJECTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className={inputClass}
            >
              {(data?.batches || []).map((b) => (
                <option key={b} value={String(b)}>
                  K{b}
                  {b === data?.projectBatch ? ` (doing ${projectLabel})` : ""}
                </option>
              ))}
            </select>
            <input
              aria-label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roll number, name, group or faculty"
              className={`${inputClass} md:col-span-2`}
            />
          </div>

          {data?.projectBatch && data.batch !== data.projectBatch && (
            <p className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              K{data.batch} is not doing {projectLabel} this year;{" "}
              {projectLabel} is done by{" "}
              <button
                type="button"
                onClick={() => setBatch(String(data.projectBatch))}
                className="font-semibold underline"
              >
                K{data.projectBatch}
              </button>
              . The counts below are for K{data.batch}.
            </p>
          )}

          {data && (
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <SummaryCard
                label="Students in batch"
                value={data.summary.students}
                tone="border-gray-200"
              />
              <SummaryCard
                label="Not applied"
                value={data.summary.notApplied}
                tone="border-red-200 text-red-700"
              />
              <SummaryCard
                label="Waiting for faculty"
                value={data.summary.waiting}
                tone="border-yellow-200 text-yellow-700"
              />
              <SummaryCard
                label="Allotted"
                value={data.summary.allotted}
                tone="border-green-200 text-green-700"
              />
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-gray-200">
            {[
              {
                key: "notApplied",
                label: `Not Applied (${notApplied.length})`,
              },
              {
                key: "notAllotted",
                label: `Not Allotted: Preferences (${notAllotted.length} group${notAllotted.length === 1 ? "" : "s"})`,
              },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
                  tab === t.key
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 pb-2">
              <button
                type="button"
                onClick={load}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
              >
                <HiRefresh /> Refresh
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDownload().catch(() =>
                    Swal.fire({
                      icon: "error",
                      title: "Could not create the Excel file",
                    })
                  )
                }
                disabled={rowsInTab === 0}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <FaFileExcel /> Download Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <p className="py-10 text-center text-gray-500">Loading...</p>
            ) : tab === "notApplied" ? (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-left text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Group</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {notApplied.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Every student of this batch has applied.
                      </td>
                    </tr>
                  ) : (
                    notApplied.map((s) => (
                      <tr key={s._id} className="border-t border-gray-100">
                        <td className="px-4 py-3">{s.rollNumber}</td>
                        <td className="px-4 py-3 capitalize">{s.fullName}</td>
                        <td className="px-4 py-3">
                          {s.branch?.toUpperCase() || "—"}
                        </td>
                        <td className="px-4 py-3">{s.section || "—"}</td>
                        <td className="px-4 py-3">{s.mobileNumber || "—"}</td>
                        <td className="px-4 py-3">{s.groupId || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            {s.reason}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-left text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Group</th>
                    <th className="px-4 py-3">Members</th>
                    <th className="px-4 py-3">
                      Faculty preferences (in order)
                    </th>
                    <th className="px-4 py-3">Declined by</th>
                    <th className="px-4 py-3">With current faculty since</th>
                  </tr>
                </thead>
                <tbody>
                  {notAllotted.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No group of this batch is waiting for a faculty.
                      </td>
                    </tr>
                  ) : (
                    notAllotted.map((g) => (
                      <tr
                        key={g._id}
                        className="border-t border-gray-100 align-top"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {g.groupId}
                          {g.projectTitle && (
                            <p className="text-xs font-normal text-gray-500">
                              {g.projectTitle}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ul className="space-y-0.5">
                            {g.members.map((m) => (
                              <li key={m._id}>
                                {m.rollNumber}{" "}
                                <span className="capitalize text-gray-600">
                                  {m.fullName}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3">
                          <ol className="space-y-1">
                            {g.preferences.map((p, i) => (
                              <li
                                key={p._id}
                                className="flex items-center gap-2"
                              >
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                  {i + 1}
                                </span>
                                <span>
                                  {p.fullName}{" "}
                                  <span className="text-xs text-gray-500">
                                    ({p.idNumber})
                                  </span>
                                </span>
                                {i === 0 && (
                                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                                    reviewing now
                                  </span>
                                )}
                              </li>
                            ))}
                          </ol>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {g.declined.length
                            ? g.declined.map((p) => p.fullName).join(", ")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(g.waitingSince)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminApplicationStatus;
