import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';

const PEAdminTable = () => {
  const [peCourses, setPeCourses] = useState([]);
  const [sortConfigs, setSortConfigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchPeCourses = async () => {
      try {
        const response = await axios.get('/api/v1/pe/get-all');
        if (response.data && response.data.data) {
          setPeCourses(response.data.data);
        } else {
          setPeCourses([]);
        }
      } catch (error) {
        console.error('Error fetching PE courses:', error);
      }
    };

    fetchPeCourses();
  }, []);

  const handleSortOptionChange = (key, e) => {
    const sortType = e.target.value;
    handleSort(key, sortType);
  };

  const handleSort = (key, sortType) => {
    let newSortConfigs = [];

    if (sortType === 'default') {
      newSortConfigs = sortConfigs.filter(config => config.key !== key);
    } else {
      const existingSortIndex = sortConfigs.findIndex(config => config.key === key);
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

  const sortedPeCourses = [...peCourses].sort((a, b) => {
    for (const config of sortConfigs) {
      if (a[config.key] < b[config.key]) {
        return config.direction === 'ascending' ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredPeCourses = sortedPeCourses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.courseCode.toLowerCase().includes(query) ||
      course.courseName.toLowerCase().includes(query) ||
      course.branch.toLowerCase().includes(query) ||
      course.students.some(student =>
        student.rollNumber.toLowerCase().includes(query) ||
        student.fullName.toLowerCase().includes(query) ||
        student.branch.toLowerCase().includes(query) ||
        student.section.toLowerCase().includes(query)
      )
    );
  }).filter((course) => {
    return Object.keys(filters).every((key) => {
      return filters[key] === 'all' || course[key] === filters[key];
    });
  });

  const getSortDirection = (key) => {
    const config = sortConfigs.find(config => config.key === key);
    return config ? config.direction : 'default';
  };

  const generateExcelReport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('PE Course Records');

    worksheet.columns = [
      { header: 'Course Code', key: 'courseCode', width: 20 },
      { header: 'Course Name', key: 'courseName', width: 25 },
      { header: 'Branch', key: 'branch', width: 15 },
      { header: 'Student Roll No', key: 'rollNumber', width: 15 },
      { header: 'Student Name', key: 'fullName', width: 25 },
      { header: 'Student Branch', key: 'studentBranch', width: 15 },
      { header: 'Section', key: 'section', width: 10 },
    ];

    filteredPeCourses.forEach(course => {
      course.students.forEach(student => {
        worksheet.addRow({
          courseCode: course.courseCode,
          courseName: course.courseName,
          branch: course.branch,
          rollNumber: student.rollNumber,
          fullName: student.fullName,
          studentBranch: student.branch,
          section: student.section,
        });
      });
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PE_Course_Records.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Admin PE Course Records</h1>
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
                    value={getSortDirection('courseCode')}
                    onChange={(e) => handleSortOptionChange('courseCode', e)}
                  >
                    <option value="default">Default</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
                <div>
                  <select
                    value={getSortDirection('courseName')}
                    onChange={(e) => handleSortOptionChange('courseName', e)}
                  >
                    <option value="default">Default</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPeCourses.map((course) =>
              course.students.map((student) => (
                <tr key={`${course.courseCode}-${student.rollNumber}`}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{course.branch}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.section}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{course.courseCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{course.courseName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PEAdminTable;
