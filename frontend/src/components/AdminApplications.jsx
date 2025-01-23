import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ScrollToTop from './ScrollToTop';
const api = axios.create({
    baseURL: '/api/v1/profProject',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    }
  });

const AdminApplications = () => {
  const [status, setStatus] = useState('pending');
  const [applications, setApplications] = useState([]);

  const fetchApplications = async (status) => {
    try {
      const res = await api.get(`/applications/status/${status}`);
      setApplications(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchApplications(status);
  }, [status]);

  return (
    <div className="container mx-auto p-6">
      <ScrollToTop />
      <h1 className="text-2xl font-bold mb-6">Applications ({status.charAt(0).toUpperCase() + status.slice(1)})</h1>
      <div className="mb-6">
        <label htmlFor="status" className="block text-gray-700 font-semibold mb-2">Filter by Status:</label>
        <select
          id="status"
          className="border rounded p-2 w-full md:w-1/3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <li key={app._id} className="border p-4 rounded hover:shadow-lg transition">
            <div className="mb-2">
              <span className="font-semibold">Student:</span> {app.studentId?.fullName} ({app.studentId?.email}) {/* Changed from name to fullName */}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Project:</span> {app.projectId?.title} by {app.projectId?.profName} {/* Ensured projectId is populated */}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Status:</span>
              <span className={`ml-2 text-${app.status === 'accepted' ? 'green' : app.status === 'rejected' ? 'red' : 'yellow'}-600 capitalize`}>
                {app.status}
              </span>
            </div>
            <Link
              to={`/db/admin-applications/${app._id}`}
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              View Details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminApplications;