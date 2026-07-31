import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
} from "react-icons/fa";
import Swal from "sweetalert2";

const AcceptProject1 = () => {
  const [appliedStudents, setAppliedStudents] = useState([]);
  const [acceptedRecords, setAcceptedRecords] = useState([]);
  const [limits, setLimits] = useState(0);
  const [description, setDescription] = useState("");
  const [remark, setRemark] = useState("");
  const [viewMode, setViewMode] = useState("applied");
  const [searchTerm, setSearchTerm] = useState("");
  const [marks, setMarks] = useState({});
  const [showMarksInputFor, setShowMarksInputFor] = useState(null);
  const [projectTitles, setProjectTitles] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appliedResponse, limitsResponse, acceptedResponse] =
          await Promise.all([
            axios.get("/api/v1/project1/get-applied-students"),
            axios.get("/api/v1/project1/get-limit"),
            axios.get("/api/v1/project1/get-accepted-students"),
          ]);

        setAppliedStudents(appliedResponse.data.data || []);
        setLimits(limitsResponse.data.data);
        setAcceptedRecords(acceptedResponse.data.data || []);

        // Init project titles
        const titles = {};
        (acceptedResponse.data.data || []).forEach((rec) => {
          titles[rec._id] = rec.projectTitle || "";
        });
        setProjectTitles(titles);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch data.");
      }
    };
    fetchData();
  }, [marks]);

  const handleAccept = async (recordId) => {
    const result = await Swal.fire({
      title: "Accept this student?",
      text: "This will allocate the student under you for Project 1.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Accept",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post("/api/v1/project1/accept-student", { _id: recordId });
      toast.success("Student accepted!");
      // Refresh
      const [appliedRes, limitsRes, acceptedRes] = await Promise.all([
        axios.get("/api/v1/project1/get-applied-students"),
        axios.get("/api/v1/project1/get-limit"),
        axios.get("/api/v1/project1/get-accepted-students"),
      ]);
      setAppliedStudents(appliedRes.data.data || []);
      setLimits(limitsRes.data.data);
      setAcceptedRecords(acceptedRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept student.");
    }
  };

  const handleDeny = async (recordId) => {
    const result = await Swal.fire({
      title: "Deny this student?",
      text: "The student will be passed to their next preferred professor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Deny",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post("/api/v1/project1/deny-student", { _id: recordId });
      toast.success("Student denied.");
      const res = await axios.get("/api/v1/project1/get-applied-students");
      setAppliedStudents(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deny student.");
    }
  };

  const handleAddRemark = async (recordId) => {
    if (!description.trim()) {
      toast.error("Description is required.");
      return;
    }
    try {
      await axios.post("/api/v1/project1/add-remark", {
        _id: recordId,
        description,
        remark,
        absent: [],
      });
      toast.success("Remark added!");
      setDescription("");
      setRemark("");
      // Refresh accepted
      const res = await axios.get("/api/v1/project1/get-accepted-students");
      setAcceptedRecords(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add remark.");
    }
  };

  const handleMarks = async (studentId) => {
    const marksVal = marks[studentId];
    if (marksVal === undefined || marksVal === "") {
      toast.error("Please enter marks.");
      return;
    }
    try {
      await axios.post("/api/v1/project1/add-marks", {
        studentId,
        marks: Number(marksVal),
      });
      toast.success("Marks saved!");
      setShowMarksInputFor(null);
      setMarks({ ...marks, [studentId]: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save marks.");
    }
  };

  const handleSaveTitle = async (project1Id) => {
    try {
      await axios.post("/api/v1/project1/save-project-title", {
        project1Id,
        projectTitle: projectTitles[project1Id] || "",
      });
      toast.success("Project title saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save title.");
    }
  };

  const filteredApplied = appliedStudents.filter((rec) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      rec.student?.fullName?.toLowerCase().includes(q) ||
      rec.student?.rollNumber?.toLowerCase().includes(q)
    );
  });

  const filteredAccepted = acceptedRecords.filter((rec) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      rec.student?.fullName?.toLowerCase().includes(q) ||
      rec.student?.rollNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">
                Project 1 Management
              </h1>
              <p className="text-purple-100 mt-1">
                Remaining capacity: {limits} student(s)
              </p>
            </div>

            <div className="p-6">
              {/* View Mode Tabs */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setViewMode("applied")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "applied"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaUsers className="inline mr-2" />
                  Applied ({appliedStudents.length})
                </button>
                <button
                  onClick={() => setViewMode("accepted")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === "accepted"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaCheckCircle className="inline mr-2" />
                  Accepted ({acceptedRecords.length})
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Applied Students View */}
              {viewMode === "applied" && (
                <div>
                  {filteredApplied.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No pending applications.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredApplied.map((rec) => (
                        <div
                          key={rec._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {rec.student?.fullName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Roll: {rec.student?.rollNumber} | Branch:{" "}
                                {rec.student?.branch} | Section:{" "}
                                {rec.student?.section}
                              </p>
                              <p className="text-sm text-gray-600">
                                CGPA: {rec.student?.cgpa} | Email:{" "}
                                {rec.student?.email}
                              </p>
                              {rec.student?.linkedin && (
                                <a
                                  href={rec.student.linkedin}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  LinkedIn Profile
                                </a>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAccept(rec._id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <FaCheckCircle /> Accept
                              </button>
                              <button
                                onClick={() => handleDeny(rec._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                              >
                                <FaTimesCircle /> Deny
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Accepted Students View */}
              {viewMode === "accepted" && (
                <div>
                  {filteredAccepted.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No accepted students yet.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredAccepted.map((rec) => (
                        <div
                          key={rec._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {rec.student?.fullName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Roll: {rec.student?.rollNumber} | Branch:{" "}
                                {rec.student?.branch}
                              </p>
                              <p className="text-sm text-gray-600">
                                Current Marks:{" "}
                                {rec.student?.marks?.project1 || 0}
                              </p>
                            </div>

                            {/* Marks */}
                            <div className="flex gap-2 items-center">
                              {showMarksInputFor === rec.student?._id ? (
                                <>
                                  <input
                                    type="number"
                                    value={marks[rec.student._id] || ""}
                                    onChange={(e) =>
                                      setMarks({
                                        ...marks,
                                        [rec.student._id]: e.target.value,
                                      })
                                    }
                                    placeholder="Marks"
                                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                                  />
                                  <button
                                    onClick={() =>
                                      handleMarks(rec.student._id)
                                    }
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setShowMarksInputFor(null)}
                                    className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() =>
                                    setShowMarksInputFor(rec.student?._id)
                                  }
                                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                                >
                                  Update Marks
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Project Title */}
                          <div className="mb-4 flex gap-2 items-center">
                            <input
                              type="text"
                              value={projectTitles[rec._id] || ""}
                              onChange={(e) =>
                                setProjectTitles({
                                  ...projectTitles,
                                  [rec._id]: e.target.value,
                                })
                              }
                              placeholder="Project Title"
                              className="flex-1 px-3 py-1 border border-gray-300 rounded"
                            />
                            <button
                              onClick={() => handleSaveTitle(rec._id)}
                              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                            >
                              Save Title
                            </button>
                          </div>

                          {/* Add Remark */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Add Discussion Entry
                            </h4>
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Discussion description"
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                              />
                              <input
                                type="text"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Remark (optional)"
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                              />
                              <button
                                onClick={() => handleAddRemark(rec._id)}
                                className="self-start px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              >
                                Add Entry
                              </button>
                            </div>
                          </div>

                          {/* Discussion Logs */}
                          {rec.discussion && rec.discussion.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Discussion Logs
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Description
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Remark
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {rec.discussion.map((log, i) => (
                                      <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                                          {new Intl.DateTimeFormat("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                          }).format(new Date(log.date))}
                                        </td>
                                        <td className="px-3 py-2 text-gray-900">
                                          {log.description || "-"}
                                        </td>
                                        <td className="px-3 py-2 text-gray-900">
                                          {log.remark || "-"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcceptProject1;
