import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function RoomStatus() {
  const [roomStatus, setRoomStatus] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomStatus();
  }, []);

  function formatReadableDate(isoDate) {
    const date = new Date(isoDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  const fetchRoomStatus = async () => {
    try {
      const response = await axios.get("/api/v1/classroom/student");
      console.log("API Response:", response.data); // Debugging

      const sortedBookings = response.data.data.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      );

      setRoomStatus(sortedBookings || []);
      // setRoomStatus(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch room status:", error);
      setRoomStatus([]); // Ensure it doesn't break
    }
  };

  const Request = () => {
    navigate('/db/classroom-form');
  };
  return (
    <div className="p-8 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        Room Status
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-center divide-y divide-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="w-1/6 px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="w-1/6 px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">
                Start Time
              </th>
              <th className="w-1/6 px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">
                End Time
              </th>
              <th className="w-1/6 px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="w-1/6 px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">
                Purpose
              </th>
              <th className="w-1/6 px-6 py-3 text-sm font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roomStatus.map((status, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-100 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
              >
                <td className="px-6 py-4 text-sm text-gray-800 truncate max-w-xs">
                  {formatReadableDate(status.bookingDate)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {status.startTime}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {status.endTime}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 truncate max-w-xs">
                  {status.building} - {status.classroomNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 max-w-xs">
                  {status.purpose}
                </td>
                <td
                  className={`px-6 py-4 text-sm font-semibold ${status.status === "Approved" ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {status.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-8">
        <button 
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium shadow-sm transition duration-300"
        onClick={Request}
        >
          Request A Room
        </button>
      </div>
    </div>

  );
}
