import axios from "axios";
import ExcelJS from "exceljs";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MajorProjectTable() {
  const [projectData, setProjectData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    groupId: "",
    section: "",
    branch: "",
  });
  const [sectionOptions, setSectionOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [batch, setBatch] = useState(23);

  useEffect(() => {
    fetchData();
  }, [batch]);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/v1/admin/get-major-projects", {
        params: {
          batch,
        },
      });
      // console.log(response);
      setProjectData(response.data.data.response);
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
      console.error("Error fetching major project data:", error);
      if (error.response?.status === 403) {
        toast.error(
          error.response.data?.message ||
            `You don't have access to view data from this batch`
        );
        setProjectData([]);
        setFilteredData([]);
      } else {
        toast.error("Failed to load major project data");
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    filterData({ ...filters, [name]: value });
  };

  const filterData = (filters) => {
    let data = projectData;
    if (filters.groupId) {
      data = data.filter((record) =>
        record.groupId.toLowerCase().includes(filters.groupId.toLowerCase())
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
    const worksheet = workbook.addWorksheet("Major Projects");

    // Initialize variables to store max lengths for each column
    let maxIndexLength = "#".length;
    let maxRollNumberLength = "Roll Number".length;
    let maxNameLength = "Name".length;
    let maxEmailLength = "Email".length;
    let maxGroupIdLength = "Group ID".length;
    let maxMentorLength = "Mentor".length;
    let maxMarksLength = "Major Project Marks".length;
    let maxMobileLength = "Mobile Number".length;
    let maxTypeLength = "Type".length;
    let maxOrgLength = "Organisation".length;
    let maxLocationLength = "Location".length;
    let maxProjectTitleLength = "Project Title".length;

    // Iterate through filteredData to find maximum lengths
    filteredData.forEach((record, index) => {
      const mentor =
        record.mentor?.idNumber && record.mentor?.fullName
          ? `${record.mentor.idNumber}: ${record.mentor.fullName}`
          : "N/A";
      maxIndexLength = Math.max(maxIndexLength, (index + 1).toString().length);
      maxRollNumberLength = Math.max(maxRollNumberLength, (record?.student?.rollNumber || "").length);
      maxNameLength = Math.max(maxNameLength, (record?.student?.fullName || "").toUpperCase().length);
      maxEmailLength = Math.max(maxEmailLength, (record?.student?.email || "").length);
      maxGroupIdLength = Math.max(maxGroupIdLength, (record?.groupId || "").toUpperCase().length);
      maxMentorLength = Math.max(maxMentorLength, mentor.length);
      maxMobileLength = Math.max(maxMobileLength, (record?.student?.mobileNumber || "").length);
      maxTypeLength = Math.max(maxTypeLength, (record?.type || "").length);
      maxOrgLength = Math.max(maxOrgLength, (record?.org || "").length);
      maxLocationLength = Math.max(maxLocationLength, (record?.location || "").length);
      maxProjectTitleLength = Math.max(maxProjectTitleLength, (record?.projectTitle || record?.student?.projectTitle || "").length);
    });

    // Define columns with dynamic widths
    worksheet.columns = [
      { header: "#", key: "index", width: maxIndexLength + 3 },
      { header: "Roll Number", key: "rollNumber", width: maxRollNumberLength + 3 },
      { header: "Name", key: "name", width: maxNameLength + 3 },
      { header: "Email", key: "email", width: maxEmailLength + 3 },
      { header: "Mobile Number", key: "mobileNumber", width: maxMobileLength + 3 },
      { header: "Group ID", key: "groupId", width: maxGroupIdLength + 3 },
      { header: "Mentor", key: "mentor", width: maxMentorLength + 3 },
      { header: "Type", key: "type", width: maxTypeLength + 3 },
      { header: "Organisation", key: "org", width: maxOrgLength + 3 },
      { header: "Location", key: "location", width: maxLocationLength + 3 },
      { header: "Project Title", key: "projectTitle", width: maxProjectTitleLength + 3 },
      { header: "Major Project Marks", key: "marks", width: maxMarksLength + 3 },
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
        name: record?.student?.fullName?.toUpperCase(),
        email: record?.student?.email,
        mobileNumber: record?.student?.mobileNumber,
        groupId: record?.groupId?.toUpperCase(),
        mentor,
        type: record?.type,
        org: record?.org,
        location: record?.location,
        projectTitle: record?.projectTitle || record?.student?.projectTitle || "",
        marks: record?.student?.marks?.majorProject || 0,
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
    a.download = "Major_Project_Report.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="overflow-x-auto">
      <ToastContainer />
      <h1 className="text-center text-3xl font-bold mb-8">
        MAJOR PROJECT RECORDS
      </h1>

      <div className="mb-4">
        <select
          value={batch}
          onChange={(e) => setBatch(Number(e.target.value))}
          className="mr-2 p-2 border border-gray-300 rounded"
        >
          <option value="22">Batch 22</option>
          <option value="23">Batch 23</option>
          <option value="24">Batch 24</option>
          <option value="25">Batch 25</option>
          <option value="26">Batch 26</option>
        </select>

        <input
          type="text"
          name="groupId"
          placeholder="Filter by Group ID"
          value={filters.groupId}
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

      <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'auto' }}>
        <thead className="bg-black">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Roll Number</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Mobile Number</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Group ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Mentor</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Organisation</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Location</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Project Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Major Project Marks</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.student?.rollNumber}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.student?.fullName?.toUpperCase()}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.student?.email}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.student?.mobileNumber}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.groupId?.toUpperCase()}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.mentor ? record?.mentor?.idNumber + ": " + record?.mentor?.fullName : "N/A"}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.type}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.org}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.location}</td>
              <td className="px-4 py-4 text-sm text-gray-500 break-words" style={{ minWidth: '350px', maxWidth: '900px', wordBreak: 'break-word', whiteSpace: 'normal' }}>{
                typeof record?.projectTitle === 'string' && record.projectTitle.trim() ? record.projectTitle.trim() :
                (typeof record?.student?.projectTitle === 'string' && record.student.projectTitle.trim() ? record.student.projectTitle.trim() : "N/A")
              }</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record?.student?.marks?.majorProject || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
