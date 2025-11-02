import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import ChatBox from "./ChatBox";

const handleError = (error, defaultMessage) => {

  let message =
    error.response?.data?.message || defaultMessage || "An error occurred";
  toast.error(message);
};

const MajorProject = () => {
  const [group, setGroup] = useState(null);
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
  const [showChat, setShowChat] = useState(false);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/major/get-group");
      setGroup(response.data.data.groupId);
    } catch (error) {
      setGroup(null);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allProfsResponse, appliedProfsResponse] = await Promise.all([
        axios.get("/api/v1/prof/getProf"),
        axios.get("/api/v1/major/get-app-profs"),
      ]);
      const { ismajorAllocated, prof, majorAppliedProfs, denied } =
        appliedProfsResponse?.data?.data || {};

      const sortedProfessors = allProfsResponse.data.message
        .filter((prof) => {
          const availableSeats =
            prof.limits.major_project - prof.currentCount.major_project;
          return availableSeats >= 0;
        })
        .sort((a, b) => {
          const seatsA =
            a.limits.major_project - a.currentCount.major_project;
          const seatsB =
            b.limits.major_project - b.currentCount.major_project;
          return seatsB - seatsA;
        });

      setAppliedProfessors(majorAppliedProfs);
      setDenied(denied || []);
      if (ismajorAllocated && prof) setAllocatedProf(prof);
      setProfessors(sortedProfessors);
      setFilteredProfessors(sortedProfessors);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchGroup();
  }, []);

  const handleViewDetails = async () => {
    if (allocatedProf) {
      try {
        setLoading(true);
        const response = await axios.post("/api/v1/major/get-disc-student");

        setDiscussionLogs(response.data.data);
        setShowLogs(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        handleError(error, "Failed to fetch discussion logs");
      }
    } else {
      window.location.reload();
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
      await axios.post("/api/v1/major/apply-faculty", {
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

  const handleSearchAndFilter = () => {
    let filtered = professors;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (prof) =>
          prof.fullName.toLowerCase().includes(query) ||
          prof.idNumber.toLowerCase().includes(query)
      );
    }

    // Apply availability filter
    if (filterOption !== "all") {
      filtered = filtered.filter((prof) => {
        const availableSeats =
          prof.limits.major_project - prof.currentCount.major_project;
        return filterOption === "available"
          ? availableSeats > 0
          : availableSeats === 0;
      });
    }

    setFilteredProfessors(filtered);
  };

  // Call this function whenever the search query or filter option changes
  useEffect(() => {
    handleSearchAndFilter();
  }, [searchQuery, filterOption, professors]);

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {allocatedProf ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Major Project Allocation
                </h1>
                <p className="text-green-100 mt-1">
                  Your major project details
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
                    Your major project has been successfully allocated under
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
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="ml-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {showChat ? "Hide Chat" : "Show Chat"}
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
                {showChat && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">
                      Chat
                    </h3>
                    <ChatBox groupId={group ? group : "research-chat"} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Major Project Application
                </h1>
                <p className="text-blue-100 mt-1">
                  Select a professor for your major project
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            prof.limits.major_project -
                            prof.currentCount.major_project;
                          const appliedIndex = appliedProfessors.findIndex(
                            (id) => id === prof._id
                          );
                          const isApplied = appliedIndex !== -1;
                          console.log(prof._id)
                          const isDenied = denied.includes(prof._id);
                          const isDisabled =
                            isApplied ||
                            allocatedProf?._id === prof._id ||
                            seatsAvailable === 0 ||
                            isDenied;
                          console.log(isDisabled)
                          const statusConfig = {
                            denied: {
                              text: "Denied",
                              color: "bg-red-100 text-red-800",
                              icon: "❌",
                            },
                            applied: {
                              text: `Applied (Pref ${appliedIndex + 1})`, // Show preference number
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
                            intern: {
                              text: "Only Industrial Interns can apply",
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
                          else if (seatsAvailable === 0)
                            status = statusConfig.full;
                          else if (seatsAvailable == 1)
                            status = statusConfig.intern;
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
                                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-medium">
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
                                    <div className="text-sm text-gray-500">
                                      {prof.department}
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
                                        seatsAvailable === 0
                                          ? "bg-red-500"
                                          : seatsAvailable < 3
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                      }`}
                                      style={{
                                        width: `${
                                          (seatsAvailable /
                                            prof.limits.major_project) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {seatsAvailable}/
                                    {prof.limits.major_project}
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
                                  disabled={isDisabled}
                                  checked={selectedProf === prof._id}
                                  onChange={() => setSelectedProf(prof._id)}
                                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                                    isDisabled
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

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedProf}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all ${
                      loading || !selectedProf
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MajorProject;
