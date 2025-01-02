import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminRoomRequests = () => {
    const [roomRequests, setRoomRequests] = useState([]);
    const [bookedRooms, setBookedRooms] = useState([]);
    const [rejectedRooms, setRejectedRooms] = useState([]);
    const [showRejected, setShowRejected] = useState(false);
    const [showBooked, setShowBooked] = useState(false);
    
    function formatReadableDate(isoDate) {
        const date = new Date(isoDate);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    // Fetch all room requests (Pending status)
    useEffect(() => {
        const fetchRoomRequests = async () => {
            try {
                const response = await axios.get('/api/v1/classroom/bookings/pending',{ withCredentials: true });
                console.log("fetch data is",response.data);
                if (response.data && response.data) {
                    // Fetch student names from populated data
                    const sortedData = response.data.sort((a, b) => {
                        const dateA = new Date(a.bookingDate + ' ' + a.startTime);
                        const dateB = new Date(b.bookingDate + ' ' + b.startTime);
                        return dateB - dateA; // Descending order
                    });
                    console.log("sorted data is",sortedData);
                    setRoomRequests(sortedData);
                }
            } catch (error) {
                console.error('Error fetching room requests:', error);
            }
        };

        fetchRoomRequests();
    }, []);

    // Handle Approve
    const handleApprove = async (request) => {
        try {
            await axios.put(`/api/v1/classroom/bookings/${request._id}/approve`);
            setBookedRooms([...bookedRooms, { ...request, status: 'Approved' }]);
            setRoomRequests(roomRequests.filter((r) => r._id !== request._id));
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    // Handle Reject
    const handleReject = async (request) => {
        try {
            await axios.put(`/api/v1/classroom/bookings/${request._id}/reject`);
            setRejectedRooms([...rejectedRooms, { ...request, status: 'Rejected' }]);
            setRoomRequests(roomRequests.filter((r) => r._id !== request._id));
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };
    
    // console.log("roomrequest is",roomRequests)
    // Render table rows dynamically
    const renderTableRows = (data) => {
        return data.map((request) => (
            <tr key={request._id} className="hover:bg-gray-100">
                <td className="px-4 py-2">{request.student?.fullName || 'N/A'}</td>
                <td className="px-4 py-2">{request.rollNumber}</td>
                <td className="px-4 py-2">{request.building}</td>
                <td className="px-4 py-2">{request.classroomNumber}</td>
                <td className="px-4 py-2">{formatReadableDate(request.bookingDate)}</td>
                <td className="px-4 py-2">{request.startTime}</td>
                <td className="px-4 py-2">{request.endTime}</td>
                <td className="px-4 py-2 max-w-xs overflow-auto">{request.purpose}</td>
                {!showRejected && !showBooked && (
                    <td className="px-4 py-2 flex space-x-2">
                        <button
                            onClick={() => handleApprove(request)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleReject(request)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                            Reject
                        </button>
                    </td>
                )}
            </tr>
        ));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Admin Room Requests</h1>

            {/* Show Room Requests Table */}
            {!showRejected && !showBooked && (
                <>
                    <table className="min-w-full table-auto border-collapse border border-gray-300 mb-4">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border px-4 py-2">Student Name</th>
                                <th className="border px-4 py-2">Roll Number</th>
                                <th className="border px-4 py-2">Building</th>
                                <th className="border px-4 py-2">Classroom</th>
                                <th className="border px-4 py-2">Booking Date</th>
                                <th className="border px-4 py-2">Start Time</th>
                                <th className="border px-4 py-2">End Time</th>
                                <th className="border px-4 py-2">Purpose</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>{renderTableRows(roomRequests)}</tbody>
                    </table>
                </>
            )}

            {/* Show Rejected Table */}
            {showRejected && (
                <>
                    <h2 className="text-2xl font-semibold mb-4">Rejected Permissions</h2>
                    <table className="min-w-full table-auto border-collapse border border-gray-300 mb-4">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border px-4 py-2">Student Name</th>
                                <th className="border px-4 py-2">Roll Number</th>
                                <th className="border px-4 py-2">Building</th>
                                <th className="border px-4 py-2">Classroom</th>
                                <th className="border px-4 py-2">Booking Date</th>
                                <th className="border px-4 py-2">Start Time</th>
                                <th className="border px-4 py-2">End Time</th>
                                <th className="border px-4 py-2">Purpose</th>
                            </tr>
                        </thead>
                        <tbody>{renderTableRows(rejectedRooms)}</tbody>
                    </table>
                </>
            )}

            {/* Show Booked Rooms Table */}
            {showBooked && (
                <>
                    <h2 className="text-2xl font-semibold mb-4">All Booked Rooms</h2>
                    <table className="min-w-full table-auto border-collapse border border-gray-300 mb-4">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border px-4 py-2">Student Name</th>
                                <th className="border px-4 py-2">Roll Number</th>
                                <th className="border px-4 py-2">Building</th>
                                <th className="border px-4 py-2">Classroom</th>
                                <th className="border px-4 py-2">Booking Date</th>
                                <th className="border px-4 py-2">Start Time</th>
                                <th className="border px-4 py-2">End Time</th>
                                <th className="border px-4 py-2">Purpose</th>
                            </tr>
                        </thead>
                        <tbody>{renderTableRows(bookedRooms)}</tbody>
                    </table>
                </>
            )}

            {/* Buttons */}
            <div className="flex space-x-4 mt-4">
                <button
                    onClick={() => {
                        setShowRejected(false);
                        setShowBooked(false);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Show Pending Requests
                </button>
                <button
                    onClick={() => {
                        setShowRejected(true);
                        setShowBooked(false);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Show Rejected Permissions
                </button>
                <button
                    onClick={() => {
                        setShowRejected(false);
                        setShowBooked(true);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Show All Booked Rooms
                </button>
            </div>
        </div>
    );
};

export default AdminRoomRequests;
