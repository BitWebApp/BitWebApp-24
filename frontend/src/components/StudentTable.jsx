import axios from "axios";
import ExcelJS from "exceljs";
import { useEffect, useState } from "react";

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({
    section: "",
    branch: "",
    search: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "rollNumber",
    direction: "ascending",
  });
  const [batch, setBatch] = useState(22);
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Optional: Modify the backend to handle filtering and sorting
        const response = await axios.get("/api/v1/users/get-all-users", {
          params: {
            batch,
          },
        });
        console.log(response);
        setStudents(response.data.data.users);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [batch]);

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSortChange = (e) => {
    const { value } = e.target;
    const [key, direction] = value.split("-");
    setSortConfig({ key, direction });
  };

  const applyFilters = (data) => {
    return data.filter((record) => {
      const { section, branch, search } = filters;
      const query = search.toLowerCase();

      const matchesSection = section ? record.section === section : true;
      const matchesBranch = branch ? record.branch === branch : true;
      const matchesSearch =
        record.fullName.toLowerCase().includes(query) ||
        record.rollNumber.toLowerCase().includes(query) ||
        record.email.toLowerCase().includes(query) ||
        record.mobileNumber.toLowerCase().includes(query);
      return matchesSection && matchesBranch && matchesSearch;
    });
  };

  const applySort = (data) => {
    if (!sortConfig.key) return data;

    const sortedData = [...data].sort((a, b) => {
      const aValue =
        typeof a[sortConfig.key] === "string"
          ? a[sortConfig.key].toLowerCase()
          : a[sortConfig.key];
      const bValue =
        typeof b[sortConfig.key] === "string"
          ? b[sortConfig.key].toLowerCase()
          : b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    return sortedData;
  };

  const processedStudents = applySort(applyFilters(students));

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    // Define styles
    const headerFill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB0C4DE" }, // LightSteelBlue
    };

    const titleFont = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "FFFFFFFF" }, // White
    };

    const headerFont = {
      name: "Arial",
      size: 12,
      bold: true,
      color: { argb: "FFFFFFFF" }, // White
    };

    const cellBorder = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Add Title
    worksheet.mergeCells("A1:M1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Student Details Report";
    titleCell.font = titleFont;
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4682B4" }, // SteelBlue
    };
    titleCell.border = cellBorder;

    // Define Headers
    const headers = [
      "Full Name",
      "Roll Number",
      "Email",
      "Branch",
      "Section",
      "Semester",
      "Mobile Number",
      "Verified",
    ];

    // Add Headers to Row 2
    worksheet.addRow(headers);

    // Style Headers
    const headerRow = worksheet.getRow(2);
    headerRow.font = headerFont;
    headerRow.fill = headerFill;
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.border = cellBorder;

    // Add Data Rows starting from Row 3
    processedStudents.forEach((student) => {
      worksheet.addRow([
        student.fullName,
        student.rollNumber,
        student.email,
        student.branch,
        student.section,
        student.semester,
        student.mobileNumber,
      ]);
    });

    // Style Data Rows
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 2) {
        // Skip title and header
        row.eachCell((cell) => {
          cell.border = cellBorder;
          cell.alignment = { vertical: "middle", horizontal: "left" };
          // Optional: Add alternating row colors for better readability
          if (rowNumber % 2 === 0) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF0F8FF" }, // AliceBlue
            };
          }
        });
      }
    });

    // Adjust Column Widths based on Content
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      // Set minimum width to 15 and add some padding
      column.width = maxLength < 15 ? 15 : maxLength + 5;
    });

    // Ensure Grid Lines are Visible
    worksheet.views = [{ showGridLines: true }];

    // Generate Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create a Blob from the buffer and trigger download
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Extract unique sections and branches for filter dropdowns
  const uniqueSections = [...new Set(students.map((s) => s.section))].filter(
    (s) => s
  );
  const uniqueBranches = [...new Set(students.map((s) => s.branch))].filter(
    (s) => s
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">STUDENT DETAILS</h1>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap mb-4 gap-4">
        {/* Search Input */}
        <input
          type="text"
          name="search"
          placeholder="Search by Name, Roll No, etc..."
          value={filters.search}
          onChange={handleFilterChange}
          className="px-4 py-2 border rounded flex-1 min-w-[200px]"
        />

        {/* Section Filter */}
        <select
          name="section"
          value={filters.section}
          onChange={handleFilterChange}
          className="px-4 py-2 border rounded min-w-[150px]"
        >
          <option value="">All Sections</option>
          {uniqueSections.map((section) => (
            <option key={section} value={section}>
              Section {section}
            </option>
          ))}
        </select>

        {/* Branch Filter */}
        <select
          name="branch"
          value={filters.branch}
          onChange={handleFilterChange}
          className="px-4 py-2 border rounded min-w-[150px]"
        >
          <option value="">All Branches</option>
          {uniqueBranches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>

        {/* Batch Filter */}
        <select
          name="batch"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="px-4 py-2 border rounded min-w-[150px]"
        >
          <option value="">All Batches</option>
          {[22, 23, 24, 25, 26].map((batchOption) => (
            <option key={batchOption} value={batchOption}>
              Batch {batchOption}
            </option>
          ))}
        </select>

        {/* Sort Options */}
        <select
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={handleSortChange}
          className="px-4 py-2 border rounded min-w-[200px]"
        >
          <option value="-">Sort By</option>
          <option value="fullName-ascending">Full Name (A-Z)</option>
          <option value="fullName-descending">Full Name (Z-A)</option>
          <option value="rollNumber-ascending">Roll Number (Ascending)</option>
          <option value="rollNumber-descending">
            Roll Number (Descending)
          </option>
          <option value="email-ascending">Email (A-Z)</option>
          <option value="email-descending">Email (Z-A)</option>
        </select>

        <button
          onClick={() => setFilters({ section: "", branch: "", search: "" })}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Reset Filters
        </button>
      </div>

      {/* Export Button */}
      <button
        onClick={exportToExcel}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Export to Excel
      </button>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verified
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedStudents.map((student) => (
              <tr
                key={student._id}
                className={`cursor-pointer ${
                  selectedRows.includes(student._id) ? "bg-gray-100" : ""
                }`}
                onClick={() => handleRowSelect(student._id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.fullName.toUpperCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.rollNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.branch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.section}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.semester}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.mobileNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.isVerified ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {processedStudents.length === 0 && (
          <div className="text-center py-4">No students found.</div>
        )}
      </div>
    </div>
  );
};

export default StudentTable;
