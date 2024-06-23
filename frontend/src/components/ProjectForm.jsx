import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';

export default function ProjectForm() {
  const [projectName, setProjectName] = useState("");
  const [domain, setDomain] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [techStack, setTechStack] = useState("");
  const [guide, setGuide] = useState("");
  const [idCard, setIdCard] = useState(null);
  const [spin, setSpin] = useState(false);
  const [proj, setProj] = useState([]);
  const [editId, setEditId] = useState(null);
  

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const documentLink = idCard ? `<a href="${URL.createObjectURL(idCard)}" target="_blank" style=" margin-top: 10px;">(Click to View)</a>` : '';

    const htmlContent = `
      <div style="text-align: left; padding: 20px;">
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Project Name:</strong> ${projectName}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Domain:</strong> ${domain}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Project Link:</strong> ${projectLink}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Tech Stack:</strong> ${techStack}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Guide:</strong> ${guide}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Project:</strong> ${documentLink}
        </p>
        <br/>
      </div>
      <p style="font-size: 17px; color: #666;">
          Do you want to submit the form?
        </p>
    `;

    Swal.fire({
      title: 'Are you sure?',
      html: htmlContent,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel!',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        setSpin(true);
        try {
          const formData = new FormData();
          formData.append('projectName', projectName);
          formData.append('domain', domain);
          formData.append('projectLink', projectLink);
          formData.append('techStack', techStack);
          formData.append('guide', guide);
          formData.append('projectId', idCard);

          let response;

          if (editId) {
            response = await axios.put(`/api/v1/project/edit`, formData);
          } else {
            response = await axios.post("/api/v1/project/projectCreate", formData);
          }

          toast.success("Data uploaded successfully!");
          setTimeout(() => {
            navigate("/db");
          }, 2000);
        } catch (err) {
          console.log(err);
          toast.error("Error uploading data!");
        } finally {
          setSpin(false);
          fetchProject();
          clearForm();
        }
      }
    });
  };
  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
    //   const token = localStorage.getItem("accessToken");
    //   const useridString=localStorage.getItem('user');

    //   const userid_get=JSON.parse(useridString);

    //  console.log(localStorage);
    //   const userid=userid_get._id;
    
      const response = await axios.get(`/api/v1/project/show`);
      setProj(response.data.data);
    } catch (error) {
      console.log(error.message, error);
    }
  };

  const handleEdit = (project) => {
    setProjectName(project.projectName);
    setDomain(project.domain);
    setProjectLink(project.projectLink);
    setTechStack(project.techStack);
    setGuide(project.guide);
    setEditId(project._id);
  };

  const clearForm = () => {
    setProjectName("");
    setDomain("");
    setProjectLink("");
    setTechStack("");
    setGuide("");
    setIdCard(null);
    setEditId(null);
  };

  return (
    <>
      <div className="w-full min-h-screen flex justify-center items-center">
        <div className="w-full flex flex-col p-10 justify-between">
          <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
          <div className="w-full flex flex-col">
            <div className="flex flex-col w-full mb-5">
              <h3 className="text-3xl font-semibold mb-4">Project Form</h3>
              <p className="text-base mb-2">Enter Project details.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="w-full flex flex-col">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="Enter Your Project Name"
                  value={projectName}
                  required
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <label>Domain</label>
                <input
                  type="text"
                  placeholder="Enter the domain"
                  value={domain}
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setDomain(e.target.value)}
                />
                <label>Project Link</label>
                <input
                  type="text"
                  placeholder="Enter Your Project Link"
                  value={projectLink}
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setProjectLink(e.target.value)}
                />
                <label>Enter Tech Stack</label>
                <input
                  type="text"
                  placeholder="Enter Your Tech Stack"
                  value={techStack}
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setTechStack(e.target.value)}
                />
                <label>Enter The Required Guide</label>
                <input
                  type="text"
                  placeholder="Enter The Required Guide"
                  value={guide}
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setGuide(e.target.value)}
                />
                <label className="block text-l mb-2">Upload The Project</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => setIdCard(e.target.files[0])}
                />
                <div className="h-5"></div>
              </div>
              <div className="h-8"></div>
              <div className="w-full flex flex-col my-4">
                <button
                  type="submit"
                  className="bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"
                >
                  {spin ? <ClipLoader /> : editId ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
            <div className="w-full items-center justify-center flex">
              <p className="text-sm font-normal text-black">
                <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
                  <Link to="/db">Go back to Dashboard</Link>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Domain
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project Link
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tech Stack
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Guide
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
            {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Edit
            </th> */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {proj.length > 0 && proj.map((project, index) => (
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
              {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => handleEdit(project)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

