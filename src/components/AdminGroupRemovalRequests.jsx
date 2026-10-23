import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaUserTie,
  FaUsers,
  FaClock,
  FaTrashAlt,
} from "react-icons/fa";
import ScrollToTop from "./ScrollToTop";

const AdminGroupRemovalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/admin/group-removal-requests");
      setRequests(response.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load removal requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (requestId, action) => {
    const isApprove = action === "approve";
    const { value: comment } = await Swal.fire({
      title: isApprove ? "Approve Group Removal?" : "Reject Removal Request?",
      html: isApprove
        ? "<p style='font-size:14px;color:#444;'>Approving this will <strong>deallocate the group</strong> from the professor and send an <strong>email notification to all group members</strong>.</p>"
        : "<p style='font-size:14px;color:#444;'>Rejecting will keep the group allocated to the professor.</p>",
      input: "text",
      inputLabel: "Admin Comment (Optional)",
      inputPlaceholder: isApprove ? "e.g. Approved per faculty request." : "e.g. Please consult with the academic coordinator first.",
      icon: isApprove ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "#10B981" : "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: isApprove ? "Yes, Approve & Deallocate" : "Yes, Reject Request",
      cancelButtonText: "Cancel",
    });

    if (comment !== undefined) {
      try {
        const response = await axios.post("/api/v1/admin/review-group-removal-request", {
          requestId,
          action,
          comment: comment || "",
        });
        Swal.fire({
          icon: "success",
          title: isApprove ? "Approved" : "Rejected",
          text: response.data?.message || "Action processed successfully.",
          confirmButtonColor: "#10B981",
        });
        fetchRequests();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to process request");
      }
    }
  };

  // Unique batches present in requests for filter dropdown
  const uniqueBatches = Array.from(new Set(requests.map((r) => r.batch))).filter(Boolean).sort();

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesType = typeFilter === "all" || req.groupType === typeFilter;
    const matchesBatch = batchFilter === "all" || String(req.batch) === String(batchFilter);

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      req.groupId?.toLowerCase().includes(term) ||
      req.professor?.fullName?.toLowerCase().includes(term) ||
      req.professor?.email?.toLowerCase().includes(term) ||
      req.groupDetails?.members?.some(
        (m) =>
          m.fullName?.toLowerCase().includes(term) ||
          m.rollNumber?.toLowerCase().includes(term)
      );

    return matchesStatus && matchesType && matchesBatch && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">⏳ Pending Approval</span>;
      case "approved":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">✅ Approved</span>;
      case "rejected":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">❌ Rejected</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "summer":
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 uppercase">Summer Training</span>;
      case "major":
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 uppercase">Major Project</span>;
      case "minor":
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">Minor Project</span>;
      case "project1":
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700 uppercase">Project 1</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 uppercase">{type}</span>;
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ScrollToTop />
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaTrashAlt className="text-red-500" /> Group Removal Requests
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Review and approve/reject group removal requests submitted by faculty mentors.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-semibold flex items-center gap-2">
                Pending Requests: <span className="bg-amber-600 text-white rounded-full px-2 py-0.5 text-xs">{pendingCount}</span>
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Group ID, Professor, Student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="all">All Project Types</option>
                <option value="summer">Summer Training</option>
                <option value="major">Major Project</option>
                <option value="minor">Minor Project</option>
                <option value="project1">Project 1</option>
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="all">All Batches</option>
                {uniqueBatches.map((b) => (
                  <option key={b} value={b}>
                    Batch K{b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
            {["pending", "approved", "rejected", "all"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "pending" && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    statusFilter === status ? "bg-white text-blue-600" : "bg-amber-500 text-white"
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading removal requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-2xl mb-3">
              <FaUsers />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No Removal Requests Found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" || batchFilter !== "all"
                ? "Try adjusting your search filters."
                : "No group removal requests have been submitted by faculty yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">
                      Group ID: <span className="text-blue-600">{req.groupId}</span>
                    </span>
                    {getTypeBadge(req.groupType)}
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                      Batch K{req.batch}
                    </span>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Faculty Info */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FaUserTie className="text-blue-500" /> Faculty Mentor
                    </h4>
                    <p className="font-semibold text-gray-900">
                      Prof. {req.professor?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">{req.professor?.email}</p>
                    {req.professor?.idNumber && (
                      <p className="text-xs text-gray-500 mt-1">ID: {req.professor.idNumber}</p>
                    )}

                    {/* Reason Box */}
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wide">
                        Reason for Removal:
                      </p>
                      <p className="text-sm text-red-950 mt-1 italic whitespace-pre-wrap">
                        "{req.reason}"
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <FaClock /> Submitted: {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Members Info */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FaUsers className="text-indigo-500" /> Group Members ({req.groupDetails?.members?.length || 0})
                    </h4>
                    {req.groupDetails?.members && req.groupDetails.members.length > 0 ? (
                      <div className="space-y-2">
                        {req.groupDetails.members.map((member) => (
                          <div
                            key={member._id}
                            className="bg-white p-2.5 rounded border border-gray-200 text-sm flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-gray-800">{member.fullName}</span>
                              <span className="text-xs text-gray-500 ml-2">({member.rollNumber})</span>
                            </div>
                            <span className="text-xs text-gray-500">{member.email}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No member records available</p>
                    )}

                    {/* Admin Action Info if reviewed */}
                    {req.status !== "pending" && (
                      <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-200">
                        <p className="text-xs font-bold text-gray-600 uppercase">
                          Reviewed By: {req.actionBy?.username || "Admin"}
                        </p>
                        {req.actionComment && (
                          <p className="text-xs text-gray-700 mt-1">
                            <span className="font-semibold">Remark:</span> {req.actionComment}
                          </p>
                        )}
                        {req.actionAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            On: {new Date(req.actionAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                {req.status === "pending" && (
                  <div className="mt-5 pt-4 border-t flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={() => handleReview(req._id, "reject")}
                      className="px-5 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-300 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <FaTimesCircle /> Reject Request
                    </button>
                    <button
                      onClick={() => handleReview(req._id, "approve")}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle /> Approve & Deallocate Group
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGroupRemovalRequests;
