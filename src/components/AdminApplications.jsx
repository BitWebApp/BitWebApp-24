import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScrollToTop from './ScrollToTop';
const api = axios.create({
    baseURL: '/api/v1/profProject',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    }
  });

const AdminApplications = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [applications, setApplications] = useState([]);

  const fetchApplications = async (status) => {
    try {
      const res = await api.get(`/projects/${projectId}/applications/status/${status}`);
      setApplications(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchApplications(status);
  }, [status, projectId]);

  return (
    <div className="container mx-auto p-6">
      <ScrollToTop />
      <button
        onClick={() => navigate("/faculty-db/adhoc-projects-dashboard")}
        className="mb-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
      >
        Back
      </button>
      <h1 className="text-2xl font-bold mb-6">
        Applications ({status.charAt(0).toUpperCase() + status.slice(1)})
      </h1>
      <div className="mb-6">
        <label htmlFor="status" className="block text-gray-700 font-semibold mb-2">
          Filter by Status:
        </label>
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
      {applications && applications.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <li key={app._id} className="border p-4 rounded hover:shadow-lg transition">
              <div className="mb-2">
                <span className="font-semibold">Student:</span>{" "}
                {app.studentId?.fullName || "N/A"} ({app.studentId?.email || "N/A"})
              </div>
              <div className="mb-2">
                <span className="font-semibold">Project:</span>{" "}
                {app.projectId?.title || "N/A"}
              </div>
              <div className="mb-4">
                <span className="font-semibold">Status:</span>
                <span className={`ml-2 text-${app.status === 'accepted' ? 'green' : app.status === 'rejected' ? 'red' : 'yellow'}-600 capitalize`}>
                  {app.status || "N/A"}
                </span>
              </div>
              <Link
                to={`/faculty-db/adhoc-project-applications/status/${projectId}/${app._id}`}
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                View Details
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">
          No applications found for "{status}" status.
        </p>
      )}
    </div>
  );
};

export default AdminApplications;