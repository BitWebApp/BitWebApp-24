import axios from "axios";
import ExcelJS from "exceljs";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import { HiChartBar, HiExclamation, HiRefresh } from "react-icons/hi";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { yearLabel } from "../utils/projectEligibility";
import { sessionLabel } from "../utils/sessions";

const DEFAULT_FILTERS = {
  program: "all",
  batch: "current",
  branch: "all",
  section: "all",
};

/** Filter value the server uses for a blank branch or section. */
const NOT_SET = "none";

// One series: every bar is the same blue.
const BAR_COLOR = "#2a78d6";

// Where students stand in a group project, most to least settled. An
// ordinal blue ramp, darkest = allotted (validated light->dark, one hue).
const STAGES = [
  { key: "allotted", label: "Allotted", color: "#104281" },
  { key: "waiting", label: "Waiting for faculty", color: "#256abf" },
  {
    key: "appliedNowhere",
    label: "In a group, no faculty yet",
    color: "#5598e7",
  },
  { key: "notInGroup", label: "Not in a group", color: "#86b6ef" },
];

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const thClass = "whitespace-nowrap px-4 py-3 font-semibold";
const tdClass = "px-4 py-3";

const readApiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const textLabel = (value) => (value === "" ? "Not set" : value);

const batchLabel = (b) =>
  b.batch === null ? `${b.programLabel} (no batch)` : `${b.programLabel} K${b.batch}`;

const yearText = (b) =>
  b.year === null
    ? "—"
    : b.passedOut
      ? "Passed out"
      : b.year < 1
        ? "Not started yet"
        : yearLabel(b.year);

const formatNumber = (value) =>
  value === null || value === undefined
    ? "—"
    : Number(value).toLocaleString("en-IN");

const StatTile = ({ label, value, note }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    {note && <p className="mt-0.5 text-xs text-gray-500">{note}</p>}
  </div>
);

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  note: PropTypes.string,
};

/** A number with a thin bar showing its size against the largest one. */
const InlineBar = ({ value, max }) => (
  <div className="flex min-w-[9rem] items-center gap-3">
    <span className="w-12 shrink-0 text-right tabular-nums text-gray-900">
      {formatNumber(value)}
    </span>
    <div className="h-2 flex-1 rounded-sm bg-gray-100">
      <div
        className="h-2 rounded-r"
        style={{
          width: `${max ? Math.min((value / max) * 100, 100) : 0}%`,
          backgroundColor: BAR_COLOR,
        }}
      />
    </div>
  </div>
);

InlineBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
};

/** Share of a batch's students in each stage, with a hover readout. */
const StageBar = ({ row }) => {
  const [hovered, setHovered] = useState(null);
  const segments = STAGES.map((stage) => ({
    ...stage,
    value: row[stage.key],
  })).filter((s) => s.value > 0);
  let start = 0;
  const placed = segments.map((s) => {
    const width = (s.value / row.students) * 100;
    const segment = { ...s, start, width };
    start += width;
    return segment;
  });
  const active = placed.find((s) => s.key === hovered);

  return (
    <div
      className="relative min-w-[12rem]"
      role="img"
      aria-label={STAGES.map((s) => `${s.label}: ${row[s.key]}`).join(", ")}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="flex h-4 overflow-hidden rounded bg-gray-100">
        {placed.map((s) => (
          <div
            key={s.key}
            onMouseEnter={() => setHovered(s.key)}
            className="h-4 border-r-2 border-white last:border-r-0"
            style={{ width: `${s.width}%`, backgroundColor: s.color }}
          />
        ))}
      </div>
      {active && (
        <div
          className="pointer-events-none absolute bottom-6 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 shadow-md"
          style={{ left: `${active.start + active.width / 2}%` }}
        >
          <span className="font-semibold text-gray-900">{active.label}</span>:{" "}
          {active.value} of {row.students} (
          {Math.round((active.value / row.students) * 1000) / 10}%)
        </div>
      )}
    </div>
  );
};

