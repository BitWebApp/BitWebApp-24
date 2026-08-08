import { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const handleError = (error, defaultMessage) => {
  let message = error.response?.data?.message || defaultMessage;
  toast.error(message);
};

const Project1GroupManagement = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [activeTab, setActiveTab] = useState("group");

  const fetchUser = async () => {
    setUserLoading(true);
    try {
      const response = await axios.get("/api/v1/users/get-user");
      setCurrentUser(response.data.data);
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchGroup();
    fetchRequests();
  }, []);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/project1/get-project1");
      setGroup(response.data.data);
    } catch (error) {
      setGroup(null);
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get("/api/v1/project1/get-req");
      setRequests(response.data.data || []);
    } catch (error) {
      // silent — user may not have requests
    }
  };

  const createGroup = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/project1/create", {});
      setGroup(response.data.data);
      toast.success("Project 1 group created successfully");
      fetchGroup();
    } catch (error) {
      let errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to create group");
    }
    setLoading(false);
  };

  const addMember = async () => {
    if (!rollNumber) return toast.error("Please enter a roll number");
    try {
      await axios.post("/api/v1/project1/add-member", {
        rollNumber,
        groupId: group?._id,
      });
      toast.success("Request sent successfully");
      setRollNumber("");
      fetchGroup();
    } catch (error) {
      let errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to add member");
    }
  };

  const removeMember = async (memberRollNumber) => {
    try {
      await axios.post("/api/v1/project1/remove-member", {
        rollNumber: memberRollNumber,
        groupId: group?._id,
      });
      toast.success("Member removed successfully");
      fetchGroup();
    } catch (error) {
      let errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to remove member");
    }
  };

  const leaveGroup = async () => {
    try {
      await axios.post("/api/v1/project1/leave-group");
      toast.success("Left group successfully");
      setGroup(null);
      fetchGroup();
      fetchUser();
    } catch (error) {
      let errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to leave group");
    }
  };

  const acceptRequest = async (groupId) => {
    try {
      await axios.post("/api/v1/project1/accept-req", { groupId });
      toast.success("Request accepted successfully");
      fetchRequests();
      fetchGroup();
    } catch (error) {
      let errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Failed to accept request");
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-700 font-medium">Loading User Profile...</span>
        </div>
      </div>
    );
  }

  const isLeader = group && currentUser && group.leader?._id === currentUser._id;

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">
                Project 1 Group
              </h1>
              <p className="text-purple-100 mt-1">
                {group
                  ? "Manage your group members"
                  : "Create your Project 1 group"}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("group")}
                className={`px-6 py-3 font-medium text-sm md:text-base ${
                  activeTab === "group"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {group ? "My Group" : "Create Group"}
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-6 py-3 font-medium text-sm md:text-base relative ${
                  activeTab === "requests"
                    ? "text-purple-600 border-b-2 border-purple-600"
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
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-3 md:mb-0">
                              <h3 className="font-semibold text-gray-800">
                                Group ID:{" "}
                                <span className="text-purple-600">
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
                                  </span>{" "}
                                  other(s)
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
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                          <h3 className="text-sm font-medium text-purple-800">
                            Group ID
                          </h3>
                          <p className="text-xl font-bold text-purple-600 mt-1">
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
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <h3 className="text-sm font-medium text-blue-800">
                            Professor
                          </h3>
                          <p className="text-xl font-bold text-blue-600 mt-1">
                            {group?.allocatedProf?.fullName || "Not Allocated"}
                          </p>
                        </div>
                      </div>

                      {/* Add member (leader only, pre-allocation) */}
                      {isLeader && !group.allocatedProf && (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-medium text-gray-800">
                              Add New Member (Max 3)
                            </h3>
                          </div>
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                                placeholder="Enter Roll Number"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              <button
                                onClick={addMember}
                                disabled={group.members.length >= 3}
                                className={`px-4 py-2 text-white rounded-lg transition-all shadow-sm ${
                                  group.members.length >= 3
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                                }`}
                              >
                                Send Request
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Members table */}
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <h3 className="font-medium text-gray-800">
                            Group Members ({group.members.length}/3)
                          </h3>
                        </div>
                        {group.members.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Roll Number
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {group.members.map((member) => (
                                  <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                          <span className="text-purple-600 font-medium">
                                            {(member?.fullName || "M")
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
                                          {group.leader?._id === member._id && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                              Leader
                                            </span>
                                          )}
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
                                      {!group.allocatedProf && (
                                        <>
                                          {isLeader && member._id !== currentUser._id && (
                                            <button
                                              onClick={() => removeMember(member.rollNumber.toUpperCase())}
                                              className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                                            >
                                              Remove
                                            </button>
                                          )}
                                          {member._id === currentUser._id && !isLeader && (
                                            <button
                                              onClick={leaveGroup}
                                              className="text-orange-600 hover:text-orange-900 px-3 py-1 rounded-md hover:bg-orange-50 transition-colors"
                                            >
                                              Leave
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No members
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Add members to your group by sending them requests.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center py-4">
                        <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-purple-600"
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
                          Create Your Project 1 Group
                        </h2>
                        <p className="text-gray-500 mt-2">
                          Start by creating a group, then invite members (max 3)
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="space-y-4">
                          <div className="pt-2">
                            <button
                              onClick={createGroup}
                              disabled={loading}
                              className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md ${
                                loading
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
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
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

export default Project1GroupManagement;
