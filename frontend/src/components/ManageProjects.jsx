// ManageProjects.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState('pending');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/v1/projects/summary');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error.message);
    }
  };

  // Fetch Applications by Status
  const fetchApplications = async (status, projectId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/applications/${status}/${projectId}`);
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Application Status Change
  const handleApplicationStatusChange = async (applicationId, status) => {
    try {
      await axios.put(`/api/v1/applications/${applicationId}`, { status });
      toast.success('Application status updated successfully!');
      fetchApplications(applicationStatus, applications.projectId); // Refetch to update applications
    } catch (error) {
      console.error('Error updating application status:', error.message);
      toast.error('Error updating application status');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchApplications(applicationStatus, projects[0]._id); // Fetch applications for the first project by default
    }
  }, [applicationStatus, projects]);

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Manage Applications</h2>
        
        {/* Project Selection Dropdown */}
        <select
          value={applicationStatus}
          onChange={(e) => setApplicationStatus(e.target.value)}
          className="mb-4 p-2 border rounded"
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Applications for the selected project and status */}
        <div>
          {loading ? (
            <p>Loading applications...</p>
          ) : (
            applications.map((application) => (
              <div key={application._id} className="mb-4 p-4 border rounded">
                <h4 className="font-bold">{application.studentId.fullName}</h4>
                <p>{application.studentId.email}</p>
                <p>
                  <strong>Status:</strong> {application.status}
                </p>
                <button
                  className="bg-green-500 text-white py-1 px-2 rounded mr-2"
                  onClick={() => handleApplicationStatusChange(application._id, 'accepted')}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white py-1 px-2 rounded"
                  onClick={() => handleApplicationStatusChange(application._id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProjects;
