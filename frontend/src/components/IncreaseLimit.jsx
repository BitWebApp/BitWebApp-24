import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaChalkboardTeacher,
  FaPlusCircle,
  FaChevronDown,
} from "react-icons/fa";
import Swal from "sweetalert2";

const quotes = [
  "Great teachers inspire their students!",
  "A teacher's influence never stops!",
  "Education is the key to success!",
  "Teaching is the art of assisting discovery!",
  "Knowledge shared is knowledge multiplied!",
];

const IncreaseLimit = () => {
  const [professors, setProfessors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProf, setSelectedProf] = useState("");
  const [limit, setLimit] = useState("");
  const [type, setType] = useState(""); // ✅ Added state for type
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    fetchProfessors();

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProfessors = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/prof/getProf");
      if (data.success && Array.isArray(data.message)) {
        setProfessors(data.message);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Failed to fetch professors: " +
          (err.response?.data?.message || err.message),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProf || !limit || !type) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in all fields!",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/v1/prof/incrementLimit", {
        profId: selectedProf,
        limit: parseInt(limit),
        type, // ✅ Sending type in API request
      });

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Limit updated successfully!",
      });

      setLimit("");
      setType(""); // ✅ Reset type
      fetchProfessors();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Error updating limit: " +
          (err.response?.data?.message || err.message),
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProfessors = professors.filter(
    (prof) =>
      prof.fullName.toLowerCase().includes(search.toLowerCase()) ||
      prof.idNumber.includes(search)
  );

  const handleProfessorSelect = (prof) => {
    setSelectedProf(prof._id);
    setSearch(prof.fullName);
    setIsSearchFocused(false);
  };

  const getSelectedProfessor = () => {
    return professors.find((p) => p._id === selectedProf);
  };

  const selectedProfessor = getSelectedProfessor();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          <FaChalkboardTeacher className="inline-block mr-2" /> Increase
          Professor Limits
        </h2>
        <blockquote className="text-center italic text-gray-600 mb-4">
          "{quote}"
        </blockquote>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professor Selection */}
          <div ref={searchRef} className="relative">
            <label className="block text-gray-700 font-semibold mb-2">
              Select Professor:
            </label>
            <div className="relative flex">
              <input
                type="text"
                placeholder="Search professor..."
                className="w-full p-2 border rounded-l-lg"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedProf("");
                }}
                onFocus={() => setIsSearchFocused(true)}
              />
              <button
                type="button"
                className="px-3 bg-gray-100 border border-l-0 rounded-r-lg hover:bg-gray-200"
                onClick={() => setIsSearchFocused(!isSearchFocused)}
              >
                <FaChevronDown
                  className={`transform transition-transform ${
                    isSearchFocused ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            {isSearchFocused && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {(search ? filteredProfessors : professors).map((prof) => (
                  <div
                    key={prof._id}
                    className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleProfessorSelect(prof)}
                  >
                    <div className="font-medium">{prof.fullName}</div>
                    <div className="text-sm text-gray-600">
                      ID: {prof.idNumber}
                    </div>
                  </div>
                ))}
                {(search ? filteredProfessors : professors).length === 0 && (
                  <div className="p-2 text-gray-500 text-center">
                    No professors found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Display Current Limits */}
          {selectedProfessor && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Current Limits:
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium bg-white p-2 rounded-md shadow-sm">
                <span>
                  Summer Training: {selectedProfessor.limits.summer_training}
                </span>
                <span>
                  Minor Project: {selectedProfessor.limits.minor_project}
                </span>
                <span>
                  Major Project: {selectedProfessor.limits.major_project}
                </span>
              </div>
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Type:
            </label>
            <select
              className="w-full p-2 border rounded-lg"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="summer_training">Summer Training</option>
              <option value="minor_project">Minor Project</option>
              <option value="major_project">Major Project</option>
            </select>
          </div>

          {/* New Limit Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              New Limit:
            </label>
            <input
              type="number"
              min="1"
              className="w-full p-2 border rounded-lg"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlusCircle className="inline-block mr-2" />
            {loading ? "Updating..." : "Update Limit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncreaseLimit;
