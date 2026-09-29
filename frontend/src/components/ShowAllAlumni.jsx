import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

export default function AlumniTable() {
  const [alumniData, setAlumniData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [batch, setBatch] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const response = await axios.get("/api/v1/alumni/batches", {
          withCredentials: true,
        });
        const batches = response.data.data || [];
        setAvailableBatches(batches);
        if (batches.length && batch === null) {
          setBatch(batches[0]);
        }
      } catch (err) {
        console.error("Error fetching alumni batches:", err);
        setAvailableBatches([]);
      }
    };
    loadBatches();
  }, [batch]);

  useEffect(() => {
    if (batch !== null) fetchAlumniData();
  }, [batch]);

  const fetchAlumniData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/alumni/all", {
        withCredentials: true,
        params: { batch },
      });
      if (response.data.success) {
        setAlumniData(response.data.data || []);
      } else {
        setError("Failed to fetch alumni data.");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(
          err.response.data?.message ||
            "You don't have access to view data from this batch",
          { toastId: "alumni-batch-access-error" }
        );
        setAlumniData([]);
      } else {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching alumni data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Helpers ─────────────────────────────────────────── */
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
  const dash = (v) => v || "—";

  const getDocUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    return `${base}${url}`;
  };

  // Each returns array of objects with individual fields
  const fmtHigherEd = (list) =>
    list?.length
      ? list.map((e) => ({
          institution: e.institution || "",
          degree: e.degree || "",
          field: e.fieldOfStudy || "",
          from: e.startDate?.slice(0, 10) || "—",
          to: e.endDate?.slice(0, 10) || "—",
          docs: (e.docs || []).map(getDocUrl).filter(Boolean),
        }))
      : [];

  const fmtWorkExp = (list) =>
    list?.length
      ? list.map((e) => ({
          company: e.company || "",
          role: e.role || "",
          from: e.startDate?.slice(0, 10) || "—",
          to: e.isCurrentlyWorking ? "Present" : e.endDate?.slice(0, 10) || "—",
        }))
      : [];

  /* ── Excel Export ─────────────────────────────────────── */
  const exportToExcel = () => {
    if (!alumniData.length) return;

    const rows = [];

    alumniData.forEach((a, idx) => {
      const heList = fmtHigherEd(a.higherEducations);
      const weList = fmtWorkExp(a.workExperiences);
      const maxRows = Math.max(heList.length, weList.length, 1);

      for (let i = 0; i < maxRows; i++) {
        rows.push({
          "S.No": i === 0 ? idx + 1 : "",
          Name: i === 0 ? a.name : "",
          Batch: i === 0 ? a.batch : "",
          Branch: i === 0 ? a.branch : "",
          Email: i === 0 ? a.email : "",
          Mobile: i === 0 ? a.mobileNumber : "",
          "Alt Email": i === 0 ? a.alternateEmail : "",
          LinkedIn: i === 0 ? a.linkedin : "",
          "Company": weList[i]?.company || "",
          "Role": weList[i]?.role || "",
          "WE From": weList[i]?.from || "",
          "WE To": weList[i]?.to || "",
          "Institution": heList[i]?.institution || "",
          "Degree": heList[i]?.degree || "",
          "Field of Study": heList[i]?.field || "",
          "HE From": heList[i]?.from || "",
          "HE To": heList[i]?.to || "",
          "Placement – Company": i === 0 ? a.placement?.company || "" : "",
          "Placement – Role": i === 0 ? a.placement?.role || "" : "",
          "Placement – CTC (LPA)": i === 0 ? a.placement?.ctc ?? "" : "",
          "Placement – Date": i === 0 ? a.placement?.date || "" : "",
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Batch ${batch}`);
    XLSX.writeFile(wb, `Alumni_Batch_${batch}.xlsx`);
  };

  /* ── Render states ───────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading alumni data…
      </div>
    );
  }
  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  /* ── Table ───────────────────────────────────────────── */
  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={4000} />
      <h1 className="text-center text-3xl font-bold mb-6">Alumni Records</h1>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap justify-center items-center gap-3">
        <select
          value={batch ?? ""}
          onChange={(e) => setBatch(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded"
        >
          {availableBatches.length === 0 && (
            <option value="">No batches found</option>
          )}
          {availableBatches.map((bv) => (
            <option key={bv} value={bv}>
              Batch {bv}
            </option>
          ))}
        </select>
        <button
          onClick={exportToExcel}
          disabled={!alumniData.length}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Export to Excel
        </button>
        <span className="text-sm text-gray-500">
          {alumniData.length} student{alumniData.length !== 1 ? "s" : ""}
        </span>
      </div>

      {alumniData.length === 0 ? (
        <p className="text-center text-gray-500 p-4">No alumni records found.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full text-xs divide-y divide-gray-200">
            {/* ── Column groups ── */}
            <colgroup>
              <col style={{ minWidth: 40 }} />   {/* S.No */}
              <col style={{ minWidth: 140 }} />  {/* Name */}
              <col style={{ minWidth: 60 }} />   {/* Batch */}
              <col style={{ minWidth: 100 }} />  {/* Branch */}
              <col style={{ minWidth: 160 }} />  {/* Email */}
              <col style={{ minWidth: 110 }} />  {/* Mobile */}
              <col style={{ minWidth: 160 }} />  {/* Alt Email */}
              <col style={{ minWidth: 160 }} />  {/* LinkedIn */}
              {/* Placement */}
              <col style={{ minWidth: 120 }} />
              <col style={{ minWidth: 120 }} />
              <col style={{ minWidth: 80 }} />
              <col style={{ minWidth: 100 }} />
              {/* Summer */}
              <col style={{ minWidth: 140 }} />
              {/* Major */}
              <col style={{ minWidth: 140 }} />
              {/* Higher Ed — 6 cols */}
              <col style={{ minWidth: 160 }} />
              <col style={{ minWidth: 120 }} />
              <col style={{ minWidth: 120 }} />
              <col style={{ minWidth: 100 }} />
              <col style={{ minWidth: 100 }} />
              <col style={{ minWidth: 120 }} />
              {/* Work Exp — 4 cols */}
              <col style={{ minWidth: 140 }} />
              <col style={{ minWidth: 120 }} />
              <col style={{ minWidth: 100 }} />
              <col style={{ minWidth: 100 }} />
            </colgroup>

            <thead className="bg-gray-900 text-white">
              {/* Group header */}
              <tr>
                <th colSpan={8} className="px-3 py-2 text-left border-r border-gray-700">
                  Basic Info
                </th>
                <th colSpan={5} className="px-3 py-2 text-left border-r border-gray-700 bg-indigo-800">
                  Placement
                </th>
                <th className="px-3 py-2 text-left border-r border-gray-700 bg-amber-700">
                  Summer Project (Industrial)
                </th>
                <th className="px-3 py-2 text-left border-r border-gray-700 bg-teal-800">
                  Major Project (Industrial)
                </th>
                <th colSpan={6} className="px-3 py-2 text-left border-r border-gray-700 bg-purple-800">
                  Higher Education
                </th>
                <th colSpan={4} className="px-3 py-2 text-left bg-rose-800">
                  Work Experience
                </th>
              </tr>
              {/* Field header */}
              <tr className="bg-gray-800 text-gray-200 uppercase tracking-wider">
                {["S.No","Name","Batch","Branch","Email","Mobile","Alt Email","LinkedIn"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium border-r border-gray-700 whitespace-nowrap">
                    {h}
                  </th>
                ))}
                {["Company","Role","CTC (LPA)","Date","Doc"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium border-r border-gray-700 whitespace-nowrap bg-indigo-900">
                    {h}
                  </th>
                ))}
                <th className="px-3 py-2 text-left font-medium border-r border-gray-700 whitespace-nowrap bg-amber-900">
                  Org
                </th>
                <th className="px-3 py-2 text-left font-medium border-r border-gray-700 whitespace-nowrap bg-teal-900">
                  Org
                </th>
                {["Institution", "Degree", "Field of Study", "From", "To", "Docs"].map((h) => (
                  <th key={`he-${h}`} className="px-3 py-2 text-left font-medium border-r border-gray-700 whitespace-nowrap bg-purple-900">
                    {h}
                  </th>
                ))}
                {["Company", "Role", "From", "To"].map((h) => (
                  <th key={`we-${h}`} className={`px-3 py-2 text-left font-medium whitespace-nowrap bg-rose-900${h !== "To" ? " border-r border-gray-700" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {alumniData.map((a, idx) => {
                const heList = fmtHigherEd(a.higherEducations);
                const weList = fmtWorkExp(a.workExperiences);
                const maxRows = Math.max(heList.length, weList.length, 1);
                const rows = Array.from({ length: maxRows }, (_, i) => i);

                return rows.map((i) => (
                  <tr
                    key={`${idx}-${i}`}
                    className={idx % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                  >
                    {/* Basic info — only on first sub-row */}
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap font-medium text-gray-700">
                      {i === 0 ? idx + 1 : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap font-semibold">
                      {i === 0 ? a.name : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                      {i === 0 ? a.batch : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                      {i === 0 ? dash(a.branch) : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                      {i === 0 ? dash(a.email) : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                      {i === 0 ? dash(a.mobileNumber) : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                      {i === 0 ? dash(a.alternateEmail) : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">
                      {i === 0 && a.linkedin ? (
                        <a href={a.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 underline truncate block max-w-[140px]">
                          {a.linkedin}
                        </a>
                      ) : i === 0 ? "—" : ""}
                    </td>

                    {/* Placement */}
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-indigo-50">
                      {i === 0 ? dash(a.placement?.company) : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-indigo-50">
                      {i === 0 ? dash(a.placement?.role) : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-indigo-50">
                      {i === 0 ? (a.placement?.ctc != null ? `${a.placement.ctc} LPA` : "—") : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-indigo-50">
                      {i === 0 ? dash(a.placement?.date) : ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-indigo-50">
                      {i === 0 && a.placement?.doc ? (
                        <a href={getDocUrl(a.placement.doc)} target="_blank" rel="noreferrer"
                          className="text-indigo-600 underline text-xs font-medium">
                          View
                        </a>
                      ) : i === 0 ? "—" : ""}
                    </td>

                    {/* Summer Industrial */}
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-amber-50">
                      {i === 0 ? (a.summerIndustrial?.org || "BIT") : ""}
                    </td>

                    {/* Major Industrial */}
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-teal-50">
                      {i === 0 ? (a.majorIndustrial?.org || "BIT") : ""}
                    </td>

                    {/* Higher Education — 6 cols, one entry per sub-row */}
                    <td className="px-3 py-2 border-r border-gray-200 bg-purple-50">
                      {heList[i]?.institution || (i === 0 ? "—" : "")}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-purple-50">
                      {heList[i]?.degree || ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 bg-purple-50">
                      {heList[i]?.field || ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-purple-50">
                      {heList[i]?.from || ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-purple-50">
                      {heList[i]?.to || ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 bg-purple-50">
                      {heList[i]?.docs?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {heList[i].docs.map((url, di) => (
                            <a key={di} href={url} target="_blank" rel="noreferrer"
                              className="text-purple-600 underline text-xs font-medium whitespace-nowrap">
                              Doc {di + 1}
                            </a>
                          ))}
                        </div>
                      ) : ""}
                    </td>

                    {/* Work Experience — 4 cols, one entry per sub-row */}
                    <td className="px-3 py-2 border-r border-gray-200 bg-rose-50">
                      {weList[i]?.company || (i === 0 ? "—" : "")}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 bg-rose-50">
                      {weList[i]?.role || ""}
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap bg-rose-50">
                      {weList[i]?.from || ""}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap bg-rose-50">
                      {weList[i]?.to || ""}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Saquib
