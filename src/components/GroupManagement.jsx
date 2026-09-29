import { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const handleError = (error, defaultMessage) => {
  let message = error.response?.data?.message || defaultMessage || "An error occurred";
  toast.error(message);
};

const GroupManagement = () => {
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [typeofSummer, setTypeofSummer] = useState("");
  const [company, setCompany] = useState([]);
  const [org, setOrg] = useState("");
  const [location, setLocation] = useState(""); // new location state
  const [activeTab, setActiveTab] = useState("group");
  const [joinCode, setJoinCode] = useState("");
  const [showChangeType, setShowChangeType] = useState(false);
  const [newType, setNewType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newOrg, setNewOrg] = useState("");
  
  const [pendingRequest, setPendingRequest] = useState(null);
  const [memberCompanies, setMemberCompanies] = useState([]);
  const [memberAssignments, setMemberAssignments] = useState([]);
  const [newLeaderId, setNewLeaderId] = useState("");
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const currentUserId = currentUser._id;

  const fetchTypeChangeStatus = async () => {
    try {
      const response = await axios.get("/api/v1/group/get-summer-type-change-status");
      const requests = response.data?.data?.typeChangeRequests || [];
      const pending = requests.find((req) => 
        req.status === "pending" && 
        (req.initiatedBy === currentUserId || req.initiatedBy?._id === currentUserId)
      );
      setPendingRequest(pending || null);
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchGroup();
    fetchRequests();
    fetchTypeChangeStatus();
  }, []);

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
      const response = await axios.get("/api/v1/group/get-group");
      setGroup(response.data.data);
    } catch (error) {
      setGroup(null);
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get("/api/v1/group/get-req");
      setRequests(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load group requests!");
    }
  };

  const createGroup = async () => {
    if (!typeofSummer)
      return toast.error("Type of summer internship is required");
    if (typeofSummer === "industrial" && !org)
      return toast.error(
        "Organisation Name is required for industrial internship"
      );
    if (typeofSummer === "research" && !location)
      return toast.error("Please specify if the research is inside or outside BIT");

    setLoading(true);
    try {
      const response = await axios.post("/api/v1/group/create-group", {
        typeofSummer,
        org,
        location: typeofSummer === "research" ? location : "outside_bit" // industrial is always outside
      });
      setGroup(response.data.data);
      if (typeofSummer === "research" && location === "outside_bit") {
        toast.success("Outside BIT research group created. Max size is 1.");
      } else {
        toast.success("Group created successfully");
      }
      fetchGroup();
    } catch (error) {
      handleError(error, "Failed to create group");
    }
    setLoading(false);
  };

  const addMember = async () => {
    if (group?.typeOfSummer === "research" && group?.location === "outside_bit") {
      return toast.error("Outside BIT research groups can only have 1 member.");
    }
    if (!rollNumber) return toast.error("Please enter a roll number");
    try {
      await axios.post("/api/v1/group/add-member", {
        rollNumber,
        groupId: group?._id,
      });
      toast.success("Request sent successfully");
      setRollNumber("");
      fetchGroup();
    } catch (error) {
      handleError(error, "Failed to add member");
    }
  };

  const removeMember = async (rollNumber) => {
    try {
      await axios.post("/api/v1/group/remove-member", {
        rollNumber,
        groupId: group?._id,
      });
      toast.success("Member removed successfully");
      fetchGroup();
    } catch (error) {
      handleError(error, "Failed to remove member");
    }
  };

  const acceptRequest = async (groupId) => {
    try {
      await axios.post("/api/v1/group/accept-req", { groupId });
      toast.success("Request accepted successfully");
      fetchRequests();
      fetchGroup();
    } catch (error) {
      handleError(error, "Failed to accept request");
    }
  };

  const leaveGroup = async () => {
    if (
      !window.confirm(
        "Are you sure you want to leave this group? If you are the only member, the group will be deleted."
      )
    )
      return;
    setLoading(true);
    try {
      await axios.post("/api/v1/group/leave-group");
      toast.success("Left group successfully");
      setGroup(null);
      fetchGroup();
    } catch (error) {
      handleError(error, "Failed to leave group");
    }
    setLoading(false);
  };

  const joinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return toast.error("Please enter a group code");
    setLoading(true);
    try {
      await axios.post("/api/v1/group/join-by-code", { groupId: code });
      toast.success("Joined group successfully");
      setJoinCode("");
      fetchGroup();
    } catch (error) {
      handleError(error, "Failed to join group");
    }
    setLoading(false);
  };

  const openChangeType = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/group/get-member-companies");
      const companies = response.data?.data || [];
      setMemberCompanies(companies);
      
      if (group?.typeOfSummer === "research") {
        setNewType("industrial");
      } else {
        setNewType("industrial"); // Default to industrial to allow company change
      }
      
      setNewLocation(group?.location || "");
      setNewOrg(group?.org?._id || group?.org || "");
      setNewLeaderId("");
      setShowChangeType(true);
    } catch (error) {
      handleError(error, "Failed to load member companies");
    }
    setLoading(false);
  };

  const submitChangeType = async () => {
    setLoading(true);
    try {
      if (newType === "research") {
        if (!newLocation) {
          toast.error("Select a location for research internship");
          setLoading(false);
          return;
        }
        await axios.post("/api/v1/group/request-summer-type-change", {
          requestedType: "research",
          location: newLocation
        });
      } else {
        if (!newOrg) {
          toast.error("Please select a company for your industrial internship");
          setLoading(false);
          return;
        }

        const leaderIdStr = group?.leader?._id || group?.leader;
        let finalNewLeaderId = undefined;
        
        // If the current user is the leader and there are other members in the group
        if (currentUserId === leaderIdStr && group.members.length > 1) {
          if (!newLeaderId) {
            toast.error("Please select a new group leader since you are leaving");
            setLoading(false);
            return;
          }
          finalNewLeaderId = newLeaderId;
        }

        await axios.post("/api/v1/group/request-summer-type-change", {
          requestedType: "industrial",
          org: newOrg,
          newLeader: finalNewLeaderId
        });
      }
      toast.success("Type change request submitted for approval");
      setShowChangeType(false);
      fetchGroup();
      fetchTypeChangeStatus();
    } catch (error) {
      handleError(error, "Failed to submit type change request");
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
                Summer Internship Group
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

              {activeTab === "group" && (
                <>
                  {group ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2 justify-end">
                        {pendingRequest ? (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg shadow-sm text-sm font-medium border border-yellow-200">
                            Type Change Pending Approval
                          </span>
                        ) : !group?.summerAllocatedProf ? (
                          <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg shadow-sm text-sm border border-gray-200">
                            Mentor Allocation Required to Change Type
                          </span>
                        ) : (
                          <button
                            onClick={openChangeType}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm text-sm"
                          >
                            Change Internship Type
                          </button>
                        )}
                        <button
                          onClick={leaveGroup}
                          disabled={loading}
                          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all shadow-sm text-sm disabled:opacity-60"
                        >
                          Leave Group
                        </button>
                      </div>
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
                            {group?.summerAllocatedProf?.fullName ||
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

                      {(group?.typeOfSummer !== "research" || group?.location !== "outside_bit") && (
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
                                            {(member?.fullName || "Member")
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")
                                              .toUpperCase()}
                                          </span>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            {member?.fullName || "Member"}
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
                              value={typeofSummer}
                              onChange={(e) => setTypeofSummer(e.target.value)}
                              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Type</option>
                              <option value="research">Research</option>
                              <option value="industrial">Industrial</option>
                            </select>
                          </div>

                          {typeofSummer === "research" && (
                            <div>
                              <label
                                htmlFor="location-type"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Location
                              </label>
                              <select
                                id="location-type"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select Location</option>
                                <option value="inside_bit">Inside BIT</option>
                                <option value="outside_bit">Outside BIT (Max 1 Member)</option>
                              </select>
                            </div>
                          )}

                          {typeofSummer === "industrial" && (
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

                          <div className="border-t border-gray-200 pt-4">
                            <label
                              htmlFor="join-code"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Or join an existing group by code
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                id="join-code"
                                type="text"
                                value={joinCode}
                                onChange={(e) =>
                                  setJoinCode(e.target.value.toUpperCase())
                                }
                                placeholder="6-character Group ID"
                                maxLength={6}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg uppercase tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              />
                              <button
                                onClick={joinByCode}
                                disabled={loading || !joinCode.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm disabled:opacity-60"
                              >
                                Join Group
                              </button>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={createGroup}
                              disabled={
                                loading ||
                                !typeofSummer ||
                                (typeofSummer === "industrial" && !org) ||
                                (typeofSummer === "research" && !location)
                              }
                              className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md ${
                                loading ||
                                !typeofSummer ||
                                (typeofSummer === "industrial" && !org) ||
                                (typeofSummer === "research" && !location)
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

      {showChangeType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 m-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Request Internship Type Change
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              This request requires faculty approval.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Internship Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="research">Research</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              {newType === "research" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Location</option>
                    <option value="inside_bit">Inside BIT</option>
                    <option value="outside_bit">
                      Outside BIT
                    </option>
                  </select>
                </div>
              )}

              {newType === "industrial" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Company
                  </label>
                  <select
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Company</option>
                    {memberCompanies
                      .find((mc) => mc._id === currentUserId)
                      ?.companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.companyName}
                        </option>
                      ))}
                  </select>

                  {/* New Leader Selection */}
                  {currentUserId === (group?.leader?._id || group?.leader) &&
                    group?.members?.length > 1 && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Select New Group Leader
                        </label>
                        <p className="text-xs text-blue-600 mb-2">
                          Since you are leaving the research group, please appoint a new leader for the remaining members.
                        </p>
                        <select
                          value={newLeaderId}
                          onChange={(e) => setNewLeaderId(e.target.value)}
                          className="block w-full border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                        >
                          <option value="">Select new leader</option>
                          {memberCompanies
                            .filter((mc) => mc._id !== currentUserId)
                            .map((mc) => (
                              <option key={mc._id} value={mc._id}>
                                {mc.fullName} ({mc.rollNumber})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowChangeType(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitChangeType}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupManagement;
