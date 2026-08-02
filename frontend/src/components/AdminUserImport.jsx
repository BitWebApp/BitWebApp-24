import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiCheckCircle,
  HiCloudUpload,
  HiDocumentDownload,
  HiExclamationCircle,
  HiMail,
  HiPaperAirplane,
  HiRefresh,
  HiUserAdd,
  HiXCircle,
} from "react-icons/hi";
import Swal from "sweetalert2";

const REQUEST_TIMEOUT = 5 * 60 * 1000; // bulk mailing can take a while

const EMPTY_FORM = {
  rollNumber: "",
  fullName: "",
  email: "",
  batch: "",
  branch: "",
  section: "",
  mobileNumber: "",
  username: "",
};

const statusStyles = {
  ready: "bg-green-100 text-green-700",
  created: "bg-green-100 text-green-700",
  done: "bg-green-100 text-green-700",
  sent: "bg-green-100 text-green-700",
  invalid: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-yellow-100 text-yellow-700",
  pending: "bg-yellow-100 text-yellow-700",
};

const StatusPill = ({ status }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
      statusStyles[status] || "bg-gray-100 text-gray-700"
    }`}
  >
    {status}
  </span>
);

const SummaryCard = ({ label, value, tone = "gray" }) => {
  const tones = {
    gray: "border-gray-200 text-gray-700",
    green: "border-green-300 text-green-700",
    red: "border-red-300 text-red-700",
    yellow: "border-yellow-300 text-yellow-700",
    blue: "border-blue-300 text-blue-700",
  };
  return (
    <div className={`rounded-lg border bg-white px-4 py-3 shadow-sm ${tones[tone]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
    </div>
  );
};

const readApiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

/**
 * Shows how much of the provider's send allowance is left in the current
 * window, so the admin can size a batch before starting it.
 */
