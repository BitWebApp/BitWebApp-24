import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

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
    <div>
      <h2>Classroom Booking Calendar</h2>
      <div>
        <label>
          Building:
          <input
            type="text"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
          />
        </label>

        <label>
          Classroom Number:
          <input
            type="text"
            value={classroomNumber}
            onChange={(e) => setClassroomNumber(e.target.value)}
          />
        </label>

        <label>
          Booking Date:
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
        </label>
      </div>
      <div style={{ height: "500px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          defaultView="day"
          views={["day"]}
          date={bookingDate ? new Date(bookingDate) : new Date()}
          formats={{
            timeGutterFormat: "HH:mm",
            agendaTimeFormat: "HH:mm",
          }}
        />
      </div>
    </div>
  );
};

export default ClassroomBookingCalendar;
