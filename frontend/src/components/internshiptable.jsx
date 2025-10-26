import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelJS from "exceljs";

export default function InternshipTable() {
  const [internData, setInternData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    company: "",
    section: "",
    branch: "",
  });
  const [sectionOptions, setSectionOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [batch, setBatch] = useState(2023)

  useEffect(() => {
    fetchData();
  }, [batch]);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/v1/intern/get-verified-interns",{
        params:{
          batch
        }
      });
      console.log(response);
      setInternData(response.data.data.response);
      setFilteredData(response.data.data.response);

      // Extract unique sections and branches from the fetched data
      const sections = [
        ...new Set(
          response.data.data.response.map((record) => record.student.section)
        ),
      ];
      const branches = [
        ...new Set(
          response.data.data.response.map((record) => record.student.branch)
        ),
      ];
      setSectionOptions(sections);
      setBranchOptions(branches);
    } catch (error) {
      console.error("Error fetching internship data:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    filterData({ ...filters, [name]: value });
  };

  const filterData = (filters) => {
    let data = internData;
    if (filters.company) {
      data = data.filter((record) =>
        record.company?.companyName
          .toLowerCase()
          .includes(filters.company.toLowerCase())
      );
    }
    if (filters.section) {
      data = data.filter((record) =>
        record.student.section
          .toLowerCase()
          .includes(filters.section.toLowerCase())
      );
    }
    if (filters.branch) {
      data = data.filter((record) =>
        record.student.branch
          .toLowerCase()
          .includes(filters.branch.toLowerCase())
      );
    }
    setFilteredData(data);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Internships");

    // Initialize variables to store max lengths for each column
    let maxIndexLength = "#".length;
    let maxRollNumberLength = "Roll Number".length;
    let maxNameLength = "Name".length;
    let maxEmailLength = "Email".length;
    let maxCompanyLength = "Company".length;
    let maxTypeLength = "Internship Type".length;
    let maxLocationLength = "Location".length;
    let maxMentorLength = "Mentor".length;
    let maxMarksLength = "Summer Training Marks".length;

    // Iterate through filteredData to find maximum lengths
    filteredData.forEach((record, index) => {
      const mentor =
        record.mentor?.idNumber && record.mentor?.fullName
          ? `${record.mentor.idNumber}: ${record.mentor.fullName}`
          : "N/A";

      maxIndexLength = Math.max(maxIndexLength, (index + 1).toString().length);
      maxRollNumberLength = Math.max(
        maxRollNumberLength,
        (record?.student?.rollNumber || "").length
      );
      maxNameLength = Math.max(
        maxNameLength,
        (record?.student?.fullName || "").toUpperCase().length
      );
      maxEmailLength = Math.max(
        maxEmailLength,
        (record?.student?.email || "").length
      );
      maxCompanyLength = Math.max(
        maxCompanyLength,
        (record?.company?.companyName || "").toUpperCase().length
      );
      maxTypeLength = Math.max(maxTypeLength, (record?.type || "").length);
      maxLocationLength = Math.max(
        maxLocationLength,
        (record?.location || "").length
      );
      maxMentorLength = Math.max(maxMentorLength, mentor.length);
    });

    // Define columns with dynamic widths
    worksheet.columns = [
      { header: "#", key: "index", width: maxIndexLength + 3 },
      {
        header: "Roll Number",
        key: "rollNumber",
        width: maxRollNumberLength + 3,
      },
      { header: "Name", key: "name", width: maxNameLength + 3 },
      { header: "Email", key: "email", width: maxEmailLength + 3 },
      { header: "Company", key: "company", width: maxCompanyLength + 3 },
      { header: "Internship Type", key: "type", width: maxTypeLength + 3 },
      { header: "Location", key: "location", width: maxLocationLength + 3 },
      { header: "Mentor", key: "mentor", width: maxMentorLength + 3 },
      { header: "Summer Training Marks", key: "marks", width: maxMarksLength + 3 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF000000" },
    };

    // Add data rows matching the frontend table
    filteredData.forEach((record, index) => {
      const mentor =
        record.mentor?.idNumber && record.mentor?.fullName
          ? `${record.mentor.idNumber}: ${record.mentor.fullName}`
          : "N/A";

      const row = worksheet.addRow({
        index: index + 1,
        rollNumber: record?.student?.rollNumber,
        name: record?.student?.fullName.toUpperCase(),
        email: record?.student?.email,
        company: record?.company?.companyName.toUpperCase(),
        type: record?.type,
        location: record?.location,
        mentor,
        marks: record?.student?.marks?.summerTraining || "N/A",
      });

      // Add alternating row colors for better readability
      const fillColor = index % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF";
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
      });
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    });

    // Save the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Internship_Report.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="overflow-x-auto">
      <ToastContainer />
      <h1 className="text-center text-3xl font-bold mb-8">
        INTERNSHIP RECORDS
      </h1>

      <div className="mb-4">
        <input
          type="text"
          name="company"
          placeholder="Filter by Company"
          value={filters.company}
          onChange={handleFilterChange}
          className="mr-2 p-2 border border-gray-300 rounded"
        />
        <select
          name="section"
          value={filters.section}
          onChange={handleFilterChange}
          className="mr-2 p-2 border border-gray-300 rounded"
        >
          <option value="">Filter by Section</option>
          {sectionOptions.map((section, index) => (
            <option key={index} value={section}>
              {section}
            </option>
          ))}
        </select>
        <select
          name="branch"
          value={filters.branch}
          onChange={handleFilterChange}
          className="mr-2 p-2 border border-gray-300 rounded"
        >
          <option value="">Filter by Branch</option>
          {branchOptions.map((branch, index) => (
            <option key={index} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={exportToExcel}
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        Export to Excel
      </button>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-black">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Roll Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Internship Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Mentor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Summer Training Marks
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.student?.rollNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.student?.fullName.toUpperCase()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.student?.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.company?.companyName.toUpperCase()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.mentor
                  ? record?.mentor?.idNumber + ": " + record?.mentor?.fullName
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.student?.marks?.summerTraining || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
