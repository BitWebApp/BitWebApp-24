import React, { useEffect, useState } from "react";
import axios from "axios";

const InterviewExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  const fetchInterviewExperiences = async (currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/v1/users/interview-experiences`, {
        params: {
          page: currentPage,
          limit,
        },
      });
      setExperiences(response.data.data.interviewExps);
      setTotalRecords(response.data.data.totalRecords);
    } catch (err) {
      if (err.response?.status == 429) {
        setError(
          "You have reached the maximum number of viewing experience!  Plz try again after 15 mins"
        );
      } else {
        setError(err.response?.data?.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewExperiences(page);
  }, [page]);

  const handleNextPage = () => {
    if (page < Math.ceil(totalRecords / limit)) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Interview Experiences
      </h1>
      {experiences.length === 0 ? (
        <p className="text-center text-gray-500">
          No interview experiences found.
        </p>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {exp.company.companyName}
                </h3>
                <h3 className="text-xl font-semibold text-gray-800">
                  {exp.role}
                </h3>
                <h3 className="text-xl font-semibold text-gray-800">
                  {exp.student.fullName}
                </h3>
                <p className="text-gray-600 mt-1">{exp.company.name}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium text-gray-800">
                      {exp.interviewYear}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">CGPA</p>
                    <p className="font-medium text-gray-800">{exp.cgpa}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">CTC</p>
                    <p className="font-medium text-gray-800">{exp.ctc}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Stipend</p>
                    <p className="font-medium text-gray-800">{exp.stipend}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Experience</h4>
                  <ul className="space-y-2 list-disc pl-4">
                    {exp.experience.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {exp.referenceMaterialLinks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">
                      Reference Links
                    </h4>
                    <ul className="space-y-2">
                      {exp.referenceMaterialLinks.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            {link.length > 40
                              ? link.substring(0, 40) + "..."
                              : link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md border ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              } transition-colors duration-200`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {Math.ceil(totalRecords / limit)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page >= Math.ceil(totalRecords / limit)}
              className={`px-4 py-2 rounded-md border ${
                page >= Math.ceil(totalRecords / limit)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              } transition-colors duration-200`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewExperiences;
