import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import ScrollToTop from "./ScrollToTop";

const COURSES = [
  "MCA Minor Project",
  "MCA Major Project",
  "MTech Thesis 1",
  "MTech Thesis 2",
];

const BATCHES = ["K22", "K23", "K24", "K25", "K26"];

export default function AdminCourseDocsUpload() {
  const [courseDocuments, setCourseDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
  const [selectedBatch, setSelectedBatch] = useState(BATCHES[2]); // Default K24
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const fileInputRef = useRef(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/course-docs", {
        headers: getAuthHeader(),
      });
      setCourseDocuments(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch course documents", err);
      toast.error("Failed to load existing course documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Please select a valid PDF file");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size cannot exceed 25MB");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.warning("Please choose a PDF file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("course", selectedCourse);
    formData.append("batch", selectedBatch);
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      await axios.post("/api/v1/course-docs/upload", formData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        `PDF for ${selectedCourse} (${selectedBatch}) uploaded successfully!`
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to upload document. Please ensure you are logged in as Master Admin.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, course, batch) => {
    if (
      !window.confirm(
        `Are you sure you want to remove the document for ${course} (${batch})?`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/v1/course-docs/${docId}`, {
        headers: getAuthHeader(),
      });
      toast.success(`Document for ${course} (${batch}) deleted`);
      if (previewPdfUrl) setPreviewPdfUrl(null);
      await fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper to find document for specific course & batch
  const getDoc = (course, batch) =>
    courseDocuments.find((d) => d.course === course && d.batch === batch);

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              PG Projects & Thesis Documents
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Master Admin
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Upload and manage reference & guideline PDF files for MCA Minor/Major
            Projects and MTech Thesis 1 & 2 across batches K22–K26.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition shadow-sm text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Upload Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" /> Upload Course PDF
        </h2>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800 text-sm font-medium"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Batch Number <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800 text-sm font-medium"
              >
                {BATCHES.map((b) => (
                  <option key={b} value={b}>
                    Batch {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Existing Document Alert if already uploaded */}
          {getDoc(selectedCourse, selectedBatch) && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  A document already exists for <strong>{selectedCourse}</strong>{" "}
                  (Batch <strong>{selectedBatch}</strong>). Uploading a new file will replace it.
                </span>
              </div>
              <a
                href={getDoc(selectedCourse, selectedBatch)?.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline font-semibold flex items-center gap-1 ml-4"
              >
                <Eye className="w-3.5 h-3.5" /> Current PDF
              </a>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select PDF File <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md cursor-pointer"
              />
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition shadow-sm whitespace-nowrap ${
                  uploading || !selectedFile
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload PDF
                  </>
                )}
              </button>
            </div>
            {selectedFile && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: <strong>{selectedFile.name}</strong> (
                {formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Batch Availability Matrix */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Batch Availability Matrix
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Status of uploaded reference PDFs for all 4 courses across batches K22–K26:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COURSES.map((course) => (
            <div
              key={course}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-between"
            >
              <h3 className="font-semibold text-gray-900 text-sm mb-3 border-b border-gray-200 pb-2">
                {course}
              </h3>
              <div className="space-y-2">
                {BATCHES.map((b) => {
                  const doc = getDoc(course, b);
                  return (
                    <div
                      key={b}
                      className="flex items-center justify-between text-xs p-2 rounded bg-white border border-gray-200"
                    >
                      <span className="font-medium text-gray-800">
                        Batch {b}
                      </span>
                      {doc ? (
                        <a
                          href={doc.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold hover:bg-blue-100 border border-blue-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          View PDF
                        </a>
                      ) : (
                        <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          Not uploaded
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">
            Uploaded Documents ({courseDocuments.length})
          </h2>
        </div>

        {courseDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium">No documents uploaded yet.</p>
            <p className="text-xs text-gray-500 mt-1">
              Use the upload form above to add guideline PDFs for a course and batch.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Uploaded On
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doc.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {doc.batch}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate max-w-xs font-medium" title={doc.originalFileName}>
                          {doc.originalFileName || "document.pdf"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center gap-3">
                        <a
                          href={doc.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs"
                          title="Open PDF"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id, doc.course, doc.batch)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium text-xs ml-2"
                          title="Delete PDF"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
