import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import {
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  X,
  ShieldAlert,
} from "lucide-react";
import ScrollToTop from "./ScrollToTop";

export default function RemoveStudentRecord({ isEmbedded = false }) {
  const [rollNumber, setRollNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [searchedRoll, setSearchedRoll] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = rollNumber.trim();
    if (!query) {
      toast.warn("Please enter a roll number to search");
      return;
    }

    setSearching(true);
    setErrorMsg("");
    setStudentData(null);
    setSearchedRoll(query);

    try {
      const response = await axios.get(
        "/api/v1/admin/students/search",
        {
          params: { rollNumber: query },
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data?.data) {
        setStudentData(response.data.data);
      } else {
        setErrorMsg(`No student found with roll number "${query}"`);
      }
    } catch (err) {
      console.error("Error searching student:", err);
      const msg =
        err.response?.data?.message ||
        `No student found with roll number "${query}"`;
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setRollNumber("");
    setStudentData(null);
    setErrorMsg("");
    setSearchedRoll("");
  };

  const handleRemove = async () => {
    if (!studentData?.student) return;

    const student = studentData.student;

    const result = await Swal.fire({
      title: "Are you sure you want to remove this student?",
      html: `
        <div style="text-align: left; font-size: 14px; color: #374151;">
          <div style="background-color: #f3f4f6; border-left: 4px solid #ef4444; border-radius: 4px; padding: 12px; margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold; color: #111827; text-transform: capitalize;">
              ${student.fullName}
            </p>
            <p style="margin: 0 0 4px 0; font-family: monospace; font-size: 14px; font-weight: bold; color: #b91c1c;">
              Roll Number: ${student.rollNumber}
            </p>
            <p style="margin: 0; font-size: 12px; color: #4b5563;">
              Batch K${student.batch || "N/A"} &bull; ${student.program || "Student"} &bull; ${student.branch || "General"}
            </p>
          </div>

          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
            <p style="color: #991b1b; font-weight: 700; margin: 0 0 4px 0; font-size: 13px;">
              ⚠️ Critical Safety Notice:
            </p>
            <ul style="color: #b91c1c; font-size: 12px; margin: 0; padding-left: 18px; line-height: 1.4;">
              <li>Only proceed if this student has officially left the Institute.</li>
              <li>This student's user account and login will be permanently deleted.</li>
              <li>Their group memberships will be removed and mentor slots released.</li>
              <li>All their academic, exam, internship, and award records will be erased.</li>
              <li>Other students sharing groups with this student will <strong>NOT</strong> be deleted.</li>
            </ul>
          </div>

          <p style="margin: 0 0 6px 0; color: #1f2937; font-weight: 600; font-size: 13px;">
            To confirm deletion, please type the student's exact roll number <span style="font-family: monospace; color: #dc2626; background: #fee2e2; padding: 2px 6px; border-radius: 4px; user-select: all;">${student.rollNumber}</span> below:
          </p>
        </div>
      `,
      icon: "warning",
      input: "text",
      inputPlaceholder: `Type ${student.rollNumber} to confirm`,
      inputAttributes: {
        autocapitalize: "characters",
        autocorrect: "off",
        style: "text-transform: uppercase; font-family: monospace; letter-spacing: 1px; font-weight: bold;",
      },
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, I am sure - Remove Record",
      cancelButtonText: "No, Cancel",
      reverseButtons: true,
      focusCancel: true,
      preConfirm: (inputValue) => {
        if (!inputValue || inputValue.trim().toUpperCase() !== student.rollNumber.trim().toUpperCase()) {
          Swal.showValidationMessage(`Roll number mismatch! Please type "${student.rollNumber}" exactly to confirm.`);
          return false;
        }
        return true;
      },
    });

    if (!result.isConfirmed) return;

    try {
      setRemoving(true);
      const response = await axios.post(
        "/api/v1/admin/students/remove",
        {
          rollNumber: student.rollNumber,
          studentId: student._id,
        },
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Record Removed Successfully",
        text:
          response.data?.message ||
          `Student ${student.fullName} (${student.rollNumber}) record has been permanently removed.`,
        confirmButtonColor: "#2563eb",
      });

      toast.success(
        `Record for ${student.rollNumber} has been removed successfully.`
      );
      handleClear();
    } catch (err) {
      console.error("Error removing student record:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to remove student record. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Deletion Failed",
        text: msg,
        confirmButtonColor: "#dc2626",
      });
      toast.error(msg);
    } finally {
      setRemoving(false);
    }
  };

  const content = (
    <div className="w-full">
      {/* Search Bar Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Remove Student Record (Left Institute)
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Search for a student by their roll number to review their complete
          profile, group memberships, mentor allocations, and associated
          records before permanently removing them from the institute database.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter Roll Number (e.g. MCA/10001/23, BTECH/10001/22)"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 uppercase tracking-wide font-medium"
              disabled={searching || removing}
            />
            {rollNumber && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={searching || removing || !rollNumber.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors shadow-sm whitespace-nowrap"
          >
            {searching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search Student
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error / Not Found Message */}
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Student Not Found</h4>
            <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Student Details Card */}
      {studentData && studentData.student && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
          {/* Header Banner */}
          <div className="bg-gray-50 border-b border-gray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                {studentData.student.fullName?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 capitalize">
                  {studentData.student.fullName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="font-mono bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded font-bold uppercase">
                    {studentData.student.rollNumber}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded font-semibold">
                    Batch K{studentData.student.batch || "N/A"}
                  </span>
                  {studentData.student.program && (
                    <span className="bg-gray-200 text-gray-800 text-xs px-2.5 py-0.5 rounded font-semibold uppercase">
                      {studentData.student.program}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                      studentData.student.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {studentData.student.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-md whitespace-nowrap self-start md:self-auto"
            >
              {removing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Removing Record...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Remove Student Record
                </>
              )}
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Student General Information */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Student Profile Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 block">Email Address</span>
                  <span className="text-sm font-semibold text-gray-800 break-all">
                    {studentData.student.email || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Branch</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {studentData.student.branch || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Section</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {studentData.student.section || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Mobile Number</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {studentData.student.mobileNumber || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Project & Group Allocations */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Project & Mentor Allotments
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Summer Training */}
                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800 text-sm">
                      Summer Training
                    </span>
                    {studentData.groups?.summer ? (
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        Group: {studentData.groups.summer.groupId}{" "}
                        {studentData.groups.summer.isLeader && "(Leader)"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        No Group
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Mentor:</strong>{" "}
                    {studentData.groups?.summer?.allocatedProf?.fullName ? (
                      <span className="text-green-700 font-semibold">
                        {studentData.groups.summer.allocatedProf.fullName} (
                        {studentData.groups.summer.allocatedProf.idNumber})
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">Not allotted</span>
                    )}
                  </p>
                </div>

                {/* Minor Project */}
                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800 text-sm">
                      Minor Project
                    </span>
                    {studentData.groups?.minor ? (
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        Group: {studentData.groups.minor.groupId}{" "}
                        {studentData.groups.minor.isLeader && "(Leader)"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        No Group
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Mentor:</strong>{" "}
                    {studentData.groups?.minor?.allocatedProf?.fullName ? (
                      <span className="text-green-700 font-semibold">
                        {studentData.groups.minor.allocatedProf.fullName} (
                        {studentData.groups.minor.allocatedProf.idNumber})
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">Not allotted</span>
                    )}
                  </p>
                </div>

                {/* Major Project */}
                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800 text-sm">
                      Major Project
                    </span>
                    {studentData.groups?.major ? (
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        Group: {studentData.groups.major.groupId}{" "}
                        {studentData.groups.major.isLeader && "(Leader)"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        No Group
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Mentor:</strong>{" "}
                    {studentData.groups?.major?.allocatedProf?.fullName ? (
                      <span className="text-green-700 font-semibold">
                        {studentData.groups.major.allocatedProf.fullName} (
                        {studentData.groups.major.allocatedProf.idNumber})
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">Not allotted</span>
                    )}
                  </p>
                </div>

                {/* Project 1 */}
                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800 text-sm">
                      Project 1
                    </span>
                    {studentData.groups?.project1 ? (
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        Group: {studentData.groups.project1.groupId}{" "}
                        {studentData.groups.project1.isLeader && "(Leader)"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        No Group
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Mentor:</strong>{" "}
                    {studentData.groups?.project1?.allocatedProf?.fullName ? (
                      <span className="text-green-700 font-semibold">
                        {studentData.groups.project1.allocatedProf.fullName} (
                        {studentData.groups.project1.allocatedProf.idNumber})
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">Not allotted</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Related Records Impact */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Associated Database Records (Will Be Cleaned Up)
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
                  Academics:{" "}
                  <strong>{studentData.recordsCount?.academics || 0}</strong>
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
                  Internships:{" "}
                  <strong>{studentData.recordsCount?.internships || 0}</strong>
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
                  Awards: <strong>{studentData.recordsCount?.awards || 0}</strong>
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
                  Exams: <strong>{studentData.recordsCount?.exams || 0}</strong>
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
                  Projects:{" "}
                  <strong>{studentData.recordsCount?.projects || 0}</strong>
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
                  Allotments:{" "}
                  <strong>{studentData.recordsCount?.allotments || 0}</strong>
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
                  Bookings:{" "}
                  <strong>
                    {studentData.recordsCount?.classroomBookings || 0}
                  </strong>
                </span>
              </div>
            </div>

            {/* Warning Action Box */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-bold">Permanent Deletion Warning</p>
                  <p className="text-xs text-red-700 mt-0.5">
                    Confirm that this student has left the Institute. Once
                    removed, their user account and all data records will be
                    erased permanently.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm whitespace-nowrap"
              >
                {removing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove Record
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <ScrollToTop />
      <ToastContainer position="top-right" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Master Admin &bull; Remove Student Record
        </h1>
        {content}
      </div>
    </div>
  );
}

