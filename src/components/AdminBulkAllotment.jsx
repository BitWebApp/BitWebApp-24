import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { HiCloudUpload, HiDocumentDownload } from "react-icons/hi";
import Swal from "sweetalert2";
import { programLabel } from "../utils/programs";
import { sessionLabel, sessionLongLabel } from "../utils/sessions";

const REQUEST_TIMEOUT = 2 * 60 * 1000;

const readApiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const statusStyles = {
  ready: "bg-green-100 text-green-700",
  created: "bg-green-100 text-green-700",
  invalid: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-yellow-100 text-yellow-700",
};

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

/**
 * Admin page to allot mentors to many registered students (any program) at once from
 * an Excel (or CSV) file: download the template, fill it in, check it, then
 * import. Coordinators can only allot students of their own batches.
 */
const AdminBulkAllotment = () => {
  const [options, setOptions] = useState(null);
  const [session, setSession] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    axios
      .get("/api/v1/allotments/admin/options")
      .then((response) => {
        setOptions(response.data.data);
        setSession(response.data.data.currentSession);
      })
      .catch((err) =>
        Swal.fire({
          icon: "error",
          title: "Could not load the page",
          text: readApiError(err, "Failed to load sessions."),
        })
      );
  }, []);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formData = () => {
    const data = new FormData();
    data.append("file", file);
    data.append("session", session);
    return data;
  };

  const handleTemplate = async () => {
    try {
      const response = await axios.get(
        "/api/v1/allotments/admin/bulk/template",
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bulk-allotment-template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Download failed",
        text: readApiError(err, "Could not download the template."),
      });
    }
  };

  const handlePreview = async () => {
    try {
      setBusy(true);
      setResult(null);
      const response = await axios.post(
        "/api/v1/allotments/admin/bulk/preview",
        formData(),
        { timeout: REQUEST_TIMEOUT }
      );
      setPreview(response.data.data);
    } catch (err) {
      setPreview(null);
      Swal.fire({
        icon: "error",
        title: "Could not read the file",
        text: readApiError(err, "Failed to check the file."),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    const confirmed = await Swal.fire({
      icon: "question",
      title: `Allot ${preview.summary.ready} student(s)?`,
      text: "Each valid row gets its mentor for the course and session shown. Rows with problems are skipped.",
      showCancelButton: true,
      confirmButtonText: "Yes, allot",
      confirmButtonColor: "#2563eb",
    });
    if (!confirmed.isConfirmed) return;
    try {
      setBusy(true);
      const response = await axios.post(
        "/api/v1/allotments/admin/bulk/import",
        formData(),
        { timeout: REQUEST_TIMEOUT }
      );
      setResult(response.data.data);
      setPreview(null);
      Swal.fire({
        icon: response.data.data.summary.created > 0 ? "success" : "warning",
        title: "Bulk allotment finished",
        text: response.data.message,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Import failed",
        text: readApiError(err, "Failed to import the file."),
      });
    } finally {
      setBusy(false);
    }
  };

  if (!options) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const tableRows = result ? result.results : preview?.rows || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-blue-700">
            <HiCloudUpload /> Bulk Allotment
          </h1>
          <p className="mt-1 text-gray-600">
            Allot mentors to any registered students (B.Tech, MCA or M.Tech)
            from an Excel file. Students must already be registered.
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              1. Upload the file
            </h2>
            <button
              type="button"
              onClick={handleTemplate}
              className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <HiDocumentDownload /> Download Excel template
            </button>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Required columns:{" "}
            <code className="rounded bg-gray-100 px-1">rollNumber</code>,{" "}
            <code className="rounded bg-gray-100 px-1">course</code> (
            {options.courses.map((c) => c.label).join(", ")}
            ), <code className="rounded bg-gray-100 px-1">mentorId</code>{" "}
            (faculty ID or email). Optional:{" "}
            <code className="rounded bg-gray-100 px-1">session</code>,{" "}
            <code className="rounded bg-gray-100 px-1">type</code> (Regular or
            Back Paper; Regular when empty),{" "}
            <code className="rounded bg-gray-100 px-1">remarks</code>. For a
            B.Tech project (Regular), the student&apos;s whole group gets the
            mentor, exactly as if the mentor had accepted it; a student who is
            not in a group gets a one-person group (others can still join it). A
            student whose group already has a mentor can only be added as Back
            Paper. The template lists the faculty IDs. Up to 500 rows per file,
            .xlsx or .csv.
          </p>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label
              htmlFor="bulk-session"
              className="text-sm font-semibold text-gray-700"
            >
              Session for rows without one
            </label>
            <select
              id="bulk-session"
              value={session}
              onChange={(e) => {
                setSession(e.target.value);
                setPreview(null);
                setResult(null);
              }}
              className="rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {options.sessions.map((s) => (
                <option key={s} value={s}>
                  {sessionLabel(s)} ({sessionLongLabel(s)})
                  {s === options.currentSession ? " — current" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setPreview(null);
                setResult(null);
              }}
              className="block w-full max-w-sm rounded-lg border border-gray-300 p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white"
            />
            <button
              type="button"
              onClick={handlePreview}
              disabled={!file || busy}
              className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {busy && !preview ? "Checking..." : "Check file"}
            </button>
            {(file || preview || result) && (
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {(preview || result) && (
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {result ? "Result" : "2. Review & allot"}
            </h2>
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {result ? (
                <>
                  <SummaryCard
                    label="Rows"
                    value={result.summary.total}
                    tone="border-gray-200"
                  />
                  <SummaryCard
                    label="Allotted"
                    value={result.summary.created}
                    tone="border-green-200 text-green-700"
                  />
                  <SummaryCard
                    label="Skipped"
                    value={result.summary.skipped}
                    tone="border-yellow-200 text-yellow-700"
                  />
                  <SummaryCard
                    label="Failed"
                    value={result.summary.failed}
                    tone="border-red-200 text-red-700"
                  />
                </>
              ) : (
                <>
                  <SummaryCard
                    label="Rows"
                    value={preview.summary.total}
                    tone="border-gray-200"
                  />
                  <SummaryCard
                    label="Ready"
                    value={preview.summary.ready}
                    tone="border-green-200 text-green-700"
                  />
                  <SummaryCard
                    label="Needs fixing"
                    value={preview.summary.invalid}
                    tone="border-red-200 text-red-700"
                  />
                </>
              )}
            </div>
            {preview && (
              <button
                type="button"
                onClick={handleImport}
                disabled={busy || preview.summary.ready === 0}
                className="mb-4 rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {busy
                  ? "Allotting..."
                  : `Allot ${preview.summary.ready} student(s)`}
              </button>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-left text-gray-700">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Mentor</th>
                    <th className="px-4 py-3">Session</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className="border-t border-gray-100 align-top"
                    >
                      <td className="px-4 py-3 text-gray-500">
                        {row.rowNumber}
                      </td>
                      <td className="px-4 py-3">
                        {row.data.rollNumber || "—"}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {row.data.fullName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.data.program
                          ? programLabel(row.data.program)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.data.batch !== null ? `K${row.data.batch}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.data.courseLabel || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.data.mentorName || row.data.mentorIdNumber || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.data.session
                          ? sessionLabel(row.data.session)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.data.categoryLabel || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.data.action || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            statusStyles[row.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="min-w-[16rem] px-4 py-3 text-gray-600">
                        {result ? row.message : row.errors.join("; ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminBulkAllotment;
