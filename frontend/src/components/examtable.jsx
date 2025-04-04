import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from "exceljs";
export default function ExamTable() {
  const [exams, setExams] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfigs, setSortConfigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get("/api/v1/exam/all");
        setExams(response.data.data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    fetchExams();
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
    const existingSortIndex = sortConfigs.findIndex((config) => config.key === key);
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

  const sortedExams = [...exams].sort((a, b) => {
    for (const config of sortConfigs) {
      const key = config.key.split('.');
      let aValue = a;
      let bValue = b;

      for (const part of key) {
        aValue = aValue ? aValue[part] : null;
        bValue = bValue ? bValue[part] : null;
      }

      if (aValue === null || bValue === null) continue;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return config.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredExams = sortedExams.filter((exam) => {
    const query = searchQuery.toLowerCase();
    return (
      (exam.name?.fullName?.toLowerCase().includes(query) || '') ||
      (exam.name?.rollNumber?.toLowerCase().includes(query) || '') ||
      exam.examName.toLowerCase().includes(query) ||
      exam.score.toString().toLowerCase().includes(query)
    );
  });

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Exam Records");
  
    worksheet.columns = [
      { header: "Student", key: "fullName", width: 25 },
      { header: "Roll No", key: "rollNumber", width: 20 },
      { header: "Exam Name", key: "examName", width: 25 },
      { header: "Score", key: "score", width: 15 },
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
  
    filteredExams.forEach((record, index) => {
      const row = worksheet.addRow({
        fullName: record.name.fullName,
        rollNumber: record.name.rollNumber,
        examName: record.examName,
        score: record.score,
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
    a.download = "Exam_Report.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  


  const getSortDirection = (key) => {
    const config = sortConfigs.find(config => config.key === key);
    return config ? config.direction : 'Sort By';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">OTHER EXAMINATION DETAILS</h1>
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
                Student
                <div>
                  <select value={getSortDirection('name.fullName')} onChange={(e) => handleSortOptionChange('name.fullName', e)}>
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll No
                <div>
                  <select value={getSortDirection('name.rollNumber')} onChange={(e) => handleSortOptionChange('name.rollNumber', e)}>
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exam Name
                <div>
                  <select value={getSortDirection('examName')} onChange={(e) => handleSortOptionChange('examName', e)}>
                    <option value="Sort By">Sort By</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
                <div>
                  <select value={getSortDirection('score')} onChange={(e) => handleSortOptionChange('score', e)}>
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
            {filteredExams.map((exam) => (
             <tr key={exam._id} className={selectedRows.includes(exam._id) ? 'bg-gray-100' : ''}>
               <td className="px-6 py-4 whitespace-nowrap">
                 <input
                   type="checkbox"
                   onChange={() => handleRowSelect(exam._id)}
                   checked={selectedRows.includes(exam._id)}
                 />
               </td>
               <td className="px-6 py-4 whitespace-nowrap">{exam.name?.fullName}</td>
               <td className="px-6 py-4 whitespace-nowrap">{exam.name?.rollNumber}</td>
               <td className="px-6 py-4 whitespace-nowrap">{exam.examName}</td>
               <td className="px-6 py-4 whitespace-nowrap">{exam.score}</td>
               <td className="px-6 py-4 whitespace-nowrap">
                 {exam.docs.map((doc, index) => (
                   <div key={index}>
                     <a href={doc} target="_blank" rel="noopener noreferrer">Document {index + 1}</a>
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
}
