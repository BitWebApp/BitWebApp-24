import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AcademicTable() {
  const [academicRecords, setAcademicRecords] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updatedGPA, setUpdatedGPA] = useState('');
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false); // Track final submission status
  const navigate = useNavigate();

  useEffect(() => {
    fetchAcademicRecords();
  }, []);

  const fetchAcademicRecords = async () => {
    try {
      console.log("Hi, waiting for records to come");
      const response = await axios.get('/api/v1/academics/studentRecords', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      console.log("Received records:", response.data);
      if (response.data.data.academicRecords) {
        setAcademicRecords(response.data.data.academicRecords);
        setIsFinalSubmitted(response.data.data.isFinalSubmitted); // Assuming the final submission status is returned
      } else {
        console.error('Academic records not found in response:', response.data);
        setAcademicRecords([]);
      }
    } catch (error) {
      console.error('Error fetching academic records:', error);
      setAcademicRecords([]);
    }
  };

  const handleDelete = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userId = userData._id;  
      await axios.delete(`/api/v1/academics/delete/${userId}`, { 
        data: { semester: selectedRecord.semester },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      fetchAcademicRecords();
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error deleting academic record:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userId = userData._id;  
      const response = await axios.patch(`/api/v1/academics/update/${userId}`, { 
        semester: selectedRecord.semester, 
        gpa: updatedGPA 
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.success) {
        fetchAcademicRecords();
        setSelectedRecord(null);
        setUpdatedGPA('');
      } else {
        console.error('Failed to update academic record');
      }
    } catch (error) {
      console.error('Error updating academic record:', error);
    }
  };

  const handleRowClick = (record) => {
    if (!isFinalSubmitted) { // Prevent selection if final submission is made
      setSelectedRecord(record);
      setSelectedSemester(record.semester);
      setUpdatedGPA(record.gpa);
    }
  };

  const handleAdd = () => {
    if (!isFinalSubmitted) { 
      navigate('/db/academic-form');
    }
  };

  const handleFinalSubmit = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to modify your data after this submission!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Submitted!',
          'Your academic records have been submitted.',
          'success'
        );
        setIsFinalSubmitted(true);
        // Optionally, notify the backend about the final submission
        notifyFinalSubmission();
      }
    });
  };

  const notifyFinalSubmission = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userId = userData._id;  
      await axios.post(`/api/v1/academics/finalSubmit/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (error) {
      console.error('Error notifying final submission:', error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-center text-3xl font-bold mb-8">ACADEMIC RECORDS</h1>
      <div className="flex justify-between mb-4">
        <button onClick={handleDelete} disabled={!selectedRecord || isFinalSubmitted} className="bg-red-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300">Delete</button>
        <div>
          <input type="number" value={updatedGPA} onChange={(e) => setUpdatedGPA(e.target.value)} className="mr-2" disabled={isFinalSubmitted} />
          <button onClick={handleUpdate} disabled={!selectedRecord || isFinalSubmitted} className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300">Update</button>
        </div>
      </div>
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
              <tr key={record._id} onClick={() => handleRowClick(record)} className={record.semester === selectedSemester ? 'bg-gray-200' : ''}>
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
        <button onClick={handleAdd} className="bg-green-500 text-white px-4 py-2 rounded-md mr-2" disabled={isFinalSubmitted}>Add</button>
        <button onClick={handleFinalSubmit} className="bg-red-500 text-white px-4 py-2 rounded-md" disabled={isFinalSubmitted}>Final Submit</button>
      </div>
    </div>
  );
}
