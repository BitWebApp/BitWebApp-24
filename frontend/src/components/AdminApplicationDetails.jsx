import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScrollToTop from './ScrollToTop';

const api = axios.create({
    baseURL: '/api/v1/profProject',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    }
  });

const AdminApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/applications/${applicationId}`);
        console.log(res.data.data);
        setApplication(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchApplication();
  }, [applicationId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/applications/${applicationId}`, { status: newStatus });
      navigate('/faculty-db/adhoc-project-applications');
    } catch (err) {
      console.error(err);
    }
  };

  if (!application) return <div>Loading...</div>;

  const { studentId, projectId, doc, status } = application;

  return (
    <div className="container mx-auto p-6">
      <ScrollToTop />
      <h2 className="text-2xl font-bold mb-6">Application Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Student Name:</label>
          <p className="text-gray-900">{studentId?.fullName}</p> {/* Changed from name to fullName */}
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Student Email:</label>
          <p className="text-gray-900">{studentId?.email}</p>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Project Title:</label>
          <p className="text-gray-900">{projectId?.title}</p>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Project Duration:</label>
          <p className="text-gray-900">{`${projectId?.startDate?.split('T')[0]} to ${projectId?.endDate?.split('T')[0]}`}</p>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Status:</label>
          <p className={`text-${status === 'accepted' ? 'green' : status === 'rejected' ? 'red' : 'yellow'}-600 capitalize`}>
            {status}
          </p>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-2">Attached Files:</h4>
        <ul className="list-disc list-inside">
          {doc?.map((fileUrl, idx) => (
            <li key={idx}>
              <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                {fileUrl}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {status === 'pending' && (
        <div className="mt-6 flex space-x-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            onClick={() => handleStatusChange('accepted')}
          >
            Accept
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            onClick={() => handleStatusChange('rejected')}
          >
            Reject
          </button>
        </div>
      )}
      <button
        onClick={() => navigate('/faculty-db/adhoc-project-applications')}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Back to Applications
      </button>
    </div>
  );
};

export default AdminApplicationDetails;