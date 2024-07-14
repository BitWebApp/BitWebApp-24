// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import ExcelJS from "exceljs";

// export default function ProjectTable() {
//   const [proj, setProj] = useState([]);
//   const [filteredProj, setFilteredProj] = useState([]);
//   const [domainFilter, setDomainFilter] = useState('');
//   const [techStackFilter, setTechStackFilter] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     fetchProject();
//   }, []);

//   useEffect(() => {
//     let filteredData = proj;

//     if (domainFilter) {
//       filteredData = filteredData.filter(project => project.domain.includes(domainFilter));
//     }

//     if (techStackFilter) {
//       filteredData = filteredData.filter(project => project.techStack.includes(techStackFilter));
//     }

//     setFilteredProj(filteredData);
//   }, [domainFilter, techStackFilter, proj]);

//   const fetchProject = async () => {
//     try {
//       const token = localStorage.getItem("accessToken");
//       console.log(token);
//       const response = await axios.get('/api/v1/project/projectshowing', {
//         withCredentials: true
//       });
//       console.log(response);
//       console.log(response.data.data.name);
//       setProj(response.data.data);
//       setFilteredProj(response.data.data);
//     } catch (error) {
//       console.log(error.message, error);
//     }
//   };

//   // const sortedProject = [...filteredProj].sort((a, b) => {
//   //   const { key, direction } = sortConfig;
//   //   if (!key) return 0;

//   //   let aValue = a[key];
//   //   let bValue = b[key];

//   //   if (typeof aValue === 'string' && typeof bValue === 'string') {
//   //     aValue = aValue.toLowerCase();
//   //     bValue = bValue.toLowerCase();
//   //   }

//   //   if (aValue < bValue) {
//   //     return direction === 'ascending' ? -1 : 1;
//   //   }
//   //   if (aValue > bValue) {
//   //     return direction === 'ascending' ? 1 : -1;
//   //   }
//   //   return 0;
//   // });
//   const sortedProject = [...proj].sort((a, b) => {
//     for (const config of sortConfig) {
//       const key = config.key.split('.');
//       let aValue = a;
//       let bValue = b;

//       for (const part of key) {
//         aValue = aValue ? aValue[part] : null;
//         bValue = bValue ? bValue[part] : null;
//       }

//       if (aValue === null || bValue === null) continue;

//       if (typeof aValue === 'string' && typeof bValue === 'string') {
//         aValue = aValue.toLowerCase();
//         bValue = bValue.toLowerCase();
//       }

//       if (aValue < bValue) {
//         return config.direction === 'ascending' ? -1 : 1;
//       }
//       if (aValue > bValue) {
//         return config.direction === 'ascending' ? 1 : -1;
//       }
//     }
//     return 0;
//   });

//   const filteredProject = sortedProject.filter((proj) => {
//     const query = searchQuery.toLowerCase();
//     return (
//       (proj.name?.fullName?.toLowerCase().includes(query) || '') ||
//       (proj.name?.rollNumber?.toLowerCase().includes(query) || '') ||
//       proj.projectName.toLowerCase().includes(query) ||
//       proj.domain.toLowerCase().includes(query) ||
//       proj.projectLink.toLowerCase().includes(query) ||
//       proj.techStack.toLowerCase().includes(query) ||
//       proj.guide.toLowerCase().includes(query)
//     );
//   });

//   const exportToExcel = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Project Records");

//     worksheet.columns = [
//       {header:"name",key:"name.fullName",width:25},
//       {header:"rollNo",key:"name.rollNumber",width:25},
//       { header: "ProjectName", key: "projectName", width: 25 },
//       { header: "domain", key: "domain", width: 20 },
//       { header: "projectLink", key: "projectLink", width: 25 },
//       { header: "techStack", key: "techStack", width: 15 },
//       { header: "guide", key: "guide", width: 30 },
//       { header: "document", key: "doc", width: 30 }
//     ];

//     filteredProject.forEach((record, index) => {
//       worksheet.addRow({
//         name: record.name.fullName,
//         rollNumber: record.name.rollNumber,
//         projectName: record.projectName,
//         domain: record.domain,
//         projectLink: record.projectLink,
//         techStack: record.techStack,
//         guide: record.guide,
//         doc: record.doc,
//       });
//     });

//     const buffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([buffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "Project_Report.xlsx";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`/api/v1/project/delete/${id}`, {
//         withCredentials: true
//       });
//       fetchProject(); // Refresh the project list after deletion
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

//   const handleSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }

//     const sortedData = [...filteredProj].sort((a, b) => {
//       if (a[key] < b[key]) {
//         return direction === 'ascending' ? -1 : 1;
//       }
//       if (a[key] > b[key]) {
//         return direction === 'ascending' ? 1 : -1;
//       }
//       return 0;
//     });

