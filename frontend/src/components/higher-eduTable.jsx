import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HigherEduTable() {
  const [higherEduData, setHigherEduData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/v1/higher-education');
      setHigherEduData(response.data.data);
    } catch (error) {
      console.error('Error fetching higher education data:', error);
    }
  };

  if (higherEduData.length === 0) {
    return <div>NO HIGHER EDUCATION RECORDS!</div>;
  }

  return (
    <div className="overflow-x-auto">
      <h1 className="text-center text-3xl font-bold mb-8">HIGHER EDUCATION DETAILS</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-black">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              #
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Institution
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Degree
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Field of Study
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Start Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              End Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Supporting-Doc
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {higherEduData.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.institution}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.degree}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.fieldOfStudy}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.startDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.endDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.supportingDoc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}