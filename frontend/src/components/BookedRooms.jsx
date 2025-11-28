import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function BookedRooms() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  function formatReadableDate(isoDate) {
    const date = new Date(isoDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/v1/classroom/allBookings");
      // console.log("Response ", response.data);

      const sortedBookings = response.data.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      );

      setBookings(sortedBookings);
    } catch (error) {
      console.error("Failed to fetch booked rooms.");
    }
  };

  // console.log("Printing bookings", bookings);
  const Request = () => {
    navigate('/db/classroom-form');
  };

  return (
    <div className="p-8 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        All Booked Rooms
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-center divide-y divide-gray-300 border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                End Time
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                Student Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
              >
                <td className="px-6 py-4 text-sm text-gray-800">
                  {formatReadableDate(booking.bookingDate)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 truncate max-w-xs">
                  {booking.building} - {booking.classroomNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{booking.startTime}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{booking.endTime}</td>
                <td className="px-6 py-4 text-sm text-gray-800 max-w-xs">
                  {booking.student.fullName}
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
