import { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const GroupManagement = () => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rollNumber, setRollNumber] = useState("");

  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    try {
      const response = await axios.get("/api/v1/group/get-group");
      setGroup(response.data.data);
    } catch (error) {
      console.error(error);
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
      toast.error("Failed to create group");
    }
    setLoading(false);
  };

  const addMember = async () => {
    if (!rollNumber) return toast.error("Please enter a roll number");
    try {
      await axios.post("/api/v1/group/add-member", { rollNumber, groupId: group?._id });
      toast.success("Member added successfully");
      setRollNumber("");
      fetchGroup();
    } catch (error) {
      toast.error("Failed to add member");
    }
  };

  const removeMember = async (rollNumber) => {
    try {
      await axios.post("/api/v1/group/remove-member", { rollNumber, groupId: group?._id });
      toast.success("Member removed successfully");
      fetchGroup();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-white">
        <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg text-gray-800">
          {group ? (
            <div>
              <h2 className="text-2xl font-bold text-center text-blue-600">Group Details</h2>
              <p className="mt-2 text-center font-semibold">Group ID: {group?.groupId}</p>
              <p className="mt-2 text-center font-semibold">Leader: {group?.leader?.fullName || "Not Assigned"}</p>
              
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
              
              <h3 className="mt-6 text-lg font-semibold text-gray-700">Members</h3>
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
                      <tr key={member._id} className="text-center hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-2">{member.fullName}</td>
                        <td className="border border-gray-300 px-4 py-2">{member.rollNumber}</td>
                        <td className="border border-gray-300 px-4 py-2">{member.email}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            onClick={() => removeMember(member.rollNumber)}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">No Group Found</h2>
              <button
                onClick={createGroup}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 w-full"
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupManagement;
