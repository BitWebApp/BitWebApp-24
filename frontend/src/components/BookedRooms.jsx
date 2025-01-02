import React, { useState, useEffect } from "react";
import axios from "axios";

export default function BookedRooms() {
  const [bookings, setBookings] = useState([]);

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
      console.log("Response ", response.data);

      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch booked rooms.");
    }
  };

  console.log("Printing bookings", bookings);


  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold mb-4">All Booked Rooms</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Student Name</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={index}>
              <td className="px-6 py-4 text-md text-gray-900">{formatReadableDate(booking.bookingDate)}</td>
              <td className="px-6 py-4 text-md text-gray-900">{booking.startTime}</td>
              <td className="px-6 py-4 text-md text-gray-900">{booking.endTime}</td>
              <td className="px-6 py-4 text-md text-gray-900">{booking.student.fullName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
