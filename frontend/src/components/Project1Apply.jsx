import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { getStudentYear } from "../utils/studentYear";

const handleError = (error, defaultMessage) => {
  let message =
    error.response?.data?.message || defaultMessage || "An error occurred";
  toast.error(message);
};

const Project1Apply = () => {
  const [project1, setProject1] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [appliedProfessors, setAppliedProfessors] = useState([]);
  const [denied, setDenied] = useState([]);
  const [allocatedProf, setAllocatedProf] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [selectedProf, setSelectedProf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discussionLogs, setDiscussionLogs] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/v1/users/get-user");
        setCurrentUser(response.data.data);
      } catch (error) {
        // Handle silently
      }
    };
    fetchUser();
  }, []);

  const fetchProject1 = async () => {
    try {
      const response = await axios.get("/api/v1/project1/get-project1");
      setProject1(response.data.data);
    } catch (error) {
      setProject1(null);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allProfsResponse, appliedProfsResponse] = await Promise.all([
        axios.get("/api/v1/prof/getProf"),
        axios.get("/api/v1/project1/get-app-profs"),
      ]);
      const { isAllocated, prof, appliedProfs, denied } =
        appliedProfsResponse?.data?.data || {};

      const sortedProfessors = allProfsResponse.data.message
        .filter((prof) => {
          const total = prof.limits?.project1 || 0;
          const current = prof.currentCount?.project1 || 0;
          return total - current >= 0;
        })
        .sort((a, b) => {
          const totalA = a.limits?.project1 || 0;
          const currentA = a.currentCount?.project1 || 0;
          const totalB = b.limits?.project1 || 0;
          const currentB = b.currentCount?.project1 || 0;
          return totalB - currentB - (totalA - currentA);
        });

      setAppliedProfessors(appliedProfs || []);
      setDenied(denied || []);
      if (isAllocated && prof) setAllocatedProf(prof);
      setProfessors(sortedProfessors);
      setFilteredProfessors(sortedProfessors);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      // Only show error if project1 exists (otherwise we haven't created yet)
      if (project1) handleError(error);
    }
  };

  useEffect(() => {
    fetchProject1();
  }, []);

  useEffect(() => {
    if (project1) {
      fetchData();
    }
  }, [project1]);



  const handleViewDetails = async () => {
    if (allocatedProf) {
      try {
        setLoading(true);
        const response = await axios.get("/api/v1/project1/get-disc-student");
        setDiscussionLogs(response.data.data);
        setShowLogs(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        handleError(error, "Failed to fetch discussion logs");
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedProf) {
      Swal.fire({
        icon: "error",
        title: "No Selection",
        text: "Please select a professor to apply.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/v1/project1/apply-faculty", {
        facultyId: selectedProf,
      });
      setLoading(false);
      await fetchData();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Applied successfully",
        confirmButtonColor: "#10b981",
      });
      setSelectedProf(null);
    } catch (error) {
      setLoading(false);
      let errorMessage = error.response?.data?.message;
      Swal.fire({
        icon: "error",
        title: "Application Failed",
        text: errorMessage || "Failed to apply. Try again.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleWithdraw = async () => {
    Swal.fire({
      title: "Withdraw All Preferences?",
      text: "This will remove all your applications and reset your preferences. You will need to apply again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Withdraw All",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await axios.post("/api/v1/project1/withdraw-preferences");
          await fetchData();
          Swal.fire({
            icon: "success",
            title: "Withdrawn",
            text: "All your preferences have been reset successfully.",
            confirmButtonColor: "#10b981",
          });
        } catch (error) {
          handleError(error, "Failed to withdraw preferences");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSearchAndFilter = () => {
    let filtered = professors;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (prof) =>
          prof.fullName.toLowerCase().includes(query) ||
          prof.idNumber.toLowerCase().includes(query)
      );
    }

    if (filterOption === "available") {
      filtered = filtered.filter((prof) => {
        const availableSeats =
          (prof.limits?.project1 || 0) - (prof.currentCount?.project1 || 0);
        return availableSeats > 0;
      });
    } else if (filterOption === "applied") {
      filtered = filtered.filter((prof) =>
        appliedProfessors.includes(prof._id)
      );
      filtered.sort((a, b) => {
        const prefA = appliedProfessors.indexOf(a._id);
        const prefB = appliedProfessors.indexOf(b._id);
        return prefA - prefB;
      });
    }

    setFilteredProfessors(filtered);
  };

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchQuery, filterOption, professors, appliedProfessors]);

  // No project1 record yet — show create button or blocked message based on year
  if (!project1) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const studentYear = getStudentYear(user?.batch);
    const isEligible = studentYear === 3;

    return (
      <>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold">Project 1</h1>
                <p className="text-purple-100 mt-1">
                  3rd Year Project Application
                </p>
              </div>
              <div className="p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  {isEligible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                {isEligible ? (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">
                      Group Required
                    </h2>
                    <p className="text-gray-600 mb-6">
                      You need to create or join a Project 1 group before you can apply to professors.
                    </p>
                    <a
                      href="/db/project1-group"
                      className="inline-block px-8 py-3 rounded-lg font-medium text-white shadow-md transition-all bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
                    >
                      Manage Group
                    </a>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">
                      Not Applicable
                    </h2>
                    <p className="text-gray-600 mb-6">
                      This feature is only available for 3rd year students.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {allocatedProf ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Project 1 Allocation
                </h1>
                <p className="text-green-100 mt-1">
                  Your Project 1 details
                </p>
              </div>
              <div className="p-8">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold mb-4 text-gray-900">
                    Congratulations!
                  </h1>
                  <p className="text-xl mb-6 text-gray-700">
                    Your Project 1 has been successfully allocated under
                  </p>
                  <div className="bg-gray-100 rounded-lg p-4 inline-block">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {allocatedProf?.fullName}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Professor ID: {allocatedProf?.idNumber}
                    </p>
                  </div>
                  <div className="mt-8">
                    <button
                      onClick={handleViewDetails}
                      className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {loading ? "Loading..." : "View Discussion Logs"}
                    </button>
                  </div>
                </div>

                {showLogs && discussionLogs && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">
                      Discussion Logs
                    </h3>
                    {discussionLogs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Absentees
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Remark
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {discussionLogs.map((log, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Intl.DateTimeFormat("en-IN", {
                                    timeZone: "Asia/Kolkata",
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  }).format(new Date(log.date))}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {log.description || "No description"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.absent?.length > 0 && (
                                    <p className="text-gray-700 mt-1">
                                      <span className="font-medium">
                                        Absentees:
                                      </span>{" "}
                                      {log.absent
                                        .map((a) => a.fullName)
                                        .join(", ")}
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {log.remark || "No remark"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No discussion logs available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Project 1 Application
                </h1>
                <p className="text-purple-100 mt-1">
                  Select a professor for your Project 1 mentorship
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {!project1.leader || !currentUser || project1.leader._id !== currentUser._id ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Only the group leader ({project1.leader?.fullName}) can apply to faculty or withdraw preferences.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="search"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Search Professors
                    </label>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search by name or ID..."
                      onChange={(e) => setSearchQuery(e.target.value)}
                      value={searchQuery}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="filter"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Filter by Availability
                    </label>
                    <select
                      id="filter"
                      onChange={(e) => setFilterOption(e.target.value)}
                      value={filterOption}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Professors</option>
                      <option value="available">Available Seats Only</option>
                      <option value="applied">Applied Professors</option>
                    </select>
                  </div>
                </div>

                {/* Professors Table */}
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Professor
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Seats
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProfessors.map((prof) => {
                          const seatsAvailable =
                            (prof.limits?.project1 || 0) -
                            (prof.currentCount?.project1 || 0);
                          const appliedIndex = appliedProfessors.findIndex(
                            (id) => id === prof._id
                          );
                          const isApplied = appliedIndex !== -1;
                          const isDenied = denied.includes(prof._id);
                          const isDisabled =
                            isApplied ||
                            allocatedProf?._id === prof._id ||
                            seatsAvailable <= 0 ||
                            isDenied;

                          const statusConfig = {
                            denied: {
                              text: "Denied",
                              color: "bg-red-100 text-red-800",
                              icon: "❌",
                            },
                            applied: {
                              text: `Applied (Pref ${appliedIndex + 1})`,
                              color: "bg-green-100 text-green-800",
                              icon: "✅",
                            },
                            full: {
                              text: "No Seats",
                              color: "bg-gray-100 text-gray-800",
                              icon: "❌",
                            },
                            limited: {
                              text: "High Demand",
                              color: "bg-yellow-100 text-yellow-800",
                              icon: "⚠️",
                            },
                            available: {
                              text: "Available",
                              color: "bg-blue-100 text-blue-800",
                              icon: "✅",
                            },
                          };

                          let status;
                          if (isDenied) status = statusConfig.denied;
                          else if (isApplied) status = statusConfig.applied;
                          else if (seatsAvailable <= 0)
                            status = statusConfig.full;
                          else if (seatsAvailable < 3)
                            status = statusConfig.limited;
                          else status = statusConfig.available;

                          return (
                            <tr
                              key={prof._id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-medium">
                                      {prof.fullName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {prof.fullName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {prof.idNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div
                                      className={`h-2.5 rounded-full ${
                                        seatsAvailable <= 0
                                          ? "bg-red-500"
                                          : seatsAvailable < 3
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                      }`}
                                      style={{
                                        width: `${
                                          (seatsAvailable /
                                            (prof.limits?.project1 || 1)) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {seatsAvailable}/
                                    {prof.limits?.project1 || 0}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}
                                >
                                  {status.icon} {status.text}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <input
                                  type="radio"
                                  name="professor"
                                  disabled={isDisabled || !project1.leader || !currentUser || project1.leader._id !== currentUser._id}
                                  checked={selectedProf === prof._id}
                                  onChange={() => setSelectedProf(prof._id)}
                                  className={`h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 ${
                                    isDisabled || !project1.leader || !currentUser || project1.leader._id !== currentUser._id
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Empty State */}
                {filteredProfessors.length === 0 && (
                  <div className="text-center py-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No professors found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}

                {/* Submit Button & Withdraw */}
                {project1.leader && currentUser && project1.leader._id === currentUser._id && (
                  <div className="mt-8 flex flex-col md:flex-row gap-4">
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !selectedProf}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all ${
                        loading || !selectedProf
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Applying...
                        </span>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                    {appliedProfessors.length > 0 && (
                      <button
                        onClick={handleWithdraw}
                        disabled={loading}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {loading ? "Processing..." : "Withdraw All Preferences"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Project1Apply;
