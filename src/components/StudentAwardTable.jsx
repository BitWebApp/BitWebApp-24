import axios from 'axios';
import React, { useState, useEffect } from 'react'

const StudentAwardTable = () => {
  const [awardData, setAwardData] = useState([]);
  useEffect(() =>{
    fetchData();
  },[])
  const fetchData = async () => {
    try {
      const user = localStorage.getItem('user');
      const userId = JSON.parse(user)._id;
      // console.log(userId);
      const response = await axios.get(`/api/v1/awards/${userId}`);
      setAwardData(response.data.data);
    } catch (error) {
      console.error("Error fetching award data:", error);
    }
  };

  if (awardData.length === 0) {
    return <div>NO AWARDS AND ACHIEVEMENTS RECORDS!</div>;
  }

  return (
    <div className="overflow-x-auto">
      <h1 className="text-center text-3xl font-bold mb-8">
        AWARDS AND ACHIEVEMENTS
      </h1>
      <table className="min-w-full divide-y divide-gray-200">
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
              Title
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Description
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Student
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Doc
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {awardData.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.student.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <a
                  className="underline text-gray-800"
                  href={record.doc}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CLICK HERE
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentAwardTable;
