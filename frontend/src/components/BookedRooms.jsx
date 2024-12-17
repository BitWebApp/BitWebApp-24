import React, { useState, useEffect } from "react";
import axios from "axios";

export default function BookedRooms() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/v1/classroom/allBookings");
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch booked rooms.");
    }
  };

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
              <td>{booking.date}</td>
              <td>{booking.startTime}</td>
              <td>{booking.endTime}</td>
              <td>{booking.studentName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
