import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AcademicTable() {
  const [academicRecords, setAcademicRecords] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updatedGPA, setUpdatedGPA] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAcademicRecords();
  }, []);

  const fetchAcademicRecords = async () => {
    try {
      // console.log("Hi, waiting for records to come");
      const response = await axios.get('/api/v1/academics/studentRecords', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      console.log("Received records:", response.data);
      if (response.data.data.academicRecords) {
        setAcademicRecords(response.data.data.academicRecords);
      } else {
        console.error('Academic records not found in response:', response.data);
        setAcademicRecords([]);
      }
    } catch (error) {
      console.error('Error fetching academic records:', error);
      setAcademicRecords([]);
    }
  };

// COMMENT BELOW *******************************

  // const handleDelete = async () => {
  //   try {
  //     const userData = JSON.parse(localStorage.getItem('user'));
  //     const userId = userData._id;  
  //     await axios.delete(`/api/v1/academics/delete/${userId}`, { 
  //       data: { semester: selectedRecord.semester },
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('accessToken')}`
  //       }
  //     });
  //     fetchAcademicRecords();
  //     setSelectedRecord(null);
  //   } catch (error) {
  //     console.error('Error deleting academic record:', error);
  //   }
  // };

  // const handleUpdate = async () => {
  //   try {
  //     const userData = JSON.parse(localStorage.getItem('user'));
  //     const userId = userData._id;  
  //     const response = await axios.patch(`/api/v1/academics/update/${userId}`, { 
  //       semester: selectedRecord.semester, 
  //       gpa: updatedGPA 
  //     }, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('accessToken')}`
  //       }
  //     });

  //     if (response.data.success) {
  //       fetchAcademicRecords();
  //       setSelectedRecord(null);
  //       setUpdatedGPA('');
  //     } else {
  //       console.error('Failed to update academic record');
  //     }
  //   } catch (error) {
  //     console.error('Error updating academic record:', error);
  //   }
  // };

  // const handleRowClick = (record) => {
  //   setSelectedRecord(record);
  //   setSelectedSemester(record.semester);
  //   setUpdatedGPA(record.gpa);
  // };

// COMMENT ABOVE ********************************
  const handleAdd = () => {
    navigate('/db/academic-form');
  };

  return (
    <div className="overflow-x-auto">
  <h1 className="text-center text-3xl font-bold mb-8">ACADEMIC RECORDS</h1>

  {/* COMMENT BELOW */}
  {/* <div className="flex justify-between mb-4">
    <button onClick={handleDelete} disabled={!selectedRecord} className="bg-red-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300">Delete</button>
    <div>
      <input type="number" value={updatedGPA} onChange={(e) => setUpdatedGPA(e.target.value)} className="mr-2" />
      <button onClick={handleUpdate} disabled={!selectedRecord} className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300">Update</button>
    </div>
  </div> */}
  {/* COMMENT ABOVE */}
  
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-black">
      <tr>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Semester</th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">GPA</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {academicRecords.length > 0 ? (
        academicRecords.map((record, index) => (
          <tr 
          key={record._id} 
          // COMMENT BELOW
          // onClick={() => handleRowClick(record)} 
          // COMMENT ABOVE
          className={record.semester === selectedSemester ? 'bg-gray-200' : ''}>
            <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.semester}</td>
            <td className="px-6 py-4 whitespace-nowrap">{record.gpa}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="3" className="text-center py-4">No academic records found.</td>
        </tr>
      )}
    </tbody>
  </table>
  <div className="flex justify-center mt-8">
    <button onClick={handleAdd} className="bg-green-500 text-white px-4 py-2 rounded-md">Add</button>
  </div>
</div>
  );
}
