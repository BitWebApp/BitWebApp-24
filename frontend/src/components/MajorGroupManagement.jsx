import { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const handleError = (error, defaultMessage) => {
  let message = error.response.data.message;
  toast.error(message);
};

const MajorGroupManagement = () => {
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [type, setType] = useState("");
  const [company, setCompany] = useState([]);
  const [org, setOrg] = useState("");
  const [activeTab, setActiveTab] = useState("group");
  const [typeChangeStatus, setTypeChangeStatus] = useState(null);
  const [requestedType, setRequestedType] = useState("");
  const [requestedOrg, setRequestedOrg] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Helper function to check if current user has a pending request
  const currentUserHasPendingRequest = () => {
    if (!typeChangeStatus?.typeChangeRequests || !currentUser?._id) {
      return false;
    }
    
    const currentUserId = currentUser._id.toString();
    const hasPending = typeChangeStatus.typeChangeRequests.some(req => {
      const reqUserId = req.user?._id?.toString();
      const isPending = req.status === "pending";
      const isMatch = reqUserId === currentUserId;
      return isMatch && isPending;
    });
    
    return hasPending;
  };

  useEffect(() => {
    fetchCompanies();
    fetchGroup();
    fetchRequests();
    fetchTypeChangeStatus();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/api/v1/users/get-user");
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get("/api/v1/users/get-user-companies");
      setCompany(data?.data || []);
    } catch (error) {
      toast.error("Failed to load company list!");
    }
  };

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/major/get-group");
      console.log("hello", response.data.data);
      setGroup(response.data.data);
    } catch (error) {
      setGroup(null);
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get("/api/v1/major/get-req");
      setRequests(response.data.data || []);
    } catch (error) {
      
    }
  };

  const fetchTypeChangeStatus = async () => {
    try {
      const response = await axios.get("/api/v1/major/get-type-change-status");
      setTypeChangeStatus(response.data.data);
    } catch (error) {
      setTypeChangeStatus(null);
    }
  };

  const createGroup = async () => {
    if (!type)
      return toast.error("Type of major internship is required");
    if (type === "industrial" && !org)
      return toast.error(
        "Organisation Name is required for industrial internship"
      );

    setLoading(true);
    try {
      const response = await axios.post("/api/v1/major/create-group", {
        type,
        org,
      });
      setGroup(response.data.data);
      toast.success("Group created successfully");
      fetchGroup();
    } catch (error) {
      let errorMessage = error.response.data.message;
      toast.error(errorMessage || "Failed to create group");
      // handleError(error, "Failed to create group");
    }
    setLoading(false);
  };

  const addMember = async () => {
    if (!rollNumber) return toast.error("Please enter a roll number");
    try {
      await axios.post("/api/v1/major/add-member", {
        rollNumber,
        groupId: group?._id,
      });
      toast.success("Request sent successfully");
      setRollNumber("");
      fetchGroup();
    } catch (error) {
      let errorMessage = error.response.data.message;
      toast.error(errorMessage || "Failed to add member");
      // handleError(error, "Failed to add member");
    }
  };

  const removeMember = async (rollNumber) => {
    try {
      await axios.post("/api/v1/major/remove-member", {
        rollNumber,
        groupId: group?._id,
      });
      toast.success("Member removed successfully");
      fetchGroup();
    } catch (error) {
      let errorMessage = error.response.data.message;
      toast.error(errorMessage || "Failed to remove member");
      //handleError(error, "Failed to remove member");
    }
  };

  const acceptRequest = async (groupId) => {
    try {
      await axios.post("/api/v1/major/accept-req", { groupId });
      toast.success("Request accepted successfully");
      fetchRequests();
      fetchGroup();
    } catch (error) {
      let errorMessage = error.response.data.message;
      toast.error(errorMessage || "Failed to accept request");
      //handleError(error, "Failed to accept request");
    }
  };

  const requestTypeChange = async () => {
    if (!requestedType) {
      return toast.error("Please select a type");
    }

    if (requestedType === "industrial" && !requestedOrg) {
      return toast.error("Please select an organization for industrial type");
    }

    // Warning popup
    const confirmed = window.confirm(
      "WARNING: Type change requests cannot be cancelled once submitted. " +
      (group?.majorAllocatedProf 
        ? "This request will require professor approval. " 
        : "This change will be applied immediately. ") +
      "Are you sure you want to proceed?"
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      await axios.post("/api/v1/major/request-type-change", {
        requestedType,
        org: requestedType === "industrial" ? requestedOrg : undefined,
      });
      toast.success(
        group?.majorAllocatedProf 
          ? "Type change request submitted for professor approval" 
          : "Type changed successfully"
      );
      setRequestedType("");
      setRequestedOrg("");
      fetchGroup();
      fetchTypeChangeStatus();
    } catch (error) {
      let errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to submit type change request");
    }
    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">
                Major Internship Group
              </h1>
              <p className="text-blue-100 mt-1">
                {group
                  ? "Manage your group members"
                  : "Create your internship group"}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("group")}
                className={`px-6 py-3 font-medium text-sm md:text-base ${
                  activeTab === "group"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {group ? "My Group" : "Create Group"}
              </button>
              {(!group || group.type !== "industrial") && (
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`px-6 py-3 font-medium text-sm md:text-base relative ${
                    activeTab === "requests"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Join Requests
                  {requests.length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {requests.length}
                    </span>
                  )}
                </button>
              )}
              {group && (
                <button
                  onClick={() => setActiveTab("typeChange")}
                  className={`px-6 py-3 font-medium text-sm md:text-base relative ${
                    activeTab === "typeChange"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Type Change
                  {currentUserHasPendingRequest() && (
                    <span className="absolute top-1 right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "requests" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Pending Group Requests
                  </h2>
                  {requests.length > 0 ? (
                    <div className="grid gap-4">
                      {requests.map((request) => (
                        <div
                          key={request._id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-3 md:mb-0">
                              <h3 className="font-semibold text-gray-800">
                                Group ID:{" "}
                                <span className="text-blue-600">
                                  {request.groupId}
                                </span>
                              </h3>
                              <p className="text-sm text-gray-600">
                                Leader:{" "}
                                <span className="font-medium">
                                  {request.leader?.fullName}
                                </span>
                              </p>
                              {request.members.length > 0 && (
                                <p className="text-sm text-gray-600">
                                  Members:{" "}
                                  <span className="font-medium">
                                    {request.members.length - 1}
                                  </span>
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => acceptRequest(request._id)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
                            >
                              Accept Request
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700">
                        No pending requests
                      </h3>
                      <p className="text-gray-500 mt-1">
                        You don't have any group join requests at this time.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "typeChange" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Group Type Change
                  </h2>

                  {/* Current Group Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Current Group Information</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Type: </span>
                        <span className="font-semibold text-blue-600 capitalize">
                          {typeChangeStatus?.group?.type || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Members: </span>
                        <span className="font-semibold">
                          {typeChangeStatus?.group?.members?.length || 0}
                        </span>
                      </div>
                      {typeChangeStatus?.group?.org && (
                        <div>
                          <span className="text-gray-600">Organization: </span>
                          <span className="font-semibold">
                            {typeChangeStatus?.group?.org?.companyName}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Professor: </span>
                        <span className="font-semibold">
                          {typeChangeStatus?.group?.majorAllocatedProf?.fullName || "Not Allocated"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pending Requests Status */}
                  {typeChangeStatus?.typeChangeRequests?.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Pending Type Change Requests
                      </h3>
                      <div className="space-y-3">
                        {typeChangeStatus.typeChangeRequests.map((req, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="grid md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Requested by: </span>
                                <span className="font-semibold">{req.user?.fullName}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Requested Type: </span>
                                <span className="font-semibold capitalize text-blue-600">
                                  {req.requestedType}
                                </span>
                              </div>
                              {req.org && (
                                <div>
                                  <span className="text-gray-600">Organization: </span>
                                  <span className="font-semibold">{req.org?.companyName}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600">Status: </span>
                                <span className={`font-semibold capitalize ${
                                  req.status === "pending" ? "text-yellow-600" :
                                  req.status === "approved" ? "text-green-600" :
                                  "text-red-600"
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-600">Initiated: </span>
                                <span className="font-medium text-xs">
                                  {new Date(req.initiatedAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {typeChangeStatus?.group?.majorAllocatedProf && (
                        <p className="text-sm text-gray-600 mt-3">
                          ⏳ Waiting for professor approval. You cannot submit a new request while a request is pending.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Request Type Change Form */}
                  {!currentUserHasPendingRequest() && (
                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-4">Request Type Change</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Type
                          </label>
                          <select
                            value={requestedType}
                            onChange={(e) => setRequestedType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Type</option>
                            <option value="research">Research</option>
                            <option value="industrial">Industrial</option>
                          </select>
                        </div>

                        {requestedType === "industrial" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Organization
                            </label>
                            <select
                              value={requestedOrg}
                              onChange={(e) => setRequestedOrg(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Organization</option>
                              {company.map((comp) => (
                                <option key={comp._id} value={comp._id}>
                                  {comp.companyName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {typeChangeStatus?.group?.members?.length === 2 && requestedType === "industrial" && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <p className="text-sm text-orange-800">
                              <strong>⚠️ Note:</strong> Changing to industrial type will split your 2-member group. 
                              {typeChangeStatus?.group?.majorAllocatedProf 
                                ? " The professor will decide the outcome." 
                                : " You will be moved to a new industrial group, and the other member will remain in the current research group."}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={requestTypeChange}
                          disabled={loading || !requestedType || (requestedType === "industrial" && !requestedOrg)}
                          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {loading ? "Processing..." : "Submit Type Change Request"}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                          ⚠️ This action cannot be cancelled once submitted
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Type Change Rules:</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Research groups can have up to 2 members</li>
                      <li>Industrial groups can only have 1 member</li>
                      <li>Changes before professor allocation are applied immediately</li>
                      <li>Changes after professor allocation require approval</li>
                      <li>Type change requests cannot be cancelled</li>
                      {typeChangeStatus?.group?.members?.length === 2 && (
                        <li className="font-semibold">If both members request a type change, the professor will approve/reject both together</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "group" && (
                <>
                  {group ? (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <h3 className="text-sm font-medium text-blue-800">
                            Group ID
                          </h3>
                          <p className="text-xl font-bold text-blue-600 mt-1">
                            {group?.groupId}
                          </p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                          <h3 className="text-sm font-medium text-indigo-800">
                            Group Leader
                          </h3>
                          <p className="text-xl font-bold text-indigo-600 mt-1">
                            {group?.leader?.fullName || "Not Assigned"}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                          <h3 className="text-sm font-medium text-purple-800">
                            Professor
                          </h3>
                          <p className="text-xl font-bold text-purple-600 mt-1">
                            {group?.majorAllocatedProf?.fullName ||
                              "Not Allocated"}
                          </p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                          <h3 className="text-sm font-medium text-indigo-800">
                            Group Company
                          </h3>
                          <p className="text-xl font-bold text-indigo-600 mt-1">
                            {group?.org?.companyName || "Not Assigned"}
                          </p>
                        </div>
                      </div>

                      {group.type !== "industrial" && (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-medium text-gray-800">
                              Add New Member
                            </h3>
                          </div>
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                                placeholder="Enter Roll Number"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                onClick={addMember}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                              >
                                Send Request
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {group.type === "industrial" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            ℹ️ Industrial groups can only have 1 member. Adding new members is not allowed.
                          </p>
                        </div>
                      )}

                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <h3 className="font-medium text-gray-800">
                            Group Members ({group.members.length})
                          </h3>
                        </div>
                        {group.members.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Name
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Roll Number
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Email
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {group.members.map((member) => (
                                  <tr
                                    key={member._id}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                          <span className="text-blue-600 font-medium">
                                            {member.fullName
                                              ?.split(" ")
                                              .map((n) => n[0])
                                              .join("")
                                              .toUpperCase()}
                                          </span>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            {member.fullName}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {member.rollNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {member.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() =>
                                          removeMember(
                                            member.rollNumber.toUpperCase()
                                          )
                                        }
                                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No members
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Add members to your group by sending them
                              requests.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center py-4">
                        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Create Your Group
                        </h2>
                        <p className="text-gray-600 mt-2">
                          Start by selecting your internship type
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="internship-type"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Internship Type
                            </label>
                            <select
                              id="internship-type"
                              value={type}
                              onChange={(e) => setType(e.target.value)}
                              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Type</option>
                              <option value="research">Research</option>
                              <option value="industrial">Industrial</option>
                            </select>
                          </div>

                          {type === "industrial" && (
                            <div>
                              <label
                                htmlFor="company"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Company
                              </label>
                              <select
                                id="company"
                                onChange={(e) => setOrg(e.target.value)}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select Company</option>
                                {company?.map((ele) => (
                                  <option key={ele._id} value={ele._id}>
                                    {ele.companyName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="pt-2">
                            <button
                              onClick={createGroup}
                              disabled={
                                loading ||
                                !type ||
                                (type === "industrial" && !org)
                              }
                              className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md ${
                                loading ||
                                !type ||
                                (type === "industrial" && !org)
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                              }`}
                            >
                              {loading ? (
                                <span className="flex items-center justify-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Creating...
                                </span>
                              ) : (
                                "Create Group"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MajorGroupManagement;
