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
      setRoomStatus(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch room status:", error);
      setRoomStatus([]); // Ensure it doesn't break
    }
  };
  
  const Request = () => {
    navigate('/db/classroom-form');
  };
  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">Room Status</h2>
      <table className="min-w-full divide-y divide-gray-200">
      <thead>
            <tr className="bg-gray-100">
              <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Time
              </th>
              <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
              </th>
              <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Purpose
              </th>
              <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roomStatus.map((status, index) => (
            <tr key={index} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-md text-gray-900">{formatReadableDate(status.bookingDate)}</td>
            <td className="px-6 py-4 text-md text-gray-900">{status.startTime}</td>
            <td className="px-6 py-4 text-md text-gray-900">{status.endTime}</td>
            <td className="px-6 py-4 text-md text-gray-900">{status.building} - {status.classroomNumber}</td>
            <td className="px-6 py-4 text-md text-gray-900">{status.purpose}</td>
            <td
              className={`font-semibold ${
                status.status === "Approved" ? "text-green-600" : "text-red-600"
              } px-6 py-4 text-md text-black-1000` } 
            >
              {status.status}
            </td>
          </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-8">
        <button onClick={Request} className="bg-green-500 text-white px-4 py-2 rounded-md">Request A Room</button>
      </div>
    </div>
  );
}
