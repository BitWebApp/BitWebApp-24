import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfessorTable() {
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [filters, setFilters] = useState({
    idNumber: "",
    fullName: "",
  });
  const [batch, setBatch] = useState("");

  useEffect(() => {
    fetchProfessors();
  }, [batch]);

  const fetchProfessors = async () => {
    try {
      const params = batch ? { batch } : {};
      const response = await axios.get("/api/v1/prof/getProf", { params });
      setProfessors(response.data.message);
      setFilteredProfessors(response.data.message);
      setFilters({ idNumber: "", fullName: "" });
    } catch (error) {
      toast.error("Failed to load professors");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    filterProfessors(newFilters);
  };

  const filterProfessors = (filters) => {
    let data = professors;
    if (filters.idNumber) {
      data = data.filter((prof) =>
        prof.idNumber.toLowerCase().includes(filters.idNumber.toLowerCase())
      );
    }
    if (filters.fullName) {
      data = data.filter((prof) =>
        prof.fullName.toLowerCase().includes(filters.fullName.toLowerCase())
      );
    }
    setFilteredProfessors(data);
  };

  return (
    <div className="overflow-x-auto">
      <ToastContainer />
      <h1 className="text-center text-3xl font-bold mb-8">
        PROFESSOR LIST
      </h1>
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          name="idNumber"
          placeholder="Filter by ID Number"
          value={filters.idNumber}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="fullName"
          placeholder="Filter by Full Name"
          value={filters.fullName}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        />
        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Batches</option>
          {[22, 23, 24, 25, 26].map((b) => (
            <option key={b} value={b}>
              Batch {b}
            </option>
          ))}
        </select>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-black">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              ID Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Full Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Minor Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Major Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                SUMMER INTERNSHIP
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredProfessors.map((prof, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prof.idNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prof.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prof.contact}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prof.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prof.currentCount?.minor_project}/{prof.limits?.minor_project}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prof.currentCount?.major_project}/{prof.limits?.major_project}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prof.currentCount?.summer_training}/{prof.limits?.summer_training}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
