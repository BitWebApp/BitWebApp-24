import axios from "axios";
import ExcelJS from "exceljs";
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
    allotment: "",
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
              student: member,
            });
          }
        }
      }

      setData(flattenedRecords);
      setFilteredData(flattenedRecords);

      const sections = [
        ...new Set(
          flattenedRecords.map((r) => r.student?.section).filter(Boolean),
        ),
      ];
      const branches = [
        ...new Set(
          flattenedRecords.map((r) => r.student?.branch).filter(Boolean),
        ),
      ];
      setSectionOptions(sections);
      setBranchOptions(branches);
    } catch (error) {
      console.error("Error fetching Project 1 data:", error);
      if (error.response?.status === 403) {
        toast.error(
          error.response.data?.message ||
            "You don't have access to view data from this batch",
          { toastId: "p1-batch-access-error" },
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
    filterData(newFilters);
  };

  const filterData = (f) => {
    let result = data;
    if (f.section) {
      result = result.filter((r) =>
        r.student?.section?.toLowerCase().includes(f.section.toLowerCase()),
      );
    }
    if (f.branch) {
      result = result.filter((r) =>
        r.student?.branch?.toLowerCase().includes(f.branch.toLowerCase()),
      );
    }
    if (f.mentor) {
      result = result.filter((r) =>
        r.allocatedProf?.fullName
          ?.toLowerCase()
          .includes(f.mentor.toLowerCase()),
      );
    }
    if (f.allotment === "alloted") {
      result = result.filter((r) => r.allocatedProf);
    } else if (f.allotment === "not_alloted") {
      result = result.filter((r) => !r.allocatedProf);
    }
    setFilteredData(result);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Project1");

    // Initialize variables to store max lengths for each column
    let maxIndexLength = "#".length;
    let maxRollNumberLength = "Roll Number".length;
    let maxNameLength = "Name".length;
    let maxEmailLength = "Email".length;
    let maxMobileLength = "Mobile Number".length;
    let maxGroupIdLength = "Group ID".length;
    let maxMentorLength = "Mentor".length;
    let maxProjectLength = "Project Title".length;
    let maxMarksLength = "Project 1 Marks".length;

    // Iterate through filteredData to find maximum lengths
    filteredData.forEach((record, index) => {
      const mentor = record.allocatedProf?.fullName || "Mentor Not Alloted";

      maxIndexLength = Math.max(maxIndexLength, (index + 1).toString().length);
      maxRollNumberLength = Math.max(
        maxRollNumberLength,
        (record?.student?.rollNumber || "").length,
      );
      maxNameLength = Math.max(
        maxNameLength,
        (record?.student?.fullName || "").toUpperCase().length,
      );
      maxEmailLength = Math.max(
        maxEmailLength,
        (record?.student?.email || "").length,
      );
      maxMobileLength = Math.max(
        maxMobileLength,
        (record?.student?.mobileNumber || "").length,
      );
      maxGroupIdLength = Math.max(
        maxGroupIdLength,
        (record?.groupId || "").length,
      );
      maxProjectLength = Math.max(
        maxProjectLength,
        (record?.projectTitle || "").length,
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
      {
        header: "Mobile Number",
        key: "mobileNumber",
        width: maxMobileLength + 3,
      },
      { header: "Group ID", key: "groupId", width: maxGroupIdLength + 3 },
      { header: "Mentor", key: "mentor", width: maxMentorLength + 3 },
      {
        header: "Project Title",
        key: "projectTitle",
        width: maxProjectLength + 3,
      },
      {
        header: "Project 1 Marks",
        key: "marks",
        width: maxMarksLength + 3,
      },
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
      const mentor = record.allocatedProf?.fullName || "Mentor Not Alloted";

      const row = worksheet.addRow({
        index: index + 1,
        rollNumber: record?.student?.rollNumber,
        name: record?.student?.fullName?.toUpperCase(),
        email: record?.student?.email,
        mobileNumber: record?.student?.mobileNumber || "N/A",
        groupId: record?.groupId?.toUpperCase() || "N/A",
        mentor,
        projectTitle: record?.projectTitle || "N/A",
        marks: record?.student?.marks?.project1 || "N/A",
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
    a.download = "Project1_Report.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="overflow-x-auto">
      <ToastContainer />
      <h1 className="text-center text-3xl font-bold mb-8">
        PROJECT 1 RECORDS
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
          name="mentor"
          placeholder="Filter by Mentor"
          value={filters.mentor}
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
        <select
          name="allotment"
          value={filters.allotment}
          onChange={handleFilterChange}
          className="mr-2 p-2 border border-gray-300 rounded"
        >
          <option value="">All Allotment Status</option>
          <option value="alloted">Alloted</option>
          <option value="not_alloted">Not Alloted</option>
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
              Mobile Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Group ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Mentor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Project Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Project 1 Marks
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((record, index) => (
            <tr key={`${record._id}-${record.student?._id}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.student?.rollNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.student?.fullName?.toUpperCase()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.student?.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.student?.mobileNumber || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.groupId?.toUpperCase() || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.allocatedProf
                  ? record?.allocatedProf?.fullName
                  : "Mentor Not Alloted"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.projectTitle || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record?.student?.marks?.project1 || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
