import { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const extractErrorMessage = (htmlString) => {
  const match = htmlString.match(/<pre>(.*?)<\/pre>/s);
  if (match && match[1]) {
    return match[1].split("<br>")[0].replace("Error: ", "").trim();
  }
  return "An unknown error occurred";
};

const handleError = (error, defaultMessage) => {
  console.error("Full error:", error);

  let message = defaultMessage;
  if (error.response) {
    if (typeof error.response.data === "string") {
      message = extractErrorMessage(error.response.data);
    } else if (error.response.data?.message) {
      message = error.response.data.message;
    }
  }
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

  useEffect(() => {
    fetchCompanies();
    fetchGroup();
    fetchRequests(); // Fetch group requests on mount
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get("/api/v1/users/get-user-companies");
      setCompany(data?.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
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

  // New function to fetch group requests
  const fetchRequests = async () => {
    try {
      const response = await axios.get("/api/v1/group/get-req");
      console.log(response.data.data)
      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load group requests!");
    }
  };

  const createGroup = async () => {
    if (!typeofSummer)
      return toast.error("Type of summer internship is required");
    if (typeofSummer === "industrial" && !org)
      return toast.error("Organisation Name is required for industrial internship");

    setLoading(true);
    try {
      const response = await axios.post("/api/v1/group/create-group", {
        typeofSummer,
        org,
      });
      setGroup(response.data.data);
      toast.success("Group created successfully");
      fetchGroup();
    } catch (error) {
      handleError(error, "Failed to create group");
    }
    setLoading(false);
  };

  const addMember = async () => {
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

  // New function to accept a group request
  const acceptRequest = async (groupId) => {
    try {
      await axios.post("/api/v1/group/accept-req", { groupId });
      toast.success("Request accepted successfully");
      fetchRequests(); // Refresh the request list
      fetchGroup(); // Refresh the group data
    } catch (error) {
      handleError(error, "Failed to accept request");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-white">
        <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg text-gray-800">
          {/* Display Group Requests */}
          {requests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Pending Group Requests</h2>
              <ul className="space-y-2">
                {requests.map((request) => (
                  <li
                    key={request._id}
                    className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                  >
                    <span>
                      {request.groupId} -{" "}
                      {request.leader?.fullName}
                    </span>
                    <button
                      onClick={() => acceptRequest(request._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Accept
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {group ? (
            <div>
              <h2 className="text-2xl font-bold text-center text-blue-600">
                Group Details
              </h2>
              <p className="mt-2 text-center font-semibold">
                Group ID: {group?.groupId}
              </p>
              <p className="mt-2 text-center font-semibold">
                Leader: {group?.leader?.fullName || "Not Assigned"}
              </p>
              <p className="mt-2 text-center font-semibold">
                Professor: {group?.summerAllocatedProf?.fullName || "Not Allocated"}
              </p>

              <div className="mt-4 flex space-x-2">
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter Roll Number"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addMember}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add Member
                </button>
              </div>

              <h3 className="mt-6 text-lg font-semibold text-gray-700">
                Members
              </h3>
              {group.members.length > 0 ? (
                <table className="w-full mt-2 border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-500 text-white">
                      <th className="border border-gray-300 px-4 py-2">Name</th>
                      <th className="border border-gray-300 px-4 py-2">Roll Number</th>
                      <th className="border border-gray-300 px-4 py-2">Email</th>
                      <th className="border border-gray-300 px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.members.map((member) => (
                      <tr
                        key={member._id}
                        className="text-center hover:bg-gray-100"
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          {member.fullName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {member.rollNumber}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {member.email}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            onClick={() => removeMember(member.rollNumber.toUpperCase())}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mt-2 text-gray-600">No members in the group</p>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                No Group Found
              </h2>
              <div className="flex flex-col space-y-4">
                <select
                  value={typeofSummer}
                  onChange={(e) => setTypeofSummer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type of Internship</option>
                  <option value="research">Research</option>
                  <option value="industrial">Industrial</option>
                </select>
                {typeofSummer === "industrial" && (
                  <select
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Company</option>
                    {company?.map((ele) => (
                      <option key={ele._id} value={ele._id}>
                        {ele.companyName}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={createGroup}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 w-full"
                >
                  {loading ? "Creating..." : "Create Group"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupManagement;