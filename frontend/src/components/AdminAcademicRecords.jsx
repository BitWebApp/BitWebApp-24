import React, { useState, useEffect } from "react";
import axios from "axios";
import ExcelJS from "exceljs";

const AdminAcademicRecords = () => {
  const [academicRecords, setAcademicRecords] = useState([]);
  const [sortConfigs, setSortConfigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [batch, setBatch] = useState(23);

  useEffect(() => {
    const fetchAcademicRecords = async () => {
      try {
        const response = await axios.get("/api/v1/academics/adminRecords", {
          params: {
            batch,
          },
        });
        if (response.data && response.data.data) {
          setAcademicRecords(response.data.data);
        } else {
          setAcademicRecords([]);
        }
      } catch (error) {
        console.error("Error fetching academic records:", error);
      }
    };

    fetchAcademicRecords();
  }, [batch]);

  const handleSortOptionChange = (key, e) => {
    const sortType = e.target.value;
    handleSort(key, sortType);
  };

  const handleSort = (key, sortType) => {
    let newSortConfigs = [];

    if (sortType === "default") {
      newSortConfigs = sortConfigs.filter((config) => config.key !== key);
    } else {
      const existingSortIndex = sortConfigs.findIndex(
        (config) => config.key === key
      );
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
    }

    setSortConfigs(newSortConfigs);
  };

  const sortedAcademicRecords = [...academicRecords].sort((a, b) => {
    for (const config of sortConfigs) {
      if (a[config.key] < b[config.key]) {
        return config.direction === "ascending" ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredAcademicRecords = sortedAcademicRecords
    .filter((record) => {
      const query = searchQuery.toLowerCase();
      return (
        record.rollNumber.toLowerCase().includes(query) ||
        record.fullName.toLowerCase().includes(query) ||
        record.branch.toLowerCase().includes(query) ||
        record.section.toLowerCase().includes(query) ||
        record.semester.toString().toLowerCase().includes(query) ||
        record.gpa.toString().toLowerCase().includes(query)
      );
    })
    .filter((record) => {
      return Object.keys(filters).every((key) => {
        return filters[key] === "all" || record[key] === filters[key];
      });
    });

  const getSortDirection = (key) => {
    const config = sortConfigs.find((config) => config.key === key);
    return config ? config.direction : "default";
  };

  const groupedRecords = filteredAcademicRecords.reduce((acc, record) => {
    if (!acc[record.rollNumber]) {
      acc[record.rollNumber] = {
        ...record,
        gpaBySemester: {},
      };
    }
    acc[record.rollNumber].gpaBySemester[record.semester] = record.gpa;
    return acc;
  }, {});

  const displayedRecords = Object.values(groupedRecords);

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const generateExcelReport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Academic Records");

    worksheet.columns = [
      { header: "Roll No", key: "rollNumber", width: 15 },
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Branch", key: "branch", width: 15 },
      { header: "Section", key: "section", width: 10 },
      { header: "Sem 1", key: "sem1", width: 10 },
      { header: "Sem 2", key: "sem2", width: 10 },
      { header: "Sem 3", key: "sem3", width: 10 },
      { header: "Sem 4", key: "sem4", width: 10 },
      { header: "Sem 5", key: "sem5", width: 10 },
      { header: "Sem 6", key: "sem6", width: 10 },
      { header: "Sem 7", key: "sem7", width: 10 },
      { header: "Sem 8", key: "sem8", width: 10 },
    ];

    displayedRecords.forEach((record) => {
      worksheet.addRow({
        rollNumber: record.rollNumber,
        fullName: record.fullName,
        branch: record.branch,
        section: record.section,
        sem1: record.gpaBySemester[1] || "-",
        sem2: record.gpaBySemester[2] || "-",
        sem3: record.gpaBySemester[3] || "-",
        sem4: record.gpaBySemester[4] || "-",
        sem5: record.gpaBySemester[5] || "-",
        sem6: record.gpaBySemester[6] || "-",
        sem7: record.gpaBySemester[7] || "-",
        sem8: record.gpaBySemester[8] || "-",
      });
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Academic_Records.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Admin Academic Records</h1>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded w-1/2"
        />
        <button
          onClick={generateExcelReport}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export to Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll No
                <div>
                  <select
                    value={getSortDirection("rollNumber")}
                    onChange={(e) => handleSortOptionChange("rollNumber", e)}
                  >
                    <option value="default">Default</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                  <select
                    onChange={(e) =>
                      handleFilterChange("rollNumber", e.target.value)
                    }
                    className="mt-2"
                  >
                    <option value="all">All</option>
                    {academicRecords.map((record) => (
                      <option key={record.rollNumber} value={record.rollNumber}>
                        {record.rollNumber}
                      </option>
                    ))}
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
                    <option value="default">Default</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                  <select
                    onChange={(e) =>
                      handleFilterChange("fullName", e.target.value)
                    }
                    className="mt-2"
                  >
                    <option value="all">All</option>
                    {academicRecords.map((record) => (
                      <option key={record.fullName} value={record.fullName}>
                        {record.fullName}
                      </option>
                    ))}
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
                    <option value="default">Default</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                  <select
                    onChange={(e) =>
                      handleFilterChange("branch", e.target.value)
                    }
                    className="mt-2"
                  >
                    <option value="all">All</option>
                    {academicRecords.map((record) => (
                      <option key={record.branch} value={record.branch}>
                        {record.branch}
                      </option>
                    ))}
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
                    <option value="default">Default</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                  <select
                    onChange={(e) =>
                      handleFilterChange("section", e.target.value)
                    }
                    className="mt-2"
                  >
                    <option value="all">All</option>
                    {academicRecords.map((record) => (
                      <option key={record.section} value={record.section}>
                        {record.section}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sem 1
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sem 2
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sem 3
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sem 4
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sem 5
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sem 6
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sem 7
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sem 8
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedRecords.map((record) => (
              <tr
                key={record.rollNumber}
                className={
                  selectedRows.includes(record.rollNumber) ? "bg-gray-100" : ""
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.rollNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{record.branch}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.section}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.gpaBySemester[1] || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.gpaBySemester[2] || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.gpaBySemester[3] || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.gpaBySemester[4] || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.gpaBySemester[5] || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.gpaBySemester[6] || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.gpaBySemester[7] || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.gpaBySemester[8] || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAcademicRecords;
