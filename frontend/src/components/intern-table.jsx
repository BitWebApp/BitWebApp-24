import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InternTable() {
  const [internData, setInternData] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/v1/intern/get-all-interns');
      setInternData(response.data.data.response);
      console.log(response);
    } catch (error) {
      console.error('Error fetching internship data:', error);
    }
  };

  if (internData.length === 0) {
    return <div>NO INTERNSHIP RECORDS!</div>;
  }

  const formatDate = (date) => {
    date = new Date(date);
    const newDate = date.toLocaleDateString("en-IN");
    console.log(newDate);
    return newDate;
  };

  const handleVerify = async (internid) => {
    try {
      const response = await axios.post('/api/v1/intern/verify-intern', {
        internid
      });
      if (response.data.success) {
        toast.success("Verified successfully");
        setTimeout(() =>{
          window.location.reload()
        }, 2000)
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Error verifying intern");
    }
  };

  return (
    <div className="overflow-x-auto">
      <ToastContainer />
      <h1 className="text-center text-3xl font-bold mb-8">INTERNSHIP RECORDS</h1>
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
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Verify Intern
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {internData.map((record, index) => (
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => handleVerify(record._id)}
                  className='p-2 bg-green-500 text-white rounded-lg font-bold'
                >
                  Verify
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