const QuotaBanner = ({ quota, onRefresh, refreshing }) => {
  if (!quota) return null;
  const pct = quota.limit ? Math.min(100, (quota.used / quota.limit) * 100) : 0;
  const exhausted = quota.remaining <= 0;

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        exhausted ? "border-red-300 bg-red-50" : "border-blue-200 bg-blue-50"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-gray-800">
          Email allowance:{" "}
          <span className={exhausted ? "text-red-700" : "text-blue-700"}>
            {quota.remaining} of {quota.limit} left
          </span>{" "}
          <span className="text-sm font-normal text-gray-600">
            (last {quota.windowHours}h)
          </span>
        </p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            <HiRefresh className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white">
        <div
          className={`h-full ${exhausted ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {exhausted && quota.resetsAt && (
        <p className="mt-2 text-sm text-red-700">
          Quota is used up. Capacity frees up from{" "}
          {new Date(quota.resetsAt).toLocaleString()}. Accounts stay queued until
          then — nothing is lost.
        </p>
      )}
    </div>
  );
};

const AdminUserImport = () => {
  const [tab, setTab] = useState("csv");

  // CSV import state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [autoVerify, setAutoVerify] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [mailLimit, setMailLimit] = useState("");

  // Single registration state
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Welcome-mail queue state
  const [queue, setQueue] = useState(null);
  const [queueStatus, setQueueStatus] = useState("unsent");
  const [queueSearch, setQueueSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [queuePage, setQueuePage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sendCount, setSendCount] = useState("");
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendReport, setSendReport] = useState(null);

  const quota = queue?.quota ?? null;
  const readyCount = preview?.summary?.ready ?? 0;

  const fetchQueue = useCallback(async () => {
    try {
      setLoadingQueue(true);
      const response = await axios.get("/api/v1/admin/user-import/pending", {
        params: {
          status: queueStatus,
          search: debouncedSearch || undefined,
          page: queuePage,
          limit: 50,
        },
      });
      setQueue(response.data.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not load the queue",
        text: readApiError(err, "Failed to fetch pending welcome emails."),
      });
    } finally {
      setLoadingQueue(false);
    }
  }, [queueStatus, debouncedSearch, queuePage]);

  // Keep typing in the search box from firing a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(queueSearch), 350);
    return () => clearTimeout(timer);
  }, [queueSearch]);

  useEffect(() => {
    if (tab === "queue") fetchQueue();
  }, [tab, fetchQueue]);

  const queueUsers = queue?.users ?? [];
  const selectableIds = useMemo(
    () =>
      queueUsers
        .filter((u) => u.onboarding?.welcomeMailStatus !== "sent")
        .map((u) => u._id),
    [queueUsers]
  );
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : selectableIds);
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const dispatchMails = async (payload, confirmText) => {
    const confirmed = await Swal.fire({
      icon: "question",
      title: "Send welcome emails?",
      text: confirmText,
      showCancelButton: true,
      confirmButtonText: "Send",
      confirmButtonColor: "#2563eb",
    });
    if (!confirmed.isConfirmed) return;

    try {
      setSending(true);
      const response = await axios.post(
        "/api/v1/admin/user-import/send-mails",
        payload,
        { timeout: REQUEST_TIMEOUT }
      );
      const data = response.data.data;
      setSendReport(data);
      setSelectedIds([]);
      await fetchQueue();
      Swal.fire({
        icon: data.summary.sent > 0 ? "success" : "warning",
        title: "Done",
        text: response.data.message,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Sending failed",
        text: readApiError(err, "Failed to send welcome emails."),
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendSelected = () =>
    dispatchMails(
      { userIds: selectedIds },
      `${selectedIds.length} selected student(s) will receive their login credentials.`
    );

  const handleSendNext = () => {
    const n = Number(sendCount);
    if (!n || n < 1) {
      Swal.fire({
        icon: "warning",
        title: "Enter a number",
        text: "How many students should be mailed in this batch?",
      });
      return;
    }
    return dispatchMails(
      { count: n },
      `The ${n} longest-waiting student(s) in the queue will be mailed.`
    );
  };

  const rowsToShow = useMemo(() => {
    if (importResult) return importResult.results;
    return preview?.rows ?? [];
  }, [preview, importResult]);

  const resetCsvState = () => {
    setFile(null);
    setPreview(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setPreview(null);
    setImportResult(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get("/api/v1/admin/user-import/template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user-import-template.csv");
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
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "No file selected",
        text: "Choose a .csv file first.",
      });
      return;
    }
    try {
      setPreviewing(true);
      setImportResult(null);
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        "/api/v1/admin/user-import/preview",
        formData,
        { timeout: REQUEST_TIMEOUT }
      );
      setPreview(response.data.data);
    } catch (err) {
      setPreview(null);
      Swal.fire({
        icon: "error",
        title: "Could not read the CSV",
        text: readApiError(err, "Failed to validate the file."),
      });
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!file || readyCount === 0) return;

    const confirmed = await Swal.fire({
      icon: "question",
      title: `Onboard ${readyCount} student(s)?`,
      html: sendEmail
        ? "Accounts will be created and login credentials emailed to each student."
        : "Accounts will be created. <b>No emails will be sent.</b>",
      showCancelButton: true,
      confirmButtonText: "Yes, create accounts",
      confirmButtonColor: "#2563eb",
    });
    if (!confirmed.isConfirmed) return;

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("autoVerify", String(autoVerify));
      formData.append("sendEmail", String(sendEmail));
      if (mailLimit !== "") formData.append("mailLimit", String(mailLimit));
      const response = await axios.post(
        "/api/v1/admin/user-import/import",
        formData,
        { timeout: REQUEST_TIMEOUT }
      );
      const data = response.data.data;
      setImportResult(data);
      Swal.fire({
        icon: data.summary.created > 0 ? "success" : "warning",
        title: "Import finished",
        html: `${data.summary.created} created, ${data.summary.skipped} skipped, ${data.summary.failed} failed.<br/>${data.summary.mailsSent} email(s) sent${
          data.summary.stillQueued > 0
            ? `, <b>${data.summary.stillQueued} still queued</b> — send them from the Welcome Emails tab.`
            : "."
        }`,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Import failed",
        text: readApiError(err, "Failed to import the file."),
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadReport = () => {
    if (!importResult) return;
    const headers = [
      "rowNumber",
      "rollNumber",
      "fullName",
      "email",
      "batch",
      "status",
      "mailSent",
      "message",
    ];
    const escape = (value) => {
      const str = value === null || value === undefined ? "" : String(value);
      return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const csv = [
      headers.join(","),
      ...importResult.results.map((row) =>
        headers.map((header) => escape(row[header])).join(",")
      ),
    ].join("\r\n");

    const url = window.URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user-import-report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await axios.post("/api/v1/admin/user-import/register", {
        ...form,
        autoVerify,
        sendEmail,
      });
      const data = response.data.data;
      Swal.fire({
        icon: data.mailSent || !sendEmail ? "success" : "warning",
        title: "Account created",
        text: response.data.message,
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not create the account",
        text: readApiError(err, "Failed to register the student."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-blue-700">
            <HiUserAdd /> User Onboarding
          </h1>
          <p className="mt-1 text-gray-600">
            Bulk-register students from a CSV file or add them one at a time. Each
            new account gets a generated password emailed to them.
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {[
            { key: "csv", label: "CSV Import", icon: <HiCloudUpload /> },
            { key: "single", label: "Single User", icon: <HiUserAdd /> },
            {
              key: "queue",
              label: "Welcome Emails",
              icon: <HiPaperAirplane />,
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2 font-semibold transition ${
                tab === item.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Shared options */}
        {tab !== "queue" && (
          <div className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="h-4 w-4"
                />
                <HiMail className="text-blue-600" />
                Email credentials right away
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={autoVerify}
                  onChange={(e) => setAutoVerify(e.target.checked)}
                  className="h-4 w-4"
                />
                <HiCheckCircle className="text-green-600" />
                Mark accounts as verified (they can log in immediately)
              </label>
              {tab === "csv" && sendEmail && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  Mail only the first
                  <input
                    type="number"
                    min="0"
                    value={mailLimit}
                    onChange={(e) => setMailLimit(e.target.value)}
                    placeholder="all"
                    className="w-20 rounded border border-gray-300 px-2 py-1"
                  />
                  student(s)
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Accounts are always created. Anyone not mailed now is queued and
              stays in the <b>Welcome Emails</b> tab until you send them — the
              provider&apos;s send limit is never exceeded.
            </p>
          </div>
        )}

        {tab === "csv" && (
          <section className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  1. Upload the CSV
                </h2>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  <HiDocumentDownload /> Download template
                </button>
              </div>

              <p className="mb-4 text-sm text-gray-600">
                Required columns:{" "}
                <code className="rounded bg-gray-100 px-1">rollNumber</code>,{" "}
                <code className="rounded bg-gray-100 px-1">fullName</code>,{" "}
                <code className="rounded bg-gray-100 px-1">email</code>,{" "}
                <code className="rounded bg-gray-100 px-1">batch</code>. Optional:{" "}
                <code className="rounded bg-gray-100 px-1">branch</code>,{" "}
                <code className="rounded bg-gray-100 px-1">section</code>,{" "}
                <code className="rounded bg-gray-100 px-1">mobileNumber</code>,{" "}
                <code className="rounded bg-gray-100 px-1">username</code> (defaults
                to the roll number). Up to 500 rows per file.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="block w-full max-w-sm rounded-lg border border-gray-300 p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white"
                />
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!file || previewing}
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {previewing ? "Validating..." : "Validate file"}
                </button>
                {(file || preview) && (
                  <button
                    type="button"
                    onClick={resetCsvState}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {preview && !importResult && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                  2. Review &amp; import
                </h2>
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  <SummaryCard label="Rows found" value={preview.summary.total} />
                  <SummaryCard
                    label="Ready"
                    value={preview.summary.ready}
                    tone="green"
                  />
                  <SummaryCard
                    label="Needs fixing"
                    value={preview.summary.invalid}
                    tone="red"
                  />
                </div>
                {preview.summary.invalid > 0 && (
                  <p className="mb-4 flex items-start gap-2 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                    <HiExclamationCircle className="mt-0.5 shrink-0" />
                    Rows with errors will be skipped. Fix them in the CSV and upload
                    again to onboard those students.
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={readyCount === 0 || importing}
                  className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {importing
                    ? "Creating accounts..."
                    : `Create ${readyCount} account(s)${sendEmail ? " & send emails" : ""}`}
                </button>
              </div>
            )}

            {importResult && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Import results
                  </h2>
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    <HiDocumentDownload /> Download report
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                  <SummaryCard label="Rows" value={importResult.summary.total} />
                  <SummaryCard
                    label="Created"
                    value={importResult.summary.created}
                    tone="green"
                  />
                  <SummaryCard
                    label="Skipped"
                    value={importResult.summary.skipped}
                    tone="yellow"
                  />
                  <SummaryCard
                    label="Failed"
                    value={importResult.summary.failed}
                    tone="red"
                  />
                  <SummaryCard
                    label="Emails sent"
                    value={importResult.summary.mailsSent}
                    tone="blue"
                  />
                  <SummaryCard
                    label="Still queued"
                    value={importResult.summary.stillQueued}
                    tone="yellow"
                  />
                </div>
                {importResult.summary.stillQueued > 0 && (
                  <p className="mt-4 flex items-start gap-2 rounded border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800">
                    <HiExclamationCircle className="mt-0.5 shrink-0" />
                    {importResult.summary.stillQueued} account(s) were created but
                    not mailed, because of the send limit. Open the{" "}
                    <button
                      type="button"
                      onClick={() => setTab("queue")}
                      className="font-semibold underline"
                    >
                      Welcome Emails
                    </button>{" "}
                    tab to send them in batches.
                  </p>
                )}
                {importResult.quota && (
                  <div className="mt-4">
                    <QuotaBanner quota={importResult.quota} />
                  </div>
                )}
              </div>
            )}

            {rowsToShow.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-left text-gray-700">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Batch</th>
                      <th className="px-4 py-3">Status</th>
                      {importResult && <th className="px-4 py-3">Mail</th>}
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsToShow.map((row) => {
                      const info = importResult ? row : row.data;
                      const details = importResult
                        ? row.message
                        : row.errors.join("; ");
                      return (
                        <tr
                          key={row.rowNumber}
                          className="border-t border-gray-100 align-top"
                        >
                          <td className="px-4 py-3 text-gray-500">
                            {row.rowNumber}
                          </td>
                          <td className="px-4 py-3">{info.rollNumber || "—"}</td>
                          <td className="px-4 py-3 capitalize">
                            {info.fullName || "—"}
                          </td>
                          <td className="px-4 py-3">{info.email || "—"}</td>
                          <td className="px-4 py-3">
                            {info.batch !== null && info.batch !== undefined
                              ? `K${info.batch}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill status={row.status} />
                          </td>
                          {importResult && (
                            <td className="px-4 py-3">
                              {row.status === "created" ? (
                                row.mailSent ? (
                                  <HiCheckCircle
                                    className="text-lg text-green-600"
                                    title="Email sent"
                                  />
                                ) : (
                                  <HiXCircle
                                    className="text-lg text-red-600"
                                    title="Email not sent"
                                  />
                                )
                              ) : (
                                "—"
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3 text-gray-600">
                            {details || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "single" && (
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Register a single student
            </h2>
            <form onSubmit={handleSingleSubmit} className="grid gap-4 md:grid-cols-2">
              {[
                { name: "rollNumber", label: "Roll Number", required: true },
                { name: "fullName", label: "Full Name", required: true },
                {
                  name: "email",
                  label: "Email",
                  required: true,
                  type: "email",
                },
                {
                  name: "batch",
                  label: "Batch (e.g. 22, K22 or 2022)",
                  required: true,
                },
                { name: "branch", label: "Branch" },
                { name: "section", label: "Section" },
                { name: "mobileNumber", label: "Mobile Number (10 digits)" },
                {
                  name: "username",
                  label: "Username (defaults to roll number)",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="mb-1 block text-sm font-semibold text-gray-700"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type || "text"}
                    value={form[field.name]}
                    onChange={handleFormChange}
                    required={field.required}
                    className="w-full rounded-lg border border-gray-300 p-3 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <HiUserAdd />
                  {saving ? "Creating..." : "Create account"}
                </button>
              </div>
            </form>
          </section>
        )}

        {tab === "queue" && (
          <section className="space-y-6">
            <QuotaBanner
              quota={quota}
              onRefresh={fetchQueue}
              refreshing={loadingQueue}
            />

            {queue && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <SummaryCard
                  label="Awaiting email"
                  value={queue.counts.pending}
                  tone="yellow"
                />
                <SummaryCard
                  label="Previously failed"
                  value={queue.counts.failed}
                  tone="red"
                />
                <SummaryCard
                  label="Done"
                  value={queue.counts.sent}
                  tone="green"
                />
                <SummaryCard
                  label="Selected"
                  value={selectedIds.length}
                  tone="blue"
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <label
                  htmlFor="queueStatus"
                  className="mb-1 block text-xs font-semibold uppercase text-gray-500"
                >
                  Show
                </label>
                <select
                  id="queueStatus"
                  value={queueStatus}
                  onChange={(e) => {
                    setQueueStatus(e.target.value);
                    setQueuePage(1);
                    setSelectedIds([]);
                  }}
                  className="rounded-lg border border-gray-300 p-2 text-sm"
                >
                  <option value="unsent">Not yet emailed</option>
                  <option value="pending">Pending only</option>
                  <option value="failed">Failed only</option>
                  <option value="sent">Done</option>
                  <option value="all">All onboarded</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="queueSearch"
                  className="mb-1 block text-xs font-semibold uppercase text-gray-500"
                >
                  Search
                </label>
                <input
                  id="queueSearch"
                  value={queueSearch}
                  onChange={(e) => {
                    setQueueSearch(e.target.value);
                    setQueuePage(1);
                  }}
                  placeholder="Name, roll number or email"
                  className="w-64 rounded-lg border border-gray-300 p-2 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleSendSelected}
                disabled={selectedIds.length === 0 || sending}
                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {sending ? "Sending..." : `Send to selected (${selectedIds.length})`}
              </button>

              <div className="flex items-end gap-2">
                <div>
                  <label
                    htmlFor="sendCount"
                    className="mb-1 block text-xs font-semibold uppercase text-gray-500"
                  >
                    Or send next
                  </label>
                  <input
                    id="sendCount"
                    type="number"
                    min="1"
                    max={quota?.remaining || undefined}
                    value={sendCount}
                    onChange={(e) => setSendCount(e.target.value)}
                    placeholder={quota ? String(quota.remaining) : "50"}
                    className="w-24 rounded-lg border border-gray-300 p-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendNext}
                  disabled={sending || !quota?.remaining}
                  className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Send batch
                </button>
              </div>
            </div>

            {sendReport && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-gray-800">
                  Last batch: {sendReport.summary.sent} sent,{" "}
                  {sendReport.summary.failed} failed
                  {sendReport.summary.droppedForQuota > 0 &&
                    `, ${sendReport.summary.droppedForQuota} left queued (quota reached)`}
                </p>
              </div>
            )}

            {/* Queue table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-left text-gray-700">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        disabled={selectableIds.length === 0}
                        className="h-4 w-4"
                      />
                    </th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Mail status</th>
                    <th className="px-4 py-3">Sent at</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingQueue && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loadingQueue && queueUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Nothing here. Every onboarded student in view has been
                        emailed.
                      </td>
                    </tr>
                  )}
                  {!loadingQueue &&
                    queueUsers.map((user) => {
                      const mailStatus =
                        user.onboarding?.welcomeMailStatus || "pending";
                      const isSent = mailStatus === "sent";
                      return (
                        <tr key={user._id} className="border-t border-gray-100">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(user._id)}
                              onChange={() => toggleOne(user._id)}
                              disabled={isSent}
                              className="h-4 w-4"
                            />
                          </td>
                          <td className="px-4 py-3">{user.rollNumber}</td>
                          <td className="px-4 py-3 capitalize">{user.fullName}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">K{user.batch}</td>
                          <td className="px-4 py-3">
                            <StatusPill
                              status={isSent ? "done" : mailStatus}
                            />
                            {mailStatus === "failed" &&
                              user.onboarding?.welcomeMailError && (
                                <p className="mt-1 text-xs text-red-600">
                                  {user.onboarding.welcomeMailError}
                                </p>
                              )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {user.onboarding?.welcomeMailSentAt
                              ? new Date(
                                  user.onboarding.welcomeMailSentAt
                                ).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {queue?.pagination && queue.pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                  disabled={queuePage <= 1}
                  className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {queue.pagination.page} of {queue.pagination.pages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQueuePage((p) => Math.min(queue.pagination.pages, p + 1))
                  }
                  disabled={queuePage >= queue.pagination.pages}
                  className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminUserImport;
