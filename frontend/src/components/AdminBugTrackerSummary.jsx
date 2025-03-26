import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminBugTrackerSummary = () => {
  const [bugs, setBugs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    axios.get('/api/v1/tracker/bugs', { params: { status: filterStatus } })
      .then(res => setBugs(res.data))
      .catch(err => {
          toast.error(err.response?.data?.message || "Failed to load bugs");
          console.error(err);
      });
  }, [filterStatus]);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Bug Tracker Summary</h2>
      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by Status:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded p-2"
        >
          <option value="All">All</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bugs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No bugs found.
                </td>
              </tr>
            ) : (
              bugs.map(bug => (
                <tr key={bug._id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap">{bug.reporter.id?.fullName || bug.reporter.kind}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bug.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bug.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/admin-db/bug-tracker/${bug._id}`} className="text-blue-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminBugTrackerSummary;
