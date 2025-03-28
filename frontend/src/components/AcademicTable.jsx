import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AcademicTable() {
  const [academicRecords, setAcademicRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'semester', direction: 'asc' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAcademicRecords();
  }, []);

  const fetchAcademicRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/academics/studentRecords', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.data.data?.academicRecords) {
        setAcademicRecords(response.data.data.academicRecords);
      } else {
        console.error('Academic records not found in response');
        setAcademicRecords([]);
      }
    } catch (error) {
      console.error('Error fetching academic records:', error);
      toast.error('Failed to load academic records');
      setAcademicRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/db/academic-form');
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRecords = [...academicRecords].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredRecords = sortedRecords;

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="ml-1 text-blue-500" /> : 
      <FaSortDown className="ml-1 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl font-bold text-white">Academic Records</h1>
                <p className="text-blue-100">View and manage your academic performance</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAdd}
                  className="flex items-center bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md shadow-sm"
                >
                  <FaPlus className="mr-2" /> Add Record
                </button>
              </div>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <ClipLoader color="#3B82F6" size={40} />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('semester')}
                    >
                      <div className="flex items-center">
                        Semester
                        {getSortIcon('semester')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('gpa')}
                    >
                      <div className="flex items-center">
                        GPA
                        {getSortIcon('gpa')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record, index) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Semester {record.semester}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">
                            {record.gpa}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                        {academicRecords.length === 0 ? 
                          "No academic records found. Add your first record!" : 
                          "No records match your search criteria"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Stats */}
          {academicRecords.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap justify-between items-center">
                <div className="mb-2 sm:mb-0">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-medium">{filteredRecords.length}</span> of{' '}
                    <span className="font-medium">{academicRecords.length}</span> records
                  </p>
                </div>
                {academicRecords.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Highest GPA</p>
                      <p className="text-lg font-bold text-green-600">
                        {Math.max(...academicRecords.map(r => parseFloat(r.gpa))).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Average GPA</p>
                      <p className="text-lg font-bold text-blue-600">
                        {(
                          academicRecords.reduce((sum, record) => sum + parseFloat(record.gpa), 0) / 
                          academicRecords.length
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}