import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AlumniTable() {
  const [alumniData, setAlumniData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWorkExperience, setSelectedWorkExperience] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [batch, setBatch] = useState(23);

  useEffect(() => {
    fetchAlumniData();
  }, [batch]);

  const fetchAlumniData = async () => {
    try {
      // Updated endpoint to match backend routes
      const response = await axios.get("/api/v1/alumni/all", {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          // If you're using token in Authorization header
          'Authorization': `Bearer ${localStorage.getItem('token')}` // adjust based on how you store the token
        },
        params:{
          batch
        }
      });

      if (response.data.success) {
        setAlumniData(response.data.data);
      } else {
        setError("Failed to fetch alumni data.");
      }
    } catch (err) {
      console.error("Error fetching alumni data:", err.response?.data || err.message);
      setError(err.response?.data?.message || "An error occurred while fetching alumni data.");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkExperienceClick = (workExperience) => {
    setSelectedWorkExperience(workExperience);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedWorkExperience(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading alumni data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  if (alumniData.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No alumni records found.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-center text-3xl font-bold mb-8">Alumni Records</h1>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                S.no.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Batch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Work Experience
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alumniData.map((alumni, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {alumni.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {alumni.batch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {alumni.program}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {alumni.branch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {/* Updated to use workExperiences instead of workExperience */}
                  {alumni.workExperiences?.length === 0 ? (
                    <span className="text-gray-500">No work experience</span>
                  ) : (
                    alumni.workExperiences?.map((work, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleWorkExperienceClick(work)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md m-1 hover:bg-blue-700 transition-colors"
                      >
                        {work.company}
                      </button>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal for Work Experience Details */}
        {showModal && selectedWorkExperience && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Work Experience Details</h2>
              <div className="space-y-3">
                <p>
                  <span className="font-bold">Company:</span>{" "}
                  {selectedWorkExperience.company}
                </p>
                <p>
                  <span className="font-bold">Role:</span>{" "}
                  {selectedWorkExperience.role}
                </p>
                <p>
                  <span className="font-bold">Start Date:</span>{" "}
                  {new Date(selectedWorkExperience.startDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-bold">End Date:</span>{" "}
                  {/* Updated to use isCurrentlyWorking instead of currentlyWorking */}
                  {selectedWorkExperience.isCurrentlyWorking
                    ? "Present"
                    : selectedWorkExperience.endDate
                      ? new Date(selectedWorkExperience.endDate).toLocaleDateString()
                      : "N/A"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// Saquib