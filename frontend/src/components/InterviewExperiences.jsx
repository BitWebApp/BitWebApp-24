import React, { useEffect, useState } from "react";
import axios from "axios";

const InterviewExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [companyFilter, setCompanyFilter] = useState("");
  const [companies, setCompanies] = useState([]); // List of all companies
  const limit = 10;

  const fetchInterviewExperiences = async (currentPage, company) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/v1/users/interview-experiences`, {
        params: {
          page: currentPage,
          limit,
          companyName: company || undefined,
        },
      });
      setExperiences(response.data.data.interviewExps);
      setTotalRecords(response.data.data.totalRecords);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("/api/v1/companies");
      setCompanies(response.data.data); // Assume the API returns a list of companies
    } catch (err) {
      console.error("Failed to fetch companies", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchInterviewExperiences(page, companyFilter);
  }, [page, companyFilter]);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-500">
        Placement Interview Experiences
      </h1>

      <div className="flex justify-between items-center mb-6">
        <div>
          <label htmlFor="companyFilter" className="block text-sm font-medium">
            Filter by Company
          </label>
          <select
            id="companyFilter"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-64 mt-1 block rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.name}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-600">
          Showing {experiences.length} of {totalRecords} results
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
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