//     setFilteredProj(sortedData);
//     setSortConfig({ key, direction });
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <input
//         type="text"
//         placeholder="Search..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="mb-4 px-4 py-2 border rounded"
//       />
//       <button
//         onClick={exportToExcel}
//         className="mb-4 mx-4 p-2 bg-blue-500 text-white rounded"
//       >
//         Export to Excel
//       </button>
//       <div className="overflow-x-auto">
//         <h1 className="text-center text-3xl font-bold mb-8">PROJECT DETAILS</h1>
//         <div className="mb-4 flex justify-between">
//           <div>
//             <label>Filter by Domain:</label>
//             <input
//               type="text"
//               value={domainFilter}
//               onChange={(e) => setDomainFilter(e.target.value)}
//               className="ml-2 p-2 border border-gray-300 rounded"
//             />
//           </div>
//           <div>
//             <label>Filter by Tech Stack:</label>
//             <input
//               type="text"
//               value={techStackFilter}
//               onChange={(e) => setTechStackFilter(e.target.value)}
//               className="ml-2 p-2 border border-gray-300 rounded"
//             />
//           </div>
//         </div>
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-black">
//             <tr>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort('projectName')}
//               >
//                 Name
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort('projectName')}
//               >
//                 RollNo.
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort('projectName')}
//               >
//                 Project Name
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort('domain')}
//               >
//                 Domain
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Project Link</th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort('techStack')}
//               >
//                 Tech Stack
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Required Guide</th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Supporting-Doc</th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {filteredProj.length > 0 && filteredProj.map((project, index) => (
//               <tr key={project._id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.name?.fullName}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.name?.rollNumber}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.projectName}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.domain}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.projectLink}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.techStack}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.guide}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   <a href={project.doc} target="_blank" rel="noopener noreferrer">Click Here</a>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   <button
//                     onClick={() => handleDelete(project._id)}
//                     className="text-red-600 hover:text-red-900"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from "exceljs";

export default function ProjectTable() {
  const [proj, setProj] = useState([]);
  const [filteredProj, setFilteredProj] = useState([]);
  const [domainFilter, setDomainFilter] = useState('');
  const [techStackFilter, setTechStackFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [searchQuery, setSearchQuery] = useState("");

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
      const response = await axios.get('/api/v1/project/projectshowing', {
        withCredentials: true
      });
      console.log(response);
      console.log(response.data.data.name);
      setProj(response.data.data);
      setFilteredProj(response.data.data);
    } catch (error) {
      console.log(error.message, error);
    }
  };

  const sortedProject = [...filteredProj].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const keyParts = sortConfig.key.split('.');
    let aValue = a;
    let bValue = b;

    for (const part of keyParts) {
      aValue = aValue ? aValue[part] : null;
      bValue = bValue ? bValue[part] : null;
    }

    if (aValue === null || bValue === null) return 0;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredProject = sortedProject.filter((proj) => {
    const query = searchQuery.toLowerCase();
    return (
      (proj.name?.fullName?.toLowerCase().includes(query) || '') ||
      (proj.name?.rollNumber?.toLowerCase().includes(query) || '') ||
      proj.projectName.toLowerCase().includes(query) ||
      proj.domain.toLowerCase().includes(query) ||
      proj.projectLink.toLowerCase().includes(query) ||
      proj.techStack.toLowerCase().includes(query) ||
      proj.guide.toLowerCase().includes(query)
    );
  });

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Project Records");

    worksheet.columns = [
      { header: "Name", key: "fullName", width: 25 },
      { header: "Roll No", key: "rollNumber", width: 25 },
      { header: "Project Name", key: "projectName", width: 25 },
      { header: "Domain", key: "domain", width: 20 },
      { header: "Project Link", key: "projectLink", width: 25 },
      { header: "Tech Stack", key: "techStack", width: 15 },
      { header: "Guide", key: "guide", width: 30 },
      { header: "Document", key: "doc", width: 30 }
    ];

    filteredProject.forEach((record) => {
      worksheet.addRow({
        fullName: record.name?.fullName,
        rollNumber: record.name?.rollNumber,
        projectName: record.projectName,
        domain: record.domain,
        projectLink: record.projectLink,
        techStack: record.techStack,
        guide: record.guide,
        doc: record.doc,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Project_Report.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/project/delete/${id}`, {
        withCredentials: true
      });
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

    setSortConfig({ key, direction });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 px-4 py-2 border rounded"
      />
      <button
        onClick={exportToExcel}
        className="mb-4 mx-4 p-2 bg-blue-500 text-white rounded"
      >
        Export to Excel
      </button>
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
                onClick={() => handleSort('name.fullName')}
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name.rollNumber')}
              >
                Roll No.
              </th>
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Supporting Doc</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProject.length > 0 && filteredProject.map((project, index) => (
              <tr key={project._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.name?.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.name?.rollNumber}</td>
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
    </div>
  );
}



