import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export default function PlacementTable() {
  const [placementData, setPlacementData] = useState([]);
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/users/placementDetails');
      setPlacementData(response.data.data);
    } catch (error) {
      console.error('Error fetching placement data:', error);
    } finally{
      setLoading(false)
    }
  };

  if(loading) {
    return <div className='h-screen flex justify-center items-center'>
      <ClipLoader size={42} />
    </div>;
  }

  if (placementData.length === 0) {
    return <div>NO PLACEMENT RECORDS!</div>;
  }

  return (
    <div className="overflow-x-auto">
      <h1 className="text-center text-3xl font-bold mb-8">PLACEMENT RECORDS</h1>
      <div className="flex justify-center">
        <table className="w-full max-w-4xl divide-y divide-gray-200">
          <thead className="bg-black">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Full Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Roll Number
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Placement One
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Placement Two
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Placement Three
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {placementData.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.rollNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.placementOne ? `${record.placementOne.company} - ${record.placementOne.ctc}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.placementTwo ? `${record.placementTwo.company} - ${record.placementTwo.ctc}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.placementThree ? `${record.placementThree.company} - ${record.placementThree.ctc}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}