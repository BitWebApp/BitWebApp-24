import React, { useState, useEffect } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
const HigherEduTable = () => {
  const [higherEducations, setHigherEducations] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfigs, setSortConfigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHigherEducations = async () => {
      try {
        const response = await axios.get("/api/v1/higher-education/all");
        setHigherEducations(response.data.data);
      } catch (error) {
        console.error("Error fetching higher educations:", error);
      }
    };

    fetchHigherEducations();
  }, [sortConfigs]); // Re-fetch data when sort configs change

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

  const sortedHigherEducations = [...higherEducations].sort((a, b) => {
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

  const filteredHigherEducations = sortedHigherEducations.filter((record) => {
    const query = searchQuery.toLowerCase();
    return (
      record.institution.toLowerCase().includes(query) ||
      record.degree.toLowerCase().includes(query) ||
      record.fieldOfStudy.toLowerCase().includes(query) ||
      record.startDate.toLowerCase().includes(query) ||
      record.endDate.toLowerCase().includes(query)
    );
  });

  const getSortDirection = (key) => {
    const config = sortConfigs.find((config) => config.key === key);
    return config ? config.direction : "Sort By";
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Higher Education Records");
  
    worksheet.columns = [
      { header: "Institution", key: "institution", width: 25 },
      { header: "Degree", key: "degree", width: 20 },
      { header: "Field of Study", key: "fieldOfStudy", width: 25 },
      { header: "Start Date", key: "startDate", width: 15 },
      { header: "End Date", key: "endDate", width: 15 },
      { header: "Supporting Docs", key: "docs", width: 30 },
    ];
  
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" }, 
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  
    filteredHigherEducations.forEach((record, index) => {
      const row = worksheet.addRow({
        institution: record.institution,
        degree: record.degree,
        fieldOfStudy: record.fieldOfStudy,
        startDate: record.startDate.substring(0, 10),
        endDate: record.endDate.substring(0, 10),
        docs: record.docs.join(", "),
      });
  
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "DDEBF7" },
          };
        });
      }
  
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Higher_Education_Report.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">HIGHER EDUCATION DETAILS</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 px-4 py-2 border rounded"
      />
      <button
        onClick={exportToExcel}
        className="mb-4 mx-4 p-2 bg-blue-500 text-white rounded"
      >
        Export to Excel
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Institution
                <div>
                  <select
                    value={getSortDirection("institution")}
                    onChange={(e) => handleSortOptionChange("institution", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Degree
                <div>
                  <select
                    value={getSortDirection("degree")}
                    onChange={(e) => handleSortOptionChange("degree", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Field of Study
                <div>
                  <select
                    value={getSortDirection("fieldOfStudy")}
                    onChange={(e) => handleSortOptionChange("fieldOfStudy", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
                <div>
                  <select
                    value={getSortDirection("startDate")}
                    onChange={(e) => handleSortOptionChange("startDate", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
                <div>
                  <select
                    value={getSortDirection("endDate")}
                    onChange={(e) => handleSortOptionChange("endDate", e)}
                  >
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supporting Doc
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHigherEducations.map((record) => (
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
                  {record.institution}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{record.degree}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.fieldOfStudy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.startDate.substring(0, 10)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.endDate.substring(0, 10)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.docs.map((doc, index) => (
                    <div key={index}>
                      <a href={doc} target="_blank" rel="noopener noreferrer">
                        View Document {index + 1}
                      </a>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HigherEduTable;
