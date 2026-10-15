import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  HiDocumentText,
  HiDownload,
  HiExternalLink,
  HiAcademicCap,
  HiCheckCircle,
  HiExclamationCircle,
} from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import ScrollToTop from "./ScrollToTop";

const COURSES = [
  "MCA Minor Project",
  "MCA Major Project",
  "MTech Thesis 1",
  "MTech Thesis 2",
];

const BATCHES = ["K22", "K23", "K24", "K25", "K26"];

export default function FacultyCourseDocumentView() {
  const [searchParams, setSearchParams] = useSearchParams();

  const courseParam = searchParams.get("course");
  const batchParam = searchParams.get("batch");

  const [activeCourse, setActiveCourse] = useState(
    COURSES.includes(courseParam) ? courseParam : COURSES[0]
  );
  const [activeBatch, setActiveBatch] = useState(
    BATCHES.includes(batchParam) ? batchParam : "K24"
  );

  const [courseDocuments, setCourseDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    if (courseParam && COURSES.includes(courseParam)) {
      setActiveCourse(courseParam);
    }
    if (batchParam && BATCHES.includes(batchParam)) {
      setActiveBatch(batchParam);
    }
  }, [courseParam, batchParam]);

  // Fetch course documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/v1/course-docs");
        setCourseDocuments(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch course documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleBatchChange = (batch) => {
    setActiveBatch(batch);
    setSearchParams({ course: activeCourse, batch });
  };

  // Find doc for activeCourse and activeBatch
  const currentDoc = courseDocuments.find(
    (d) => d.course === activeCourse && d.batch === activeBatch
  );

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <ScrollToTop />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <HiAcademicCap className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{activeCourse}</h1>
        </div>
        <p className="text-gray-600 text-sm md:text-base">
          Official guidelines, syllabus, and evaluation document repository for
          faculty review. Select a batch to access or preview the corresponding
          PDF immediately.
        </p>
      </div>

      {/* Batch Selector Card with Dropdown inside the section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Select Batch</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose the batch year to access the corresponding guidelines and documents
            </p>
          </div>

          {/* Batch Dropdown inside the batch section */}
          <div className="w-full sm:w-64">
            <div className="relative">
              <select
                id="batch-select"
                value={activeBatch}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer"
              >
                {BATCHES.map((b) => {
                  const hasPdf = courseDocuments.some(
                    (d) => d.course === activeCourse && d.batch === b
                  );
                  return (
                    <option key={b} value={b}>
                      Batch {b} {hasPdf ? "(PDF Available)" : "(No PDF)"}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <IoIosArrowDown className="text-base" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: PDF or Empty State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            Loading course documents...
          </p>
        </div>
      ) : currentDoc ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Document Action Bar */}
          <div className="bg-gray-100 border-b border-gray-200 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-lg">
                <HiDocumentText className="text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {currentDoc.originalFileName || `${activeCourse} - ${activeBatch}.pdf`}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-blue-700">
                    Batch {activeBatch}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(currentDoc.fileSize)}</span>
                  <span>•</span>
                  <span>
                    Uploaded on:{" "}
                    {new Date(
                      currentDoc.updatedAt || currentDoc.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Immediate Access Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href={currentDoc.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition shadow-sm"
              >
                <HiExternalLink className="text-lg" /> Open PDF in New Window
              </a>
              <a
                href={currentDoc.pdfUrl}
                download={currentDoc.originalFileName || `${activeCourse}_${activeBatch}.pdf`}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-semibold text-sm transition"
              >
                <HiDownload className="text-lg" /> Download
              </a>
            </div>
          </div>

          {/* Embedded PDF Viewer */}
          <div className="p-4 bg-gray-800">
            <iframe
              src={currentDoc.pdfUrl}
              title={`${activeCourse} - Batch ${activeBatch}`}
              className="w-full h-[700px] rounded border border-gray-700 bg-white"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiExclamationCircle className="text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Document Uploaded for Batch {activeBatch}
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            The reference or guideline document for <strong>{activeCourse}</strong>{" "}
            (Batch <strong>{activeBatch}</strong>) has not been uploaded yet by
            the Master Admin.
          </p>

          {/* Check if other batches have this course uploaded */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Available Batches with Uploaded Documents:
            </p>
            <div className="flex justify-center flex-wrap gap-2">
              {BATCHES.map((b) => {
                const doc = courseDocuments.find(
                  (d) => d.course === activeCourse && d.batch === b
                );
                if (!doc) return null;
                return (
                  <button
                    key={b}
                    onClick={() => handleBatchChange(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-300 rounded-md text-xs font-bold hover:bg-blue-100 transition"
                  >
                    <HiCheckCircle className="text-blue-600" />
                    <span>Batch {b} (Ready)</span>
                  </button>
                );
              })}
              {!courseDocuments.some((d) => d.course === activeCourse) && (
                <span className="text-xs text-gray-400 italic">
                  No documents uploaded for this course yet across any batch.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
