import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const PEAdminTable = () => {
  const [studentsMap, setStudentsMap] = useState([]);
  const [batch, setBatch] = useState('');

  useEffect(() => {
    const fetchPeCourses = async (batchParam = '') => {
      try {
        const url = batchParam ? `/api/v1/pe/get-all?batch=${batchParam}` : '/api/v1/pe/get-all';
        const response = await axios.get(url);
        if (response.data && response.data.data) {
          processStudentData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching PE courses:', error);
      }
    };

    fetchPeCourses(batch);
  }, []);

  useEffect(() => {
    // refetch when batch changes
    const fetchOnBatchChange = async () => {
      try {
        const url = batch ? `/api/v1/pe/get-all?batch=${batch}` : '/api/v1/pe/get-all';
        const response = await axios.get(url);
        if (response.data && response.data.data) {
          processStudentData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching PE courses on batch change:', error);
      }
    };
    fetchOnBatchChange();
  }, [batch]);

  const processStudentData = (courses) => {
    const map = {};

    courses.forEach((course) => {
      const { courseCode, courseName, type, students } = course;

      students.forEach((student) => {
        const { rollNumber, fullName, branch, section } = student;

        if (!map[rollNumber]) {
          map[rollNumber] = {
            rollNumber,
            fullName,
            branch,
            section,
            pe4: { courseCode: '', courseName: '' },
            pe5: { courseCode: '', courseName: '' },
          };
        }

        if (type.toLowerCase() === 'pe4') {
          map[rollNumber].pe4 = { courseCode, courseName };
        } else if (type.toLowerCase() === 'pe5') {
          map[rollNumber].pe5 = { courseCode, courseName };
        }
      });
    });

    setStudentsMap(Object.values(map));
  };

  const handleExport = () => {
    const exportData = studentsMap.map((student) => ({
      'Roll No': student.rollNumber,
      'Full Name': student.fullName,
      'Branch': student.branch,
      'Section': student.section,
      'PE4 Course Code': student.pe4.courseCode,
      'PE4 Course Name': student.pe4.courseName,
      'PE5 Course Code': student.pe5.courseCode,
      'PE5 Course Name': student.pe5.courseName,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PE_Courses');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(data, 'PE_Course_Records.xlsx');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin PE Course Records</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm">Batch:</label>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={2} className="px-4 py-2 border">Roll No</th>
              <th rowSpan={2} className="px-4 py-2 border">Full Name</th>
              <th rowSpan={2} className="px-4 py-2 border">Branch</th>
              <th rowSpan={2} className="px-4 py-2 border">Section</th>
              <th colSpan={2} className="px-4 py-2 border text-center">PE4</th>
              <th colSpan={2} className="px-4 py-2 border text-center">PE5</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Course Code</th>
              <th className="px-4 py-2 border">Course Name</th>
              <th className="px-4 py-2 border">Course Code</th>
              <th className="px-4 py-2 border">Course Name</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {studentsMap.map((student) => (
              <tr key={student.rollNumber}>
                <td className="px-4 py-2 border">{student.rollNumber}</td>
                <td className="px-4 py-2 border capitalize">{student.fullName}</td>
                <td className="px-4 py-2 border capitalize">{student.branch}</td>
                <td className="px-4 py-2 border">{student.section}</td>
                <td className="px-4 py-2 border">{student.pe4.courseCode}</td>
                <td className="px-4 py-2 border">{student.pe4.courseName}</td>
                <td className="px-4 py-2 border">{student.pe5.courseCode}</td>
                <td className="px-4 py-2 border">{student.pe5.courseName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PEAdminTable;
