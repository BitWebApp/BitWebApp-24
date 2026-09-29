import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FiChevronLeft, FiChevronRight, FiFilter, FiSearch, FiExternalLink } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InterviewExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const limit = 10;

  const fetchInterviewExperiences = useCallback(async (currentPage, company, role, search) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/v1/users/interview-experiences`, {
        params: {
          page: currentPage,
          limit,
          companyId: company || undefined,
          role: role || undefined,
          search: search || undefined,
        },
      });
      setExperiences(response.data.data.interviewExps);
      setTotalRecords(response.data.data.totalRecords);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load interview experiences");
      toast.error("Failed to load interview experiences");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("/api/v1/admin/get-companies");
      setCompanies(response.data.data);
    } catch (err) {
      console.error("Failed to fetch companies", err);
      toast.error("Failed to load company list");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("/api/v1/users/get-interview-roles");
      setRoles(response.data.data);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchInterviewExperiences(page, companyFilter, roleFilter, searchQuery);
  }, [page, companyFilter, roleFilter, searchQuery, fetchInterviewExperiences]);

  const handleNextPage = () => {
    if (page < Math.ceil(totalRecords / limit)) {
      setPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const toggleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Placement Interview Experiences
        </h1>
        <p className="text-lg text-gray-600">
          Learn from the experiences of your peers
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Company Filter */}
          <div>
            <label htmlFor="companyFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select
                id="companyFilter"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Roles</option>
                {roles.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setCompanyFilter("");
                setRoleFilter("");
                setSearchQuery("");
                setPage(1);
              }}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-600">
          Showing {experiences.length} of {totalRecords} results
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Items per page:</span>
          <select
            value={limit}
            disabled
            className="text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="10">10</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <ClipLoader color="#3B82F6" size={40} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Experiences List */}
      {!loading && !error && (
        <div className="space-y-6">
          {experiences.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No experiences found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          ) : (
            experiences.map((exp) => (
              <div
                key={exp._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${expandedCard === exp._id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => toggleExpandCard(exp._id)}
                >
                  <div className="px-6 py-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {exp.company.companyName}
                        </h3>
                        <p className="text-sm text-gray-500">{exp.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Posted by</p>
                        <p className="font-medium text-gray-900">
                          {exp.student.fullName}
                        </p>
                      </div>
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={exp.student.image || "/images/default-avatar.png"}
                        alt={exp.student.fullName}
                      />
                    </div>
                  </div>
                </div>

                {expandedCard === exp._id && (
                  <div className="p-6 space-y-6">
                    {/* Student Info */}
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Student Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Branch</p>
                            <p className="font-medium text-gray-800">
                              {exp.student.branch === "computer science and engineering" 
                                ? "CSE" 
                                : exp.student.branch === "artificial intelligence and machine learning" 
                                  ? "AIML" 
                                  : exp.student.branch}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">CGPA</p>
                            <p className="font-medium text-gray-800">{exp.student.cgpa}</p>
                          </div>
                        </div>
                        {exp.student.linkedin && (
                          <a
                            href={exp.student.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
                          >
                            <FaLinkedin className="mr-1" /> LinkedIn Profile
                          </a>
                        )}
                      </div>

                      {/* Interview Details */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Interview Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Year</p>
                            <p className="font-medium text-gray-800">{exp.interviewYear}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">CTC</p>
                            <p className="font-medium text-gray-800">{exp.ctc || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Stipend</p>
                            <p className="font-medium text-gray-800">{exp.stipend || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">CGPA Criteria</p>
                            <p className="font-medium text-gray-800">{exp.cgpa || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Experience */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Interview Process</h4>
                      <div className="space-y-4">
                        {exp.experience.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-blue-500 mr-3 mt-0.5">
                                {index + 1}.
                              </div>
                              <p className="text-gray-700 whitespace-pre-line">{item}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reference Materials */}
                    {exp.referenceMaterialLinks && exp.referenceMaterialLinks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Reference Materials</h4>
                        <ul className="space-y-2">
                          {exp.referenceMaterialLinks.filter(link => link).map((link, index) => (
                            <li key={index}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                              >
                                <FiExternalLink className="mr-1" /> Resource {index + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && experiences.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={page >= Math.ceil(totalRecords / limit)}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page >= Math.ceil(totalRecords / limit)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, totalRecords)}</span> of{' '}
                <span className="font-medium">{totalRecords}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {Array.from({ length: Math.min(5, Math.ceil(totalRecords / limit)) }, (_, i) => {
                  let pageNum;
                  if (Math.ceil(totalRecords / limit) <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= Math.ceil(totalRecords / limit) - 2) {
                    pageNum = Math.ceil(totalRecords / limit) - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={handleNextPage}
                  disabled={page >= Math.ceil(totalRecords / limit)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page >= Math.ceil(totalRecords / limit)
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewExperiences;