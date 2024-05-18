import React, { useEffect, useState } from "react";
import axios from "axios";

const UnverifiedUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnverifiedUsers = async () => {
      try {
        const response = await axios.get("api/v1/admin/unverifiedUsers");
        console.log("checking", response.data.data.us);
        setUsers(response.data.data.us);
      } catch (err) {
        setError("Something went wrong while fetching unverified users");
      }
    };

    fetchUnverifiedUsers();
  }, []);

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelectedUserIds) => {
      if (prevSelectedUserIds.includes(userId)) {
        return prevSelectedUserIds.filter((id) => id !== userId);
      } else {
        return [...prevSelectedUserIds, userId];
      }
    });
  };
  const handleSubmit = async () => {
    console.log("button clicked");
    try {
      setLoading(true);
      for (let i = 0; i < selectedUserIds.length; i++) {
        try {
          const response = await axios.patch("api/v1/admin/verifyUser", {
            userId: selectedUserIds[i],
          });
          console.log(response);
        } catch (err) {
          console.log("Error verifying user", selectedUserIds[i], err);
        }
      }
      const updatedUsersResponse = await axios.get(
        "api/v1/admin/unverifiedUsers"
      );
      setUsers(updatedUsersResponse.data.data.us);
    } catch (err) {
      console.log("Error verifying users", err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Unverified Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Roll Number</th>
              <th className="py-2 px-4">ID Card</th>
              <th className="py-2 px-4">Verified</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.rollNumer}</td>
                <td className="py-2 px-4">{user.idCard}</td>
                <td className="py-2 px-4 text-center">
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
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Selected User IDs</h2>
        <pre>{JSON.stringify(selectedUserIds, null, 2)}</pre>
      </div>
      <div className="flex flex-col">
        <button onClick={handleSubmit} className="text-blue-600">
          Verify Users
        </button>
      </div>
    </div>
  );
};

export default UnverifiedUsers;
