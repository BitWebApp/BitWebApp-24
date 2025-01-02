import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function RoomStatus() {
  const [roomStatus, setRoomStatus] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomStatus();
  }, []);

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
          <tr>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {roomStatus.map((status, index) => (
            <tr key={index}>
            <td>{status.bookingDate.split("T")[0]}</td>
            <td>{status.startTime}</td>
            <td>{status.endTime}</td>
            <td>{status.building} - {status.classroomNumber}</td>
            <td>{status.purpose}</td>
            <td
              className={`font-semibold ${
                status.status === "Approved" ? "text-green-600" : "text-red-600"
              }`}
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
