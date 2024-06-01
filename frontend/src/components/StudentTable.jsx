import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfigs, setSortConfigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const userString = localStorage.getItem("user");
        const user = JSON.parse(userString);
        const studentId = user._id;
        const response = await axios.get(
          "/api/v1/intern/get-internship-for-student",
        );
        console.log(response);
        setStudents(response.data.data.response);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [sortConfigs]);

  const handleRowSelect = (id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);
  };

  const handleSortOptionChange = (key, e) => {
    const sortType = e.target.value;
    if (sortType === "Sort By") {
      const newSortConfigs = sortConfigs.filter((config) => config.key !== key);
      setSortConfigs(newSortConfigs);
    } else {
      handleSort(key, sortType);
    }
  };

  const handleSort = (key, sortType) => {
    const existingSortIndex = sortConfigs.findIndex(
      (config) => config.key === key
    );
    let newSortConfigs = [];

    if (existingSortIndex !== -1) {
      newSortConfigs = sortConfigs.map((config, index) => {
        if (index === existingSortIndex) {
          return { ...config, direction: sortType };
        }
        return config;
      });
    } else {
      newSortConfigs = [...sortConfigs, { key, direction: sortType }];
    }

    setSortConfigs(newSortConfigs);
  };

  const sortedStudents = [...students].sort((a, b) => {
    for (const config of sortConfigs) {
      const aValue =
        typeof a[config.key] === "string"
          ? a[config.key].toLowerCase()
          : a[config.key];
      const bValue =
        typeof b[config.key] === "string"
          ? b[config.key].toLowerCase()
          : b[config.key];

      if (aValue < bValue) {
        return config.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredStudents = sortedStudents.filter((record) => {
    const query = searchQuery.toLowerCase();
    return (
      record.student.username.toLowerCase().includes(query) ||
      record.student.fullName.toLowerCase().includes(query) ||
      record.student.student.rollNumber.toLowerCase().includes(query) ||
      record.student.email.toLowerCase().includes(query) ||
      record.student.branch.toLowerCase().includes(query) ||
      record.student.section.toLowerCase().includes(query) ||
      record.student.semester.toLowerCase().includes(query) ||
      record.student.mobileNumber.toLowerCase().includes(query)
    );
  });

  const getSortDirection = (key) => {
    const config = sortConfigs.find((config) => config.key === key);
    return config ? config.direction : "Sort By";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">STUDENT DETAILS</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 px-4 py-2 border rounded"
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
                <div>
                  <select
                    value={getSortDirection("username")}
                    onChange={(e) => handleSortOptionChange("username", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
                <div>
                  <select
                    value={getSortDirection("fullName")}
                    onChange={(e) => handleSortOptionChange("fullName", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll Number
                <div>
                  <select
                    value={getSortDirection("rollNumber")}
                    onChange={(e) => handleSortOptionChange("rollNumber", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
                <div>
                  <select
                    value={getSortDirection("email")}
                    onChange={(e) => handleSortOptionChange("email", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
                <div>
                  <select
                    value={getSortDirection("branch")}
                    onChange={(e) => handleSortOptionChange("branch", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
                <div>
                  <select
                    value={getSortDirection("section")}
                    onChange={(e) => handleSortOptionChange("section", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
                <div>
                  <select
                    value={getSortDirection("semester")}
                    onChange={(e) => handleSortOptionChange("semester", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile Number
                <div>
                  <select
                    value={getSortDirection("mobileNumber")}
                    onChange={(e) => handleSortOptionChange("mobileNumber", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Is Verified
                <div>
                  <select
                    value={getSortDirection("isVerified")}
                    onChange={(e) => handleSortOptionChange("isVerified", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((record) => (
              <tr
                key={record._id}
                className={ 
                  selectedRows.includes(record._id) ? "bg-gray-100" : ""
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    onChange={() => handleRowSelect(record._id)}
                    checked={selectedRows.includes(record._id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.student.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.student.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.student.rollNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{record.student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.student.branch}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.student.section}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.student.semester}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.student.mobileNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.student.isVerified ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
