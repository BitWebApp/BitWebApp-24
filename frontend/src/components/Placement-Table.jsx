import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import ExcelJS from "exceljs";

export default function PlacementTable() {
  const [placementData, setPlacementData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/users/placementDetails");
      setPlacementData(response.data.data);
    } catch (error) {
      console.error("Error fetching placement data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Placements");

    worksheet.columns = [
      { header: "#", key: "index", width: 5 },
      { header: "Full Name", key: "fullName", width: 15 },
      { header: "Roll Number", key: "rollNumber", width: 15 },
      { header: "Branch", key: "branch", width: 20 },
      { header: "Company 1", key: "comp1", width: 20 },
      { header: "CTC 1", key: "ctc1", width: 15 },
      { header: "Company 2", key: "comp2", width: 20 },
      { header: "CTC 2", key: "ctc2", width: 15 },
      { header: "Company 3", key: "comp3", width: 20 },
      { header: "CTC 3", key: "ctc3", width: 15 },
    ];

    let index = 1;
    placementData.forEach((record) => {
      const formattedCtc1 = formatCTC(record.placementOne?.ctc);
      const formattedCtc2 = formatCTC(record.placementTwo?.ctc);
      const formattedCtc3 = formatCTC(record.placementThree?.ctc);

      worksheet.addRow({
        index: index++,
        fullName: record.fullName,
        rollNumber: record.rollNumber,
        branch: record.branch,
        comp1: record.placementOne?.company,
        ctc1: formattedCtc1,
        comp2: record.placementTwo?.company,
        ctc2: formattedCtc2,
        comp3: record.placementThree?.company,
        ctc3: formattedCtc3,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Placement_Report.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCTC = (ctc) => {
    if (!ctc) return "-";
    const formattedValue = ctc / 100000;
    return `${formattedValue} LPA`;
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <ClipLoader size={42} />
      </div>
    );
  }

  if (placementData.length === 0) {
    return <div className="text-center text-gray-700 mt-10">NO PLACEMENT RECORDS!</div>;
  }

  return (
    <div className="overflow-x-auto p-4">
      <h1 className="text-center text-3xl font-bold mb-8">PLACEMENT RECORDS</h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={exportToExcel}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        >
          Export to Excel
        </button>
      </div>

      <div className="flex justify-center">
        <table className="table-auto w-full max-w-5xl bg-white shadow-md rounded my-6">
          <thead>
            <tr className="bg-gray-800 text-white text-sm md:text-base">
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Full Name</th>
              <th className="py-3 px-4 text-left">Roll Number</th>
              <th className="py-3 px-4 text-left">Branch</th>
              <th className="py-3 px-4 text-left">Placement One</th>
              <th className="py-3 px-4 text-left">Placement Two</th>
              <th className="py-3 px-4 text-left">Placement Three</th>
            </tr>
          </thead>
          <tbody>
            {placementData.map((record, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{record.fullName}</td>
                <td className="py-3 px-4">{record.rollNumber}</td>
                <td className="py-3 px-4">{record.branch}</td>
                <td className="py-3 px-4">
                  {record.placementOne
                    ? `${record.placementOne.company} - ${record.placementOne.ctc}`
                    : "-"}
                </td>
                <td className="py-3 px-4">
                  {record.placementTwo
                    ? `${record.placementTwo.company} - ${record.placementTwo.ctc}`
                    : "-"}
                </td>
                <td className="py-3 px-4">
                  {record.placementThree
                    ? `${record.placementThree.company} - ${record.placementThree.ctc}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
