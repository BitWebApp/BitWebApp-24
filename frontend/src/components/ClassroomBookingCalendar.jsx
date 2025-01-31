import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const classroomOptions = {
  "Main Building": [
    "201",
    "202",
    "203",
    "204",
    "205",
    "206",
    "207",
    "208",
    "209",
    "210",
    "211",
    "212",
    "213",
    "214",
    "215",
    "216",
    "217",
    "218",
    "219",
    "231",
  ],
  RnD: ["Lab 1", "Lab 2", "Lab 3", "Lab 4", "Lab 5", "Lab 6", "Lab 7"],
  "Lecture Hall": ["LH1", "LH2", "LH3", "LH4"],
  "Cat Hall": ["CAT HALL"],
};

const ClassroomBookingCalendar = () => {
  const [events, setEvents] = useState([]);
  const [building, setBuilding] = useState("");
  const [classroomNumber, setClassroomNumber] = useState("");
  const [bookingDate, setBookingDate] = useState("");

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!building || !classroomNumber || !bookingDate) return;

      try {
        const response = await axios.get(
          `/api/v1/classroom/bookedSlots?building=${building}&classroomNumber=${classroomNumber}&bookingDate=${bookingDate}`
        );

        const fetchedEvents = response.data.data.map((booking) => ({
          title: booking.purpose,
          start: new Date(
            `${booking.bookingDate.split("T")[0]}T${booking.startTime}:00`
          ),
          end: new Date(
            `${booking.bookingDate.split("T")[0]}T${booking.endTime}:00`
          ),
        }));

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };

    fetchBookedSlots();
  }, [building, classroomNumber, bookingDate]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Classroom Booking Calendar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-2">Building:</label>
          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Building</option>
            {Object.keys(classroomOptions).map((buildingKey) => (
              <option key={buildingKey} value={buildingKey}>
                {buildingKey}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Classroom Number:</label>
          <select
            value={classroomNumber}
            onChange={(e) => setClassroomNumber(e.target.value)}
            disabled={!building}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Classroom</option>
            {building &&
              classroomOptions[building] &&
              classroomOptions[building].map((classroom) => (
                <option key={classroom} value={classroom}>
                  {classroom}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Booking Date:</label>
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "500px" }}
          defaultView="day"
          views={["day"]}
          date={bookingDate ? new Date(bookingDate) : new Date()}
          formats={{
            timeGutterFormat: "HH:mm",
            agendaTimeFormat: "HH:mm",
          }}
          toolbar={false}
        />
      </div>
    </div>
  );
};

export default ClassroomBookingCalendar;
