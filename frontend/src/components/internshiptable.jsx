import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Internshiptable() {
  const [internData, setInternData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/v1/intern/get-verified-interns');
      setInternData(response.data.data.response);
      setFilteredData(response.data.data.response);
    } catch (error) {
      console.error('Error fetching internship data:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    filterData({ ...filters, [name]: value });
  };

  const filterData = (filters) => {
    let data = internData;
    if (filters.company) {
      data = data.filter(record => record.company.toLowerCase().includes(filters.company.toLowerCase()));
    }
    if (filters.role) {
      data = data.filter(record => record.role.toLowerCase().includes(filters.role.toLowerCase()));
    }
    setFilteredData(data);
  };

  const formatDate = (date) => {
    date = new Date(date);
    const newDate = date.toLocaleDateString("en-IN");
    return newDate;
  };

  return (
    <div className="overflow-x-auto">
      <ToastContainer />
      <h1 className="text-center text-3xl font-bold mb-8">INTERNSHIP RECORDS</h1>

      <div className="mb-4">
        <input
          type="text"
          name="company"
          placeholder="Filter by Company"
          value={filters.company}
          onChange={handleFilterChange}
          className="mr-2 p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="role"
          placeholder="Filter by Role"
          value={filters.role}
          onChange={handleFilterChange}
          className="mr-2 p-2 border border-gray-300 rounded"
        />
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-black">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              #
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Roll Number
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Company
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Starting Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Ending Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Supporting-Doc
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.student.rollNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.company}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.role}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.startDate)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.endDate)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a href={record.doc} target="_blank" rel="noopener noreferrer">View</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
