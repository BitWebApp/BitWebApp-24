import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

export default function InterviewForm() {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [ctc, setCtc] = useState("");
  const [stipend, setStipend] = useState("");
  const [cgpaCriteria, setCgpaCriteria] = useState("");
  const [experiences, setExperiences] = useState([""]);
  const [referenceLinks, setReferenceLinks] = useState([""]);
  const [spin, setSpin] = useState(false);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/v1/users/get-user-companies");
        setCompanies(response.data.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch company list!");
      }
    };

    fetchCompanies();
  }, []);

  const handleAddExperience = () => {
    setExperiences([...experiences, ""]);
  };

  const handleAddReferenceLink = () => {
    setReferenceLinks([...referenceLinks, ""]);
  };

  const handleExperienceChange = (index, value) => {
    const newExperiences = [...experiences];
    newExperiences[index] = value;
    setExperiences(newExperiences);
  };

  const handleReferenceLinkChange = (index, value) => {
    const newReferenceLinks = [...referenceLinks];
    newReferenceLinks[index] = value;
    setReferenceLinks(newReferenceLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedCompany = companies.find(
      (company) => company.companyName === companyName
    );
    if (!selectedCompany) {
      toast.error("Please select a valid company!");
      return;
    }

    const experiencesHtml = experiences
      .map((exp, index) => `
        <p style="font-size: 16px; margin: 5px 0; color: #333;">
          <strong>Experience ${index + 1}:</strong><br>
          ${exp}
        </p>
      `)
      .join('');

    const referenceLinksHtml = referenceLinks
      .map((link, index) => `
        <p style="font-size: 16px; margin: 5px 0; color: #333;">
          <strong>Reference Link ${index + 1}:</strong><br>
          <a href="${link}" target="_blank">${link}</a>
        </p>
      `)
      .join('');

    const htmlContent = `
      <div style="text-align: left; padding: 20px; max-height: 70vh; overflow-y: auto;">
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Company Name:</strong> ${companyName}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Role:</strong> ${role}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>CTC:</strong> ${ctc || 'Not specified'}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Stipend:</strong> ${stipend || 'Not specified'}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>CGPA Criteria:</strong> ${cgpaCriteria || 'Not specified'}
        </p>
        <div style="margin: 15px 0; border-top: 1px solid #eee; padding-top: 10px;">
          <strong style="font-size: 18px; color: #333;">Experiences:</strong>
          ${experiencesHtml}
        </div>
        <div style="margin: 15px 0; border-top: 1px solid #eee; padding-top: 10px;">
          <strong style="font-size: 18px; color: #333;">Reference Links:</strong>
          ${referenceLinksHtml}
        </div>
      </div>
    `;

    Swal.fire({
      title: "Review Your Submission",
      html: htmlContent,
      icon: "info",
      width: '800px',
      showCancelButton: true,
      confirmButtonText: "Yes, submit it!",
      cancelButtonText: "No, cancel!",
      buttonsStyling: true,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        setSpin(true);
        try {
          const payload = {
            companyId: selectedCompany._id,
            role,
            interviewYear: "2024",
            cgpa: cgpaCriteria,
            ctc,
            stipend,
            experience: experiences,
            referenceMaterialLinks: referenceLinks
          };

          const response = await axios.post(
            "/api/v1/users/add-interview-exp",
            payload,
            {
              headers: {
                "Content-Type": "application/json"
              },
            }
          );

          if (response.data.success) {
            toast.success("Interview experience shared successfully!");
            setCompanyName("");
            setRole("");
            setCtc("");
            setStipend("");
            setCgpaCriteria("");
            setExperiences([""]);
            setReferenceLinks([""]);
          } else {
            toast.error(
              response.data.message || "Failed to submit interview experience!"
            );
          }
        } catch (err) {
          console.error("Error submitting form:", err);
          toast.error(err.response?.data?.message || "Error uploading data!");
        } finally {
          setSpin(false);
        }
      },
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <ToastContainer />
      <div className="w-full flex flex-col p-10 justify-between">
        <h3 className="text-xl text-black font-semibold">BITACADEMIA</h3>
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">
              Share Your Interview Experience
            </h3>
            <p className="text-base mb-2">Please enter your details below.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Company Name</label>
              <select
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              >
                <option value="">Select a company</option>
                {companies.map((company, index) => (
                  <option key={index} value={company.companyName}>
                    {company.companyName}
                  </option>
                ))}
              </select>

              <label>Role</label>
              <input
                type="text"
                placeholder="Enter the role offered"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />

              <label>CTC</label>
              <input
                type="text"
                placeholder="Enter the CTC (if applicable)"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />

              <label>Stipend</label>
              <input
                type="text"
                placeholder="Enter the internship stipend (if applicable)"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />

              <label>CGPA Criteria</label>
              <input
                type="text"
                placeholder="Enter the CGPA criteria (if applicable)"
                value={cgpaCriteria}
                onChange={(e) => setCgpaCriteria(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />

              {experiences.map((experience, index) => (
                <div key={index} className="mb-4">
                  <label>Round {index + 1} Experience</label>
                  <textarea
                    placeholder="Describe your interview experience"
                    value={experience}
                    onChange={(e) => handleExperienceChange(index, e.target.value)}
                    className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  ></textarea>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddExperience}
                className="py-2 px-4 text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 mb-4"
              >
                Add More Experience
              </button>

              {referenceLinks.map((link, index) => (
                <div key={index} className="mb-4">
                  <label>Reference Link {index + 1}</label>
                  <input
                    type="text"
                    placeholder="Enter the Reference Link"
                    value={link}
                    onChange={(e) => handleReferenceLinkChange(index, e.target.value)}
                    className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddReferenceLink}
                className="py-2 px-4 text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 mb-4"
              >
                Add More Reference Links
              </button>
            </div>

            <div className="flex flex-row w-full mt-4">
              <button
                type="submit"
                className="w-full py-2 px-4 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
              >
                {spin ? <ClipLoader color="white" size={20} /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}