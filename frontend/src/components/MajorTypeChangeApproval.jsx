import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";

const handleError = (error, defaultMessage) => {
  let message =
    error.response?.data?.message || defaultMessage || "An error occurred";
  toast.error(message);
};

const MajorTypeChangeApproval = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/prof/major/pending-type-changes");
      setPendingRequests(response.data.data || []);
    } catch (error) {
      handleError(error, "Failed to fetch pending type change requests");
    }
    setLoading(false);
  };

  const handleApprove = async (groupId) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Approve Type Change",
      text: "Are you sure you want to approve this type change request?",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, approve",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.post("/api/v1/major/prof-approve-type-change", {
        groupId,
        action: "approve",
      });

      Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Type change request approved successfully",
        confirmButtonColor: "#10b981",
      });

      fetchPendingRequests();
    } catch (error) {
      setLoading(false);
      let errorMessage = error.response?.data?.message;
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text: errorMessage || "Failed to approve type change request",
        confirmButtonColor: "#ef4444",
      });
    }
    setLoading(false);
  };

  const handleReject = async (groupId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Reject Type Change",
      text: "Are you sure you want to reject this type change request?",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, reject",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.post("/api/v1/major/prof-approve-type-change", {
        groupId,
        action: "reject",
      });

      Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Type change request rejected successfully",
        confirmButtonColor: "#10b981",
      });

      fetchPendingRequests();
    } catch (error) {
      setLoading(false);
      let errorMessage = error.response?.data?.message;
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text: errorMessage || "Failed to reject type change request",
        confirmButtonColor: "#ef4444",
      });
    }
    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">
                Major Project Type Change Requests
              </h1>
              <p className="text-blue-100 mt-1">
                Review and approve student type change requests
              </p>
            </div>

            <div className="p-6">
              {loading && pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading requests...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    No Pending Requests
                  </h3>
                  <p className="text-gray-600 mt-2">
                    There are no type change requests waiting for your approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingRequests.map((group) => (
                    <div
                      key={group._id}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Group Info Header */}
                      <div className="mb-5 pb-4 border-b border-gray-200">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              Group ID: <span className="text-blue-600">{group.groupId}</span>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Leader: <span className="font-semibold">{group.leader?.fullName}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="inline-block bg-white px-4 py-2 rounded-lg border border-gray-200">
                              <span className="text-xs text-gray-600">Current Type: </span>
                              <span className="font-bold text-blue-600 capitalize">{group.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Current Group Details */}
                      <div className="grid md:grid-cols-3 gap-4 mb-5">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600">Members</p>
                          <p className="font-bold text-gray-800">{group.members?.length || 0}</p>
                        </div>
                        {group.org && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600">Current Organization</p>
                            <p className="font-bold text-gray-800">{group.org?.companyName}</p>
                          </div>
                        )}
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600">Professor</p>
                          <p className="font-bold text-gray-800">
                            {group.majorAllocatedProf?.fullName || "Not Allocated"}
                          </p>
                        </div>
                      </div>

                      {/* Type Change Requests */}
                      <div className="space-y-3 mb-5">
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Pending Requests ({group.typeChangeRequests?.length || 0})
                        </h4>
                        
                        {group.typeChangeRequests?.map((req, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-4 border-l-4 border-yellow-500"
                          >
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <span className="text-sm text-gray-600">Student: </span>
                                <span className="font-semibold text-gray-800">
                                  {req.user?.fullName}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Requested Type: </span>
                                <span className="font-bold text-blue-600 capitalize">
                                  {req.requestedType}
                                </span>
                              </div>
                              {req.org && (
                                <div>
                                  <span className="text-sm text-gray-600">New Organization: </span>
                                  <span className="font-semibold text-gray-800">
                                    {req.org?.companyName}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-sm text-gray-600">Requested: </span>
                                <span className="font-medium text-xs text-gray-700">
                                  {new Date(req.initiatedAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Outcome Preview */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                        <h4 className="font-semibold text-blue-900 mb-3">Expected Outcome:</h4>
                        {group.typeChangeRequests?.length === 1 ? (
                          group.typeChangeRequests[0].requestedType === "industrial" && group.members?.length === 2 ? (
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                              <li>
                                <strong>{group.typeChangeRequests[0].user?.fullName}</strong> will be moved to a new industrial group
                              </li>
                              <li>
                                The other member will remain in the current research group
                              </li>
                              <li>Both groups will remain under your supervision</li>
                            </ul>
                          ) : (
                            <p className="text-sm text-blue-800">
                              The group type will be changed to <strong className="capitalize">{group.typeChangeRequests[0].requestedType}</strong>
                            </p>
                          )
                        ) : group.typeChangeRequests?.length === 2 ? (
                          group.typeChangeRequests[0].requestedType === "industrial" && 
                          group.typeChangeRequests[1].requestedType === "industrial" ? (
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                              <li>Both members will be split into separate industrial groups</li>
                              <li>
                                <strong>{group.typeChangeRequests[0].user?.fullName}</strong> → New industrial group with {group.typeChangeRequests[0].org?.companyName}
                              </li>
                              <li>
                                <strong>{group.typeChangeRequests[1].user?.fullName}</strong> → New industrial group with {group.typeChangeRequests[1].org?.companyName}
                              </li>
                              <li>Original group will be deleted</li>
                              <li>Both new groups will remain under your supervision</li>
                            </ul>
                          ) : group.typeChangeRequests[0].requestedType === "research" && 
                                group.typeChangeRequests[1].requestedType === "research" ? (
                            <p className="text-sm text-blue-800">
                              The group will be converted to <strong>research type</strong>
                            </p>
                          ) : (
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                              <li>One member will move to an industrial group</li>
                              <li>One member will stay in a research group</li>
                              <li>Both groups will remain under your supervision</li>
                            </ul>
                          )
                        ) : null}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleApprove(group._id)}
                          disabled={loading}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Approve Type Change
                        </button>
                        <button
                          onClick={() => handleReject(group._id)}
                          disabled={loading}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MajorTypeChangeApproval;
