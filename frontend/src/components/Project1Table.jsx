import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Project1Table() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    section: "",
    branch: "",
    mentor: "",
  });
  const [sectionOptions, setSectionOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [batch, setBatch] = useState(23);

  useEffect(() => {
    fetchData();
  }, [batch]);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/v1/project1/get-all", {
        params: { batch },
      });
      const records = response.data.data.response || [];
      
      // Flatten groups into individual student records for the table
      const flattenedRecords = [];
      for (const group of records) {
        if (group.members && group.members.length > 0) {
          for (const member of group.members) {
            flattenedRecords.push({
              ...group,
              student: member
            });
          }
        }
      }
      
      setData(flattenedRecords);
      setFilteredData(flattenedRecords);

      const sections = [
        ...new Set(flattenedRecords.map((r) => r.student?.section).filter(Boolean)),
      ];
      const branches = [
        ...new Set(flattenedRecords.map((r) => r.student?.branch).filter(Boolean)),
      ];
      setSectionOptions(sections);
      setBranchOptions(branches);
    } catch (error) {
      console.error("Error fetching Project 1 data:", error);
      if (error.response?.status === 403) {
        toast.error(
          error.response.data?.message ||
            "You don't have access to view data from this batch",
          { toastId: "p1-batch-access-error" }
        );
        setData([]);
        setFilteredData([]);
      } else {
        toast.error("Failed to load Project 1 data", {
          toastId: "p1-fetch-error",
        });
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (f) => {
    let result = data;
    if (f.section) {
      result = result.filter((r) =>
        r.student?.section?.toLowerCase().includes(f.section.toLowerCase())
      );
    }
    if (f.branch) {
      result = result.filter((r) =>
        r.student?.branch?.toLowerCase().includes(f.branch.toLowerCase())
      );
    }
    if (f.mentor) {
      result = result.filter((r) =>
        r.allocatedProf?.fullName
          ?.toLowerCase()
          .includes(f.mentor.toLowerCase())
      );
    }
    setFilteredData(result);
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Project 1 Records</h1>

        {/* Batch selector */}
        <div className="mb-4 flex gap-4 items-center flex-wrap">
          <label className="font-medium">Batch (K):</label>
          <input
            type="number"
            value={batch}
            onChange={(e) => setBatch(Number(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="section"
            value={filters.section}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Sections</option>
            {sectionOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="branch"
            value={filters.branch}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Branches</option>
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="mentor"
            value={filters.mentor}
            onChange={handleFilterChange}
            placeholder="Filter by mentor name..."
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Roll Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Section
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mentor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Project Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Marks
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No Project 1 records found for this batch.
                  </td>
                </tr>
              ) : (
                filteredData.map((rec, idx) => (
                  <tr key={`${rec._id}-${rec.student?._id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rec.student?.fullName || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rec.student?.rollNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rec.student?.branch || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rec.student?.section || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rec.allocatedProf?.fullName || "Not assigned"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rec.projectTitle || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rec.student?.marks?.project1 ?? 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Total records: {filteredData.length}
        </div>
      </div>
    </div>
  );
}
