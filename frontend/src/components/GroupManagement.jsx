import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";

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
  console.log(message);

  toast.error(message);
};

const GroupManagement = () => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [facultyId, setFacultyId] = useState("");

  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    try {
      const response = await axios.get("/api/v1/group/get-group");
      console.log(response.data.data);
      setGroup(response.data.data);
    } catch (error) {
      console.log(error);
      setGroup(null);
    }
  };

  const createGroup = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/group/create-group");
      setGroup(response.data.data);
      toast.success("Group created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
    setLoading(false);
  };

  const addMember = async () => {
    try {
      await axios.post("/api/v1/group/add-member", {
        rollNumber,
        groupId: group._id,
      });
      toast.success("Member added successfully");
      fetchGroup();
    } catch (error) {
      console.log(error.response?.data);
      handleError(error, "Failed to add member");
    }
  };

  const removeMember = async () => {
    try {
      await axios.post("/api/v1/group/remove-member", {
        rollNumber,
        groupId: group._id,
      });
      toast.success("Member removed successfully");
      fetchGroup();
    } catch (error) {
      console.log(error.response?.data);
      handleError(error, "Failed to remove member");
    }
  };

  const applyToFaculty = async () => {
    try {
      await axios.post("/api/v1/group/apply-faculty", { facultyId });
      toast.success("Applied to faculty successfully");
      fetchGroup();
    } catch (error) {
      console.log(error.response?.data);
      handleError(error, "Failed to apply");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            {group ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Group Details
                </h2>
                <p className="mt-2 text-gray-600">Group ID: {group?.groupId}</p>
                <p className="mt-2 font-semibold text-gray-700">
                  Professor:{" "}
                  {group?.summerAllocatedProf?.fullName || "Not Allocated"}
                </p>
                <p className="mt-2 font-semibold text-gray-700">
                  Leader: {group.leader.fullName}
                </p>

                <h3 className="mt-4 font-semibold text-gray-700">Members:</h3>
                <ul className="mt-2 text-gray-600">
                  {group.members.map((member) => (
                    <li key={member._id}>{member.fullName}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter Roll Number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="p-2 border rounded-md w-full"
                  />
                  <button
                    onClick={addMember}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full"
                  >
                    Add Member
                  </button>
                  <button
                    onClick={removeMember}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 w-full"
                  >
                    Remove Member
                  </button>
                </div>
                <div className="mt-4">
                  <input
                    disabled={group?.summerAllocatedProf?.fullName}
                    type="text"
                    placeholder="Enter Faculty ID"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="p-2 border rounded-md w-full"
                  />
                  <button
                    disabled={group?.summerAllocatedProf?.fullName}
                    onClick={applyToFaculty}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
                  >
                    Apply to Faculty
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  No Group Found
                </h2>
                <button
                  onClick={createGroup}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading ? "Creating..." : "Create Group"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupManagement;
