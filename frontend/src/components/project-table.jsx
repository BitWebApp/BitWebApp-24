import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProjectTable() {
  const [proj, setProj] = useState([]);
  const [filteredProj, setFilteredProj] = useState([]);
  const [domainFilter, setDomainFilter] = useState('');
  const [techStackFilter, setTechStackFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  useEffect(() => {
    fetchProject();
  }, []);

  useEffect(() => {
    let filteredData = proj;

    if (domainFilter) {
      filteredData = filteredData.filter(project => project.domain.includes(domainFilter));
    }

    if (techStackFilter) {
      filteredData = filteredData.filter(project => project.techStack.includes(techStackFilter));
    }

    setFilteredProj(filteredData);
  }, [domainFilter, techStackFilter, proj]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      console.log(token);
      const response = await axios.get('/api/v1/project/projectshowing');
      console.log(response);
      setProj(response.data.data);
      setFilteredProj(response.data.data);
    } catch (error) {
      console.log(error.message, error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/project/delete`);
      fetchProject(); // Refresh the project list after deletion
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedData = [...filteredProj].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredProj(sortedData);
    setSortConfig({ key, direction });
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-center text-3xl font-bold mb-8">PROJECT DETAILS</h1>
      <div className="mb-4 flex justify-between">
        <div>
          <label>Filter by Domain:</label>
          <input
            type="text"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="ml-2 p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label>Filter by Tech Stack:</label>
          <input
            type="text"
            value={techStackFilter}
            onChange={(e) => setTechStackFilter(e.target.value)}
            className="ml-2 p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-black">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('projectName')}
            >
              Project Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('domain')}
            >
              Domain
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Project Link</th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('techStack')}
            >
              Tech Stack
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Required Guide</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Supporting-Doc</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredProj.length > 0 && filteredProj.map((project, index) => (
            <tr key={project._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.projectName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.domain}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.projectLink}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.techStack}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.guide}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a href={project.doc} target="_blank" rel="noopener noreferrer">Click Here</a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleDelete(project._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

