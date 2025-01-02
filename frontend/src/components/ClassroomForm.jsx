import React, { useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClassroomForm() {
  const [building, setBuilding] = useState("");
  const [classroomNumber, setClassroomNumber] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const classroomOptions = {
    "Main Building": ["212", "213", "214"],
    "RnD": ["Lab 1", "Lab 2", "Lab 3"],
    "Lecture Hall": ["LH1", "LH2"],
    "Cat Hall": ["CAT HALL"],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const htmlContent = `
      <div style="text-align: left; padding: 20px;">
        <p style="font-size: 20px; margin: 10px 0; color: #333;">
          <strong>Building:</strong> ${building}
        </p>
        <p style="font-size: 20px; margin: 10px 0; color: #333;">
          <strong>Room:</strong> ${classroomNumber}
        </p>
        <p style="font-size: 20px; margin: 10px 0; color: #333;">
          <strong>Date:</strong> ${bookingDate} | <strong>Time:</strong> ${startTime} to ${endTime}
        </p>
        <p style="font-size: 20px; margin: 10px 0; color: #333;">
          <strong>Purpose:</strong> ${purpose}
        </p>
        <br/>
      </div>
      <p style="font-size: 17px; color: #666;">
          Do you want to submit the form?
      </p>
    `;

    Swal.fire({
      title: "Confirm Booking?",
      html: htmlContent,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel!',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          setLoading(true);
          console.log("Inside Try");
          const response = await axios.post("/api/v1/classroom", {
            building: building,
            classroomNumber: classroomNumber,
            bookingDate: bookingDate,
            startTime: startTime,
            endTime: endTime,
            purpose: purpose
          },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
              }
            }
          );
          console.log("Outside Try");
          if (response.data.success) {
            console.log("Sent");
            toast.success("Booking request submitted successfully!");
            navigate("/db/room-status");
          } else {
            toast.error(response.data.message || "Error submitting booking.");
          }
        } catch (error) {
          toast.error(error.response?.data.message || "Error submitting booking. Please try again");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const RoomStatus = () => {
    navigate('/db/room-status');
  };

  const AllBookedRooms = () => {
    navigate('/db/booked-rooms');
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full flex flex-col p-10 justify-between">
        <h3 className="text-3xl font-semibold mb-4">Classroom Booking Form</h3>
        <form onSubmit={handleSubmit} className="w-full">
          <label>Building</label>
          <select
            value={building}
            onChange={(e) => {
              setBuilding(e.target.value);
              setClassroomNumber("");
            }}
            required
            className="w-full py-2 my-2 border-b border-black bg-transparent"
          >
            <option value="" disabled>Select Building</option>
            {Object.keys(classroomOptions).map((bldg) => (
              <option key={bldg} value={bldg}>{bldg}</option>
            ))}
          </select>

          <label>Classroom Number</label>
          <select
            value={classroomNumber}
            onChange={(e) => setClassroomNumber(e.target.value)}
            required
            className="w-full py-2 my-2 border-b border-black bg-transparent"
            disabled={!building}
          >
            <option value="" disabled>Select Classroom</option>
            {classroomOptions[building]?.map((room) => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>

          <label>Booking Date</label>
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            required
            className="w-full py-2 my-2 border-b border-black bg-transparent"
          />

          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full py-2 my-2 border-b border-black bg-transparent"
          />

          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full py-2 my-2 border-b border-black bg-transparent"
          />

          <label>Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            placeholder="Enter the purpose of booking"
            className="w-full py-2 my-2 border-b border-black bg-transparent"
          />

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className={`bg-black text-white px-6 py-3 rounded-md ${loading && "opacity-70"}`}
              disabled={loading}
            >
              {loading ? <ClipLoader size={24} color="#ffffff" /> : "Save"}
            </button>
          </div>
        </form>

        <div className="flex justify-center mt-4">
          <button
            onClick={RoomStatus}
            className="bg-green-500 text-white px-4 py-2 rounded-md mr-4"
          >
            Show Status of Room
          </button>
          <button
            onClick={AllBookedRooms}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Show All Booked Rooms
          </button>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}
