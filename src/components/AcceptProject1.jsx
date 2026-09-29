import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaEdit,
} from "react-icons/fa";
import Swal from "sweetalert2";
import ChatBox from "./ChatBox";

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
  const [showModal, setShowModal] = useState(false);
  const [absentees, setAbsentees] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

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

        setAcceptedRecords(acceptedResponse.data.data || []);
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

  const handleAddRemark = async () => {
    if (!description.trim()) {
      toast.error("Description is required.");
      return;
    }
    try {
      await axios.post("/api/v1/project1/add-remark", {
        _id: selectedGroup,
        description,
        remark,
        absent: absentees,
      });
      toast.success("Remark added!");
      setDescription("");
      setRemark("");
      setAbsentees([]);
      setShowModal(false);
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


  const handleGroupClick = (group) => {
    if (selectedGroup === group._id) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(group._id);
    }
  };

  const filteredApplied = appliedStudents.filter((rec) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return rec.members?.some(
      (member) =>
        member.fullName?.toLowerCase().includes(q) ||
        member.rollNumber?.toLowerCase().includes(q)
    );
  });

  const filteredAccepted = acceptedRecords.filter((rec) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return rec.members?.some(
      (member) =>
        member.fullName?.toLowerCase().includes(q) ||
        member.rollNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">
                Project 1 Management
              </h1>
              <p className="text-blue-100 mt-1">
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
                      ? "bg-blue-600 text-white"
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
                      ? "bg-blue-600 text-white"
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Groups List */}
              <div className="space-y-4">
                {(viewMode === "applied" ? filteredApplied : filteredAccepted).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No {viewMode === "applied" ? "pending applications" : "accepted students"}.
                  </div>
                ) : (
                  (viewMode === "applied" ? filteredApplied : filteredAccepted).map((group) => (
                    <div
                      key={group._id}
                      className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                    >
                      {/* Group Header */}
                      <div
                        className={`p-4 flex items-center justify-between ${selectedGroup === group._id ? "bg-blue-50" : "bg-white"} hover:bg-gray-50 cursor-pointer`}
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">
                              Group ID: {group.groupId}
                            </h3>
                            <p className="text-gray-600">
                              {group.members?.length || 0} members
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGroupClick(group)}
                            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <FaUsers className="mr-2" />
                            {selectedGroup === group._id ? "Hide" : "View"} Members
                          </button>
                          {viewMode === "applied" && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAccept(group._id); }}
                                className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <FaCheckCircle className="mr-2" /> Accept
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeny(group._id); }}
                                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <FaTimesCircle className="mr-2" /> Deny
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded Members View */}
                      {selectedGroup === group._id && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <h4 className="font-semibold text-lg text-gray-800 mb-4">
                            Group Members
                          </h4>
                          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {group.members?.map((member) => (
                                  <tr key={member._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {viewMode === "accepted" && (
                                        showMarksInputFor === member._id ? (
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="number"
                                              min="0"
                                              max="50"
                                              step="1"
                                              value={marks[member._id] ?? member.marks?.project1 ?? ""}
                                              onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === "" || (!isNaN(value) && value >= 0 && value <= 50)) {
                                                  setMarks({ ...marks, [member._id]: value === "" ? "" : value });
                                                }
                                              }}
                                              onBlur={(e) => {
                                                if (e.target.value === "") {
                                                  setMarks({ ...marks, [member._id]: "0" });
                                                }
                                              }}
                                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                              placeholder="0-50"
                                            />
                                            <span className="text-xs text-gray-500">
                                              /50
                                            </span>
                                            <button
                                              onClick={() => handleMarks(member._id)}
                                              className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                                            >
                                              Submit
                                            </button>
                                            <button
                                              onClick={() => setShowMarksInputFor(null)}
                                              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => setShowMarksInputFor(member._id)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center"
                                          >
                                            <span>
                                              {member.marks?.project1 || 0}/50
                                            </span>
                                            <FaEdit className="ml-2 text-sm" />
                                          </button>
                                        )
                                      )}
                                      {viewMode === "applied" && (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex flex-col items-center">
                                        <img
                                          src={member.image || "/images/default-avatar.png"}
                                          alt={member.fullName}
                                          className="h-10 w-10 rounded-full object-cover"
                                        />
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {member.rollNumber}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {member.cgpa || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {member.branch} {member.section ? `(${member.section})` : ""}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                      {member.codingProfiles?.leetcode && (
                                        <a
                                          href={member.codingProfiles.leetcode}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs hover:bg-orange-200"
                                        >
                                          LeetCode
                                        </a>
                                      )}
                                      {member.codingProfiles?.github && (
                                        <a
                                          href={member.codingProfiles.github}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs hover:bg-gray-200"
                                        >
                                          GitHub
                                        </a>
                                      )}
                                      {member.linkedin && (
                                        <a
                                          href={member.linkedin}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200"
                                        >
                                          LinkedIn
                                        </a>
                                      )}
                                      {!member.codingProfiles?.leetcode && !member.codingProfiles?.github && !member.linkedin && "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Discussion Logs Section */}
                          {viewMode === "accepted" && (
                            <div className="mt-6">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-lg text-gray-800">
                                  Discussion Logs
                                </h4>
                                <button
                                  onClick={() => setShowModal(true)}
                                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <FaEdit className="mr-2" />
                                  Add Log
                                </button>
                              </div>

                              {group.discussion && group.discussion.length > 0 ? (
                                <div className="space-y-3">
                                  {group.discussion.map((log, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-gray-700">
                                            <span className="font-medium">
                                              Description:
                                            </span>{" "}
                                            {log.description}
                                          </p>
                                          {log.absent?.length > 0 && (
                                            <p className="text-gray-700 mt-1">
                                              <span className="font-medium">
                                                Absentees:
                                              </span>{" "}
                                              {log.absent
                                                .map((a) => a.fullName || a)
                                                .join(", ")}
                                            </p>
                                          )}
                                          {log.remark && (
                                            <p className="text-gray-700 mt-1">
                                              <span className="font-medium">
                                                Remark:
                                              </span>{" "}
                                              <span className="capitalize">
                                                {log.remark}
                                              </span>
                                            </p>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {new Intl.DateTimeFormat("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                          }).format(new Date(log.date))}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                                  No discussion logs yet
                                </div>
                              )}
                            </div>
                          )}

                          {viewMode === "accepted" && (
                            <div className="mt-6">
                              <h4 className="font-semibold text-lg text-gray-800 mb-4">
                                Group Chat
                              </h4>
                              <ChatBox groupId={group.groupId} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Discussion Log Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Create Discussion Log
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Absentees
                  </label>
                  <div className="space-y-2">
                    {acceptedRecords
                      .find((g) => g._id === selectedGroup)
                      ?.members.map((member) => (
                        <div key={member._id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={absentees.includes(member._id)}
                            onChange={() =>
                              setAbsentees((prev) =>
                                prev.includes(member._id)
                                  ? prev.filter((id) => id !== member._id)
                                  : [...prev, member._id],
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            {member.fullName} ({member.rollNumber})
                          </label>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remark
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  >
                    <option value="">Select remark</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="satisfactory">Satisfactory</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRemark}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AcceptProject1;
