import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Research = () => {
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [appliedProfessors, setAppliedProfessors] = useState([]);
  const [allocatedProf, setAllocatedProf] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [selectedProfs, setSelectedProfs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        setLoading(true);
        const [allProfsResponse, appliedProfsResponse] = await Promise.all([
          axios.get("/api/v1/prof/getProf"),
          axios.get("/api/v1/users/get-app-profs"),
        ]);

        const { summerAppliedProfs, isSummerAllocated, prof } =
          appliedProfsResponse?.data?.data || {};

        // Sort professors by seat availability
        const sortedProfessors = allProfsResponse.data.message.sort((a, b) => {
          const seatsA = a.limits.summer_training - a.currentCount.summer_training;
          const seatsB = b.limits.summer_training - b.currentCount.summer_training;
          return seatsB - seatsA;
        });

        setAppliedProfessors(summerAppliedProfs.map((prof) => prof._id));
        if (isSummerAllocated && prof) setAllocatedProf(prof);
        setProfessors(sortedProfessors);
        setFilteredProfessors(sortedProfessors);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to fetch professors. Please try again later.",
        });
      }
    };
    fetchProfessors();
  }, []);

  useEffect(() => {
    let filtered = professors;
  
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((prof) =>
        prof.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.contact.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    // Apply seat availability filters
    if (filterOption === "highDemand") {
      filtered = filtered.filter((prof) =>
        prof.limits.summer_training - prof.currentCount.summer_training <= 2 &&
        prof.limits.summer_training - prof.currentCount.summer_training > 0
      );
    } else if (filterOption === "noSeats") {
      filtered = filtered.filter(
        (prof) => prof.limits.summer_training - prof.currentCount.summer_training === 0
      );
    } else if (filterOption === "available") {
      filtered = filtered.filter(
        (prof) => prof.limits.summer_training - prof.currentCount.summer_training > 2
      );
    }
  
    // Sorting logic: Accepted > Applied > Others
    filtered.sort((a, b) => {
      const isAllocatedA = allocatedProf?._id === a._id;
      const isAllocatedB = allocatedProf?._id === b._id;
  
      const isAppliedA = appliedProfessors.includes(a._id);
      const isAppliedB = appliedProfessors.includes(b._id);
  
      if (isAllocatedA && !isAllocatedB) return -1; // Accepted first
      if (!isAllocatedA && isAllocatedB) return 1;
  
      if (isAppliedA && !isAppliedB) return -1; // Applied next
      if (!isAppliedA && isAppliedB) return 1;
  
      return 0; // Others remain in their current order
    });
  
    setFilteredProfessors(filtered);
  }, [searchQuery, filterOption, professors, selectedProfs, appliedProfessors, allocatedProf]);
  

  const handleCheckboxChange = (profId) => {
    setSelectedProfs((prev) =>
      prev.includes(profId)
        ? prev.filter((id) => id !== profId)
        : [...prev, profId]
    );
  };

  const handleSubmit = async () => {
    if (selectedProfs.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Selection",
        text: "Please select at least one professor to apply.",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/v1/users/applyToSummer", { profIds: selectedProfs });
      setLoading(false);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Applied successfully",
      });
      setSelectedProfs([]);
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Application Failed",
        text: error.response?.data?.message || "Failed to apply. Try again.",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Apply for Summer Training</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search professors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="highDemand">High Demand</option>
          <option value="noSeats">No Seats</option>
          <option value="available">Available</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-4">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">ID No</th>
                <th className="border border-gray-300 px-4 py-2">Full Name</th>
                <th className="border border-gray-300 px-4 py-2">Contact</th>
                <th className="border border-gray-300 px-4 py-2">Seats Available</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessors.map((prof) => {
                const seatsAvailable =
                  prof.limits.summer_training - prof.currentCount.summer_training;
                const isApplied = appliedProfessors.includes(prof._id);
                const isAllocated = allocatedProf?._id === prof._id;
                const status = isAllocated
                  ? "Accepted"
                  : isApplied
                  ? "Applied"
                  : seatsAvailable === 0
                  ? "No Seats"
                  : seatsAvailable <= 2
                  ? "High Demand"
                  : `Available (${seatsAvailable} seats)`;

                return (
                  <tr key={prof._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {prof.idNumber}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {prof.fullName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {prof.contact}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {seatsAvailable}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-2 text-center font-bold text-white rounded-lg ${
                        isAllocated
                          ? "bg-purple-500"
                          : isApplied
                          ? "bg-blue-500"
                          : seatsAvailable === 0
                          ? "bg-red-500"
                          : seatsAvailable <= 2
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {status}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        id={prof._id}
                        disabled={isApplied || isAllocated || seatsAvailable === 0}
                        checked={selectedProfs.includes(prof._id)}
                        onChange={() => handleCheckboxChange(prof._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Applying..." : "Submit Applications"}
        </button>
      </div>
    </div>
  );
};

export default Research;
