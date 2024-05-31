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
      worksheet.addRow({
        index: index++,
        fullName: record.fullName,
        rollNumber: record.rollNumber,
        branch: record.branch,
        comp1: record.placementOne?.company,
        ctc1: record.placementOne?.ctc,
        comp2: record.placementTwo?.company,
        ctc2: record.placementTwo?.ctc,
        comp3: record.placementThree?.company,
        ctc3: record.placementThree?.ctc,
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

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <ClipLoader size={42} />
      </div>
    );
  }

  if (placementData.length === 0) {
    return <div>NO PLACEMENT RECORDS!</div>;
  }

  return (
    <div className="overflow-x-auto">
      <h1 className="text-center text-3xl font-bold mb-8">PLACEMENT RECORDS</h1>

      <button
        onClick={exportToExcel}
        className="mb-4 p-2 bg-blue-500 text-white rounded mx-[45%]"
      >
        Export to Excel
      </button>

      <div className="flex justify-center">
        <table className="w-full max-w-4xl divide-y divide-gray-200">
          <thead className="bg-black">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Full Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Roll Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Branch
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Placement One
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Placement Two
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Placement Three
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {placementData.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.rollNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.branch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.placementOne
                    ? `${record.placementOne.company} - ${record.placementOne.ctc}`
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.placementTwo
                    ? `${record.placementTwo.company} - ${record.placementTwo.ctc}`
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
