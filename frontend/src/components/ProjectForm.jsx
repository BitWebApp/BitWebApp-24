import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ProjectForm() {
  const [projectName, setProjectName] = useState("");
  const [domain, setDomain] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [techStack, setTechStack] = useState("");
  const [guide, setGuide] = useState("");
  const [idCard, setIdCard] = useState(null); // Ensure this is null initially
  const [spin, setSpin] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSpin(true);
    const tokenString = localStorage.getItem('user');
    const token = JSON.parse(tokenString);
    console.log(token._id);
    try {
      const formData = new FormData();
      formData.append('projectName', projectName);
      formData.append('domain', domain);
      formData.append('projectLink', projectLink);
      formData.append('techStack', techStack);
      formData.append('guide', guide);
      formData.append('projectId', idCard);
      // formData.append('student', token._id);

      const response = await axios.post("/api/v1/project/projectCreate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      toast.success("Data uploaded successfully!");
      setTimeout(() => {
        navigate("/db");
      }, 2000);
    } catch (err) {
      console.log(err);
      toast.error("Error uploading data!");
    } finally {
      setSpin(false);
    }
  };

  return (
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
                required
              />
              <div className="h-5"></div>
            </div>
            <div className="h-8"></div>
            <div className="w-full flex flex-col my-4">
              <button
                type="submit"
                className="bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"
              >
                Submit
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
  );
}
