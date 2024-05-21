import React, { useEffect, useState } from "react"
import axios from "axios"

const UnverifiedUsers = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUnverifiedUsers = async () => {
      try {
        const response = await axios.get("api/v1/admin/unverifiedUsers")
        setUsers(response.data.data.us)
      } catch (err) {
        setError("Something went wrong while fetching unverified users")
      }
    }
    fetchUnverifiedUsers()
  }, [])

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelectedUserIds) =>
      prevSelectedUserIds.includes(userId)
        ? prevSelectedUserIds.filter((id) => id !== userId)
        : [...prevSelectedUserIds, userId]
    )
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      for (let i = 0; i < selectedUserIds.length; i++) {
        try {
          const response = await axios.patch("api/v1/admin/verifyUser", {
            userId: selectedUserIds[i],
          })
          console.log(response)
        } catch (err) {
          console.log("Error verifying user", selectedUserIds[i], err)
        }
      }
      const updatedUsersResponse = await axios.get(
        "api/v1/admin/unverifiedUsers"
      )
      setUsers(updatedUsersResponse.data.data.us)
    } catch (err) {
      console.log("Error verifying users", err)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>
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
                    src={user.idCard}
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
          onClick={handleSubmit}
          disabled={loading || selectedUserIds.length == 0}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify Users"}
        </button>
      </div>
    </div>
  )
}

export default UnverifiedUsers
