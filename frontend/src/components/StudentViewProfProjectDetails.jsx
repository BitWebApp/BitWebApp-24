import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StudentApplyProject from "./StudentApplyProject";

const api = axios.create({
  baseURL: "/api/v1/profProject",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

const StudentViewProfProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/db/student-projects-dashboard")}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
      >
        Back
      </button>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6">{project.title}</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-gray-700">{project.desc}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Professor Name</h2>
            <p className="text-gray-700">{project.profName}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Professor Email</h2>
            <a 
              href={`mailto:${project.profEmail}`} 
              className="list-disc list-inside text-blue-500"
            >
              {project.profEmail}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold">Start Date</h2>
              <p className="text-gray-700">{new Date(project.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">End Date</h2>
              <p className="text-gray-700">{new Date(project.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Categories</h2>
            {project.categories && project.categories.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700">
                {project.categories.map((category, index) => (
                  <li key={index}>{category}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No categories available</p>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Relevant Links</h2>
            {project.relevantLinks && project.relevantLinks.length > 0 ? (
              <ul className="list-disc list-inside text-blue-500">
                {project.relevantLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={/^https?:\/\//.test(link) ? link : `http://${link}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No relevant links available</p>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Documents</h2>
            {project.doc && project.doc.length > 0 ? (
              <ul className="list-disc list-inside text-blue-500">
                {project.doc.map((doc, index) => (
                  <li key={index}>
                    <a href={doc} target="_blank" rel="noopener noreferrer">
                      {`Document No. ${index + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No documents uploaded</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Status</h2>
            <p
              className={`text-sm px-3 py-1 inline-block rounded ${
                project.closed ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {project.closed ? 'Closed' : 'Open'}
            </p>
          </div>

          {!project.closed && (
            <div className="mt-8">
              <StudentApplyProject project={project} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentViewProfProjectDetails;