StageBar.propTypes = {
  row: PropTypes.shape({
    students: PropTypes.number.isRequired,
  }).isRequired,
};

const Section = ({ title, note, children, action }) => (
  <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {note && <p className="mt-0.5 text-sm text-gray-500">{note}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

Section.propTypes = {
  title: PropTypes.string.isRequired,
  note: PropTypes.node,
  children: PropTypes.node,
  action: PropTypes.node,
};

const Empty = ({ children }) => (
  <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
    {children}
  </p>
);

Empty.propTypes = { children: PropTypes.node };

/** Add a sheet with bold headers and columns sized to their content. */
const addSheet = (workbook, name, columns, rows) => {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key }));
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => {
    let width = column.header.length;
    column.eachCell((cell) => {
      width = Math.max(width, String(cell.value ?? "").length);
    });
    column.width = Math.min(width + 3, 50);
  });
};

/**
 * Admin page summarising the platform for the students chosen by the
 * filters: totals, students by batch and branch, group project progress,
 * individual allotments, records and faculty seats. Batch coordinators
 * see their own batches only.
 */
const AdminPlatformSummary = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/admin/platform-summary", {
        params: filters,
      });
      setData(response.data.data);
    } catch (err) {
      setData(null);
      Swal.fire({
        icon: "error",
        title: "Could not load the summary",
        text: readApiError(err, "Failed to load the platform summary."),
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const options = data?.options;
  // Batch numbers for the chosen program; a number is "archived" when every
  // program's batch with that number is.
  const batchOptions = useMemo(() => {
    const entries = (options?.batches || []).filter(
      (b) =>
        b.batch !== null &&
        (filters.program === "all" || b.program === filters.program)
    );
    const numbers = [...new Set(entries.map((b) => b.batch))].sort(
      (a, b) => b - a
    );
    return numbers.map((n) => ({
      value: String(n),
      archived: entries.filter((b) => b.batch === n).every((b) => b.archived),
    }));
  }, [options, filters.program]);

  const filtersChanged = Object.keys(DEFAULT_FILTERS).some(
    (key) => filters[key] !== DEFAULT_FILTERS[key]
  );

  const filterText = useMemo(() => {
    if (!options) return "";
    const program =
      filters.program === "all"
        ? "All programs"
        : options.programs.find((p) => p.value === filters.program)?.label ||
          filters.program;
    const batch =
      filters.batch === "current"
        ? "Current batches"
        : filters.batch === "all"
          ? "All batches (incl. archived)"
          : `K${filters.batch}`;
    const text = (value, all, name) =>
      value === "all"
        ? all
        : value === NOT_SET
          ? `${name} not set`
          : `${name} ${value}`;
    return [
      program,
      batch,
      text(filters.branch, "All branches", "Branch"),
      text(filters.section, "All sections", "Section"),
    ].join(" · ");
  }, [filters, options]);

  const projectRows = (project) =>
    project.rows.map((row) => ({
      ...row,
      appliedNowhere: row.noFaculty + row.declined,
    }));

  const downloadExcel = async () => {
    if (!data) return;
    const workbook = new ExcelJS.Workbook();
    addSheet(
      workbook,
      "Filters",
      [
        { header: "Filter", key: "name" },
        { header: "Value", key: "value" },
      ],
      [
        { name: "Students", value: filterText },
        { name: "Downloaded", value: new Date().toLocaleString("en-IN") },
        { name: "Total students", value: data.totals.students },
        { name: "Verified", value: data.totals.verified },
        { name: "Unverified", value: data.totals.unverified },
        { name: "Faculty", value: data.totals.professors },
      ]
    );
    addSheet(
      workbook,
      "By batch",
      [
        { header: "Program", key: "programLabel" },
        { header: "Batch", key: "batch" },
        { header: "Year of study", key: "year" },
        { header: "Students", key: "students" },
        { header: "Verified", key: "verified" },
        { header: "Unverified", key: "unverified" },
        { header: "Status", key: "status" },
      ],
      data.byBatch.map((b) => ({
        ...b,
        batch: b.batch === null ? "—" : `K${b.batch}`,
        year: yearText(b),
        status: b.archived ? "Archived" : "Active",
      }))
    );
    const branchNames = data.byBranch.map((b) => b.branch);
    addSheet(
      workbook,
      "Batch x branch",
      [
        { header: "Batch", key: "batch" },
        ...branchNames.map((name, i) => ({
          header: textLabel(name),
          key: `b${i}`,
        })),
        { header: "Total", key: "total" },
      ],
      data.byBatch.map((b) => ({
        batch: batchLabel(b),
        ...Object.fromEntries(
          branchNames.map((name, i) => [`b${i}`, b.branches[name] || 0])
        ),
        total: b.students,
      }))
    );
    addSheet(
      workbook,
      "By branch",
      [
        { header: "Branch", key: "branch" },
        { header: "Students", key: "students" },
        { header: "Share %", key: "percent" },
        { header: "Verified", key: "verified" },
        ...options.programs.map((p) => ({
          header: p.label,
          key: p.value,
        })),
      ],
      data.byBranch.map((b) => ({
        ...b,
        branch: textLabel(b.branch),
        ...Object.fromEntries(
          options.programs.map((p) => [p.value, b.programs[p.value] || 0])
        ),
      }))
    );
    addSheet(
      workbook,
      "Group projects",
      [
        { header: "Project", key: "project" },
        { header: "Batch", key: "batch" },
        { header: "Doing it this year", key: "doing" },
        { header: "Students", key: "students" },
        { header: "Allotted", key: "allotted" },
        { header: "Allotted %", key: "allottedPercent" },
        { header: "Waiting for faculty", key: "waiting" },
        { header: "In a group, no faculty chosen", key: "noFaculty" },
        { header: "Every faculty declined", key: "declined" },
        { header: "Not in a group", key: "notInGroup" },
        { header: "Groups", key: "groups" },
      ],
      data.projects.flatMap((p) =>
        p.rows.map((row) => ({
          ...row,
          project: p.label,
          batch: `K${row.batch}`,
          doing: row.doing ? "Yes" : "",
        }))
      )
    );
    addSheet(
      workbook,
      "Individual allotments",
      [
        { header: "Course", key: "label" },
        { header: "Program", key: "programLabel" },
        { header: "Regular", key: "regular" },
        { header: "Back paper", key: "backPaper" },
        {
          header: `This session (${sessionLabel(data.allotments.session)})`,
          key: "thisSession",
        },
        { header: "Total", key: "total" },
      ],
      data.allotments.rows
    );
    addSheet(
      workbook,
      "Records",
      [
        { header: "Record", key: "label" },
        { header: "Students", key: "students" },
        { header: "Share %", key: "percent" },
        { header: "Records", key: "records" },
      ],
      [
        {
          label: "Placed",
          students: data.records.placements.placedStudents,
          percent:
            data.totals.students &&
            Math.round(
              (data.records.placements.placedStudents / data.totals.students) *
                1000
            ) / 10,
          records: data.records.placements.offers,
        },
        ...data.records.rows.map((row) => ({
          ...row,
          records: row.records ?? "",
        })),
      ]
    );
    addSheet(
      workbook,
      "Faculty seats",
      [
        { header: "Project", key: "label" },
        { header: "Seats", key: "seats" },
        { header: "Filled", key: "filled" },
        { header: "Filled %", key: "filledPercent" },
        { header: "Free", key: "free" },
        { header: "Faculty at their limit", key: "full" },
      ],
      data.faculty.rows
    );
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `Platform_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const attention = data
    ? [
        data.attention.unverified > 0 && {
          text: `${data.attention.unverified} student${data.attention.unverified === 1 ? " is" : "s are"} not verified`,
          to: "/admin-db/verify-users",
          link: "Verify users",
        },
        data.attention.waitingGroups > 0 && {
          text: `${data.attention.waitingGroups} group${data.attention.waitingGroups === 1 ? " is" : "s are"} waiting for a faculty to accept`,
          to: "/admin-db/application-status",
          link: "Application Status",
        },
        data.attention.pendingRemovals > 0 && {
          text: `${data.attention.pendingRemovals} group removal request${data.attention.pendingRemovals === 1 ? "" : "s"} pending`,
          to: "/admin-db/group-removal-requests",
          link: "Removal Requests",
        },
        data.attention.openBugs > 0 && {
          text: `${data.attention.openBugs} bug report${data.attention.openBugs === 1 ? "" : "s"} open`,
          to: "/admin-db/bug-tracker",
          link: "Bug Tracker",
        },
        data.attention.passedOutNotArchived.length > 0 && {
          text: `Passed out but not archived: ${data.attention.passedOutNotArchived.join(", ")}`,
          to: "/admin-db/batches",
          link: "Batches",
        },
      ].filter(Boolean)
    : [];

  const maxBatch = Math.max(0, ...(data?.byBatch || []).map((b) => b.students));
  const maxBranch = Math.max(
    0,
    ...(data?.byBranch || []).map((b) => b.students)
  );
  const placed = data?.records.placements;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-blue-700">
              <HiChartBar /> Platform Summary
            </h1>
            <p className="mt-1 text-gray-600">
              Students by batch and branch, where each batch stands in its
              projects, allotments, records and faculty seats. Use the filters
              to narrow it down.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <HiRefresh className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              type="button"
              onClick={downloadExcel}
              disabled={!data}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              <FaFileExcel /> Download Excel
            </button>
          </div>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              aria-label="Program"
              value={filters.program}
              onChange={(e) =>
                setFilters((current) => ({
                  ...current,
                  program: e.target.value,
                  // A batch number the new program doesn't have shows nothing.
                  batch: ["current", "all"].includes(current.batch)
                    ? current.batch
                    : "current",
                }))
              }
              className={inputClass}
            >
              <option value="all">All programs</option>
              {(options?.programs || []).map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Batch"
              value={filters.batch}
              onChange={(e) => setFilter("batch", e.target.value)}
              className={inputClass}
            >
              <option value="current">Current batches</option>
              {batchOptions.map((b) => (
                <option key={b.value} value={b.value}>
                  K{b.value}
                  {b.archived ? " (archived)" : ""}
                </option>
              ))}
              <option value="all">All batches (incl. archived)</option>
            </select>
            <select
              aria-label="Branch"
              value={filters.branch}
              onChange={(e) => setFilter("branch", e.target.value)}
              className={inputClass}
            >
              <option value="all">All branches</option>
              {(options?.branches || []).map((b) => (
                <option key={b || NOT_SET} value={b || NOT_SET}>
                  {textLabel(b)}
                </option>
              ))}
            </select>
            <select
              aria-label="Section"
              value={filters.section}
              onChange={(e) => setFilter("section", e.target.value)}
              className={inputClass}
            >
              <option value="all">All sections</option>
              {(options?.sections || []).map((s) => (
                <option key={s || NOT_SET} value={s || NOT_SET}>
                  {s ? `Section ${s}` : "Section not set"}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <span>Showing: {filterText || "…"}</span>
            {filtersChanged && (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="font-semibold text-blue-700 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </section>

        {!data ? (
          <Empty>{loading ? "Loading…" : "No summary to show."}</Empty>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatTile
                label="Students"
                value={formatNumber(data.totals.students)}
              />
              <StatTile
                label="Verified"
                value={formatNumber(data.totals.verified)}
                note={`${data.totals.verifiedPercent}% of students`}
              />
              <StatTile
                label="Not verified"
                value={formatNumber(data.totals.unverified)}
              />
              <StatTile label="Batches" value={data.totals.batches} />
              <StatTile label="Branches" value={data.totals.branches} />
              <StatTile
                label="Faculty"
                value={data.totals.professors}
                note="All faculty on the platform"
              />
            </div>

            {attention.length > 0 && (
              <section className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h2 className="mb-2 flex items-center gap-2 font-semibold text-yellow-900">
                  <HiExclamation /> Needs attention
                </h2>
                <ul className="space-y-1 text-sm text-yellow-900">
                  {attention.map((item) => (
                    <li key={item.to}>
                      {item.text} ·{" "}
                      <Link
                        to={item.to}
                        className="font-semibold underline hover:no-underline"
                      >
                        {item.link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Section
              title="Students by batch"
              note="Click a batch to filter the whole page to it."
            >
              {data.byBatch.length === 0 ? (
                <Empty>No students match these filters.</Empty>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-left text-gray-700">
                      <tr>
                        <th className={thClass}>Batch</th>
                        <th className={thClass}>Year of study</th>
                        <th className={thClass}>Students</th>
                        <th className={`${thClass} text-right`}>Verified</th>
                        <th className={`${thClass} text-right`}>
                          Not verified
                        </th>
                        <th className={thClass}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byBatch.map((b) => (
                        <tr
                          key={`${b.program}-${b.batch}`}
                          className="border-t border-gray-100"
                        >
                          <td className={`${tdClass} font-semibold`}>
                            {b.batch === null ? (
                              batchLabel(b)
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setFilters((current) => ({
                                    ...current,
                                    program: b.program,
                                    batch: String(b.batch),
                                  }))
                                }
                                className="text-blue-700 hover:underline"
                              >
                                {batchLabel(b)}
                              </button>
                            )}
                          </td>
                          <td className={tdClass}>{yearText(b)}</td>
                          <td className={tdClass}>
                            <InlineBar value={b.students} max={maxBatch} />
                          </td>
                          <td className={`${tdClass} text-right tabular-nums`}>
                            {b.verified}
                          </td>
                          <td className={`${tdClass} text-right tabular-nums`}>
                            {b.unverified}
                          </td>
                          <td className={tdClass}>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                b.archived
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {b.archived ? "Archived" : "Active"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section
              title="Batch × branch"
              note="Students of each batch in each branch."
            >
              {data.byBatch.length === 0 ? (
                <Empty>No students match these filters.</Empty>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-left text-gray-700">
                      <tr>
                        <th className={thClass}>Batch</th>
                        {data.byBranch.map((br) => (
                          <th
                            key={br.branch || NOT_SET}
                            className={`${thClass} text-right`}
                          >
                            {textLabel(br.branch)}
                          </th>
                        ))}
                        <th className={`${thClass} text-right`}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byBatch.map((b) => (
                        <tr
                          key={`${b.program}-${b.batch}`}
                          className="border-t border-gray-100"
                        >
                          <td className={`${tdClass} font-semibold`}>
                            {batchLabel(b)}
                          </td>
                          {data.byBranch.map((br) => (
                            <td
                              key={br.branch || NOT_SET}
                              className={`${tdClass} text-right tabular-nums ${
                                b.branches[br.branch]
                                  ? "text-gray-900"
                                  : "text-gray-300"
                              }`}
                            >
                              {b.branches[br.branch] || 0}
                            </td>
                          ))}
                          <td
                            className={`${tdClass} text-right font-semibold tabular-nums`}
                          >
                            {b.students}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                        <td className={tdClass}>Total</td>
                        {data.byBranch.map((br) => (
                          <td
                            key={br.branch || NOT_SET}
                            className={`${tdClass} text-right tabular-nums`}
                          >
                            {br.students}
                          </td>
                        ))}
                        <td className={`${tdClass} text-right tabular-nums`}>
                          {data.totals.students}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section
              title="Students by branch"
              note={
                data.bySection.length > 0 && (
                  <>
                    Sections:{" "}
                    {data.bySection
                      .map(
                        (s) =>
                          `${s.section ? s.section : "not set"} ${s.students}`
                      )
                      .join(" · ")}
                  </>
                )
              }
            >
              {data.byBranch.length === 0 ? (
                <Empty>No students match these filters.</Empty>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-left text-gray-700">
                      <tr>
                        <th className={thClass}>Branch</th>
                        <th className={thClass}>Students</th>
                        <th className={`${thClass} text-right`}>Share</th>
                        <th className={`${thClass} text-right`}>Verified</th>
                        <th className={thClass}>Programs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byBranch.map((br) => (
                        <tr
                          key={br.branch || NOT_SET}
                          className="border-t border-gray-100"
                        >
                          <td className={`${tdClass} font-semibold`}>
                            <button
                              type="button"
                              onClick={() =>
                                setFilter("branch", br.branch || NOT_SET)
                              }
                              className="text-blue-700 hover:underline"
                            >
                              {textLabel(br.branch)}
                            </button>
                          </td>
                          <td className={tdClass}>
                            <InlineBar value={br.students} max={maxBranch} />
                          </td>
                          <td className={`${tdClass} text-right tabular-nums`}>
                            {br.percent}%
                          </td>
                          <td className={`${tdClass} text-right tabular-nums`}>
                            {br.verified}
                          </td>
                          <td className={`${tdClass} text-gray-600`}>
                            {options.programs
                              .filter((p) => br.programs[p.value])
                              .map((p) => `${p.label} ${br.programs[p.value]}`)
                              .join(" · ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section
              title="Group projects (B.Tech)"
              note="Where the students of each batch stand, counted the same way as Application Status. A batch is listed when it does the project this year or has groups in it."
            >
              <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
                {STAGES.map((s) => (
                  <span key={s.key} className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-sm"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                ))}
              </div>
              <div className="space-y-6">
                {data.projects.map((project) => (
                  <div key={project.course}>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      {project.label}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        {project.projectBatch
                          ? `Done by K${project.projectBatch} this year`
                          : "Not tied to a year of study"}
                      </span>
                    </h3>
                    {project.rows.length === 0 ? (
                      <Empty>
                        No students in these filters are doing{" "}
                        {project.label}.
                      </Empty>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-100 text-left text-gray-700">
                            <tr>
                              <th className={thClass}>Batch</th>
                              <th className={`${thClass} w-1/3`}>Progress</th>
                              <th className={`${thClass} text-right`}>
                                Students
                              </th>
                              <th className={`${thClass} text-right`}>
                                Allotted
                              </th>
                              <th className={`${thClass} text-right`}>
                                Waiting
                              </th>
                              <th className={`${thClass} text-right`}>
                                Not applied
                              </th>
                              <th className={`${thClass} text-right`}>
                                Declined
                              </th>
                              <th className={`${thClass} text-right`}>
                                Groups
                              </th>
                              <th className={thClass}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectRows(project).map((row) => (
                              <tr
                                key={row.batch}
                                className="border-t border-gray-100"
                              >
                                <td
                                  className={`${tdClass} whitespace-nowrap font-semibold`}
                                >
                                  K{row.batch}
                                  {row.doing && (
                                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                      this year
                                    </span>
                                  )}
                                  {row.archived && (
                                    <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                      archived
                                    </span>
                                  )}
                                </td>
                                <td className={tdClass}>
                                  <StageBar row={row} />
                                </td>
                                <td
                                  className={`${tdClass} text-right tabular-nums`}
                                >
                                  {row.students}
                                </td>
                                <td
                                  className={`${tdClass} text-right tabular-nums`}
                                >
                                  {row.allotted}
                                  <span className="ml-1 text-xs text-gray-500">
                                    ({row.allottedPercent}%)
                                  </span>
                                </td>
                                <td
                                  className={`${tdClass} text-right tabular-nums`}
                                >
                                  {row.waiting}
                                </td>
                                <td
                                  className={`${tdClass} text-right tabular-nums`}
                                >
                                  {row.notApplied}
                                </td>
                                <td
                                  className={`${tdClass} text-right tabular-nums`}
                                >
                                  {row.declined}
                                </td>
                                <td
                                  className={`${tdClass} text-right tabular-nums`}
                                >
                                  {row.groups}
                                </td>
                                <td className={`${tdClass} text-right`}>
                                  <Link
                                    to={`/admin-db/application-status?course=${project.course}&batch=${row.batch}`}
                                    className="whitespace-nowrap text-blue-700 hover:underline"
                                  >
                                    Open list
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="Individual allotments"
              note={`Mentors allotted to single students by admins: MCA and M.Tech courses, and B.Tech back papers. This session is ${sessionLabel(data.allotments.session)}.`}
            >
              {data.allotments.rows.length === 0 ? (
                <Empty>No individual allotments for these filters.</Empty>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-left text-gray-700">
                      <tr>
                        <th className={thClass}>Course</th>
                        <th className={thClass}>Program</th>
                        <th className={`${thClass} text-right`}>Regular</th>
                        <th className={`${thClass} text-right`}>Back paper</th>
                        <th className={`${thClass} text-right`}>
                          This session
                        </th>
                        <th className={`${thClass} text-right`}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.allotments.rows.map((row) => (
                        <tr
                          key={row.course}
                          className="border-t border-gray-100"
                        >
                          <td className={`${tdClass} font-semibold`}>
                            {row.label}
                          </td>
                          <td className={tdClass}>{row.programLabel}</td>
                          <td className={`${tdClass} text-right tabular-nums`}>
                            {row.regular}
                          </td>
                          <td className={`${tdClass} text-right tabular-nums`}>
                            {row.backPaper}
                          </td>
                          <td className={`${tdClass} text-right tabular-nums`}>
                            {row.thisSession}
                          </td>
                          <td
                            className={`${tdClass} text-right font-semibold tabular-nums`}
                          >
                            {row.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section
              title="Placements and records"
              note="What the students in these filters have added to their profiles."
            >
              <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatTile
                  label="Students placed"
                  value={formatNumber(placed.placedStudents)}
                  note={
                    data.totals.students
                      ? `${Math.round((placed.placedStudents / data.totals.students) * 1000) / 10}% of students`
                      : undefined
                  }
                />
                <StatTile label="Offers" value={formatNumber(placed.offers)} />
                <StatTile
                  label="Highest CTC"
                  value={formatNumber(placed.highestCtc)}
                  note="As entered by students"
                />
                <StatTile
                  label="Average CTC"
                  value={formatNumber(placed.averageCtc)}
                  note="Across all offers"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-left text-gray-700">
                    <tr>
                      <th className={thClass}>Record</th>
                      <th className={thClass}>Students</th>
                      <th className={`${thClass} text-right`}>Share</th>
                      <th className={`${thClass} text-right`}>Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.rows.map((row) => (
                      <tr key={row.key} className="border-t border-gray-100">
                        <td className={`${tdClass} font-semibold`}>
                          {row.label}
                        </td>
                        <td className={tdClass}>
                          <InlineBar
                            value={row.students}
                            max={data.totals.students}
                          />
                        </td>
                        <td className={`${tdClass} text-right tabular-nums`}>
                          {row.percent}%
                        </td>
                        <td className={`${tdClass} text-right tabular-nums`}>
                          {row.records ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section
              title="Faculty seats"
              note="All faculty, not affected by the filters. Seats are the limits set per faculty."
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-left text-gray-700">
                    <tr>
                      <th className={thClass}>Project</th>
                      <th className={`${thClass} text-right`}>Seats</th>
                      <th className={thClass}>Filled</th>
                      <th className={`${thClass} text-right`}>Free</th>
                      <th className={`${thClass} text-right`}>
                        Faculty at their limit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.faculty.rows.map((row) => (
                      <tr key={row.course} className="border-t border-gray-100">
                        <td className={`${tdClass} font-semibold`}>
                          {row.label}
                        </td>
                        <td className={`${tdClass} text-right tabular-nums`}>
                          {row.seats}
                        </td>
                        <td className={tdClass}>
                          <InlineBar
                            value={row.filled}
                            max={row.seats}
                          />
                        </td>
                        <td className={`${tdClass} text-right tabular-nums`}>
                          {row.free}
                        </td>
                        <td className={`${tdClass} text-right tabular-nums`}>
                          {row.full} of {data.faculty.professors}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPlatformSummary;
