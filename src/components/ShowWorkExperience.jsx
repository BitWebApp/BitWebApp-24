import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

export default function ShowWorkExperience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axios.get("/api/v1/alumni/work-experience", {
          withCredentials: true
        });
        setExperiences(response.data.data);
      } catch (error) {
        console.error("Failed to fetch work experiences:", error);
        setError(error.response?.data?.message || "Failed to fetch work experiences");
        Swal.fire("Error!", "Failed to fetch work experiences", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ClipLoader size={50} color="#4F46E5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Work Experiences</h2>
      
      {experiences.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No work experiences added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-lg text-gray-800">{exp.company}</h3>
              <p className="text-gray-600 mt-1">{exp.role}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>
                  {new Date(exp.startDate).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })} 
                  {" - "}
                  {exp.isCurrentlyWorking ? 
                    "Present" : 
                    new Date(exp.endDate).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}