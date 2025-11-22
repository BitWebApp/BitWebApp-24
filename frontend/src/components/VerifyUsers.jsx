import React, { useEffect, useState } from "react";
import axios from "axios";

const UnverifiedUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchUnverifiedUsers();
  }, []);
  const fetchUnverifiedUsers = async () => {
    const response = await axios.get("/api/v1/admin/unverifiedUsers");
    console.log(response);
    setUsers(response.data.data);
  };
  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelectedUserIds) =>
      prevSelectedUserIds.includes(userId)
        ? prevSelectedUserIds.filter((id) => id !== userId)
        : [...prevSelectedUserIds, userId]
    );
  };

  const handleVerifySubmit = async () => {
    try {
      setLoading(true);
      for (let i = 0; i < selectedUserIds.length; i++) {
        try {
          const response = await axios.patch("/api/v1/admin/verifyUser", {
            userId: selectedUserIds[i],
          });
          console.log(response);
        } catch (err) {
          console.log("Error verifying user", selectedUserIds[i], err);
        }
      }
      setSelectedUserIds([])
      const updatedUsersResponse = await axios.get(
        "/api/v1/admin/unverifiedUsers"
      );
      setUsers(updatedUsersResponse.data.data);
    } catch (err) {
      console.log("Error verifying users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      setRejectLoading(true);
      for (let i = 0; i < selectedUserIds.length; i++) {
        try {
          const response = await axios.patch("/api/v1/admin/rejectUser", {
            userId: selectedUserIds[i],
            reason: rejectReason,
          });
          console.log(response);
        } catch (err) {
          console.log("Error rejecting user", selectedUserIds[i], err);
        }
      }
      setSelectedUserIds([])
      const updatedUsersResponse = await axios.get(
        "/api/v1/admin/unverifiedUsers"
      );
      setUsers(updatedUsersResponse?.data?.data);
    } catch (err) {
      console.log("Error rejecting users", err);
    } finally {
      setRejectLoading(false);
      setShowRejectModal(false);
      setRejectReason("");
    }
  };

  const openRejectModal = () => {
    if (selectedUserIds.length === 0) {
      alert("Please select at least one user");
      return;
    }
    setShowRejectModal(true);
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Unverified Users
      </h1>
      <div className="overflow-x-auto shadow-md rounded">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Roll Number</th>
              <th className="py-3 px-6 text-left">ID Card</th>
              <th className="py-3 px-6">Verified</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b hover:bg-gray-100 transition-colors duration-300"
              >
                <td className="py-4 px-6">{user.name}</td>
                <td className="py-4 px-6">{user.rollNumer}</td>
                <td className="py-4 px-6">
                  <img
                    className="w-60 h-40 rounded-md"
                    src={
                      user.idCard.startsWith("http")
                        ? user.idCard
                        : `http://172.16.220.105:8000${user.idCard}`
                    }
                    alt={user.idCard}
                  />
                </td>
                <td className="py-4 px-6 text-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={selectedUserIds.includes(user._id)}
                    onChange={() => handleCheckboxChange(user._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Selected User IDs</h2>
        <pre className="bg-gray-100 p-4 rounded-md">
          {JSON.stringify(selectedUserIds, null, 2)}
        </pre>
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={handleVerifySubmit}
          disabled={loading || selectedUserIds.length == 0}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify Users"}
        </button>
        <button
          onClick={openRejectModal}
          disabled={rejectLoading || selectedUserIds.length == 0}
          className="ml-4 px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {rejectLoading ? "Rejecting..." : "Reject Users"}
        </button>
      </div>

      {/* Modal for rejection reason */}
      {showRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6">
            <h2 className="text-2xl mb-4">Enter Rejection Reason</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-32 border border-gray-300 rounded-md p-2"
              placeholder="Enter reason for rejection"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleRejectSubmit}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-300"
              >
                Reject
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="ml-4 px-6 py-3 bg-gray-300 text-black font-semibold rounded-md hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnverifiedUsers;

