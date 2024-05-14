import React from 'react';

export default function StudentTable() {
  return (
    <div className="overflow-x-auto">
       <h1 className="text-center text-3xl font-bold mb-8">STUDENT DETAILS</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-black">
          <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Username</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Password</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Full Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Roll Number</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Id Card</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Branch</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Section</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Mobile Number</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Semester</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Is Verified</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mark</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Otto</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">@mdo</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">hello</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jacob</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Thornton</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">@fat</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">@fat</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">@fat</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">@fat</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">@fat</td>
          </tr>
        
        </tbody>
      </table>
    </div>
  );
}
