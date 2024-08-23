import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

export default function InternshipForm() {
  
  const [company, setCompany] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [idCard, setIdCard] = useState(null);
  const [spin, setSpin] = useState(false);

  const navigate = useNavigate();
  
  const companyList = [
    "Google", "Microsoft", "Apple", "Amazon", "Meta (Facebook)", "Netflix", 
    "IBM", "Oracle", "Intel", "Cisco", "NVIDIA", "Qualcomm", "Broadcom", 
    "Texas Instruments", "Visa", "Mastercard", "PayPal", "Stripe", 
    "Salesforce", "Wells Fargo", "Uber", "Atlassian", "Fastenal", 
    "Walmart Global Tech", "Intuit", "Sprinkler", "NPCI", "Others"
  ];

  const roleList = [
    "Software Engineer Intern", "Frontend Developer Intern", "Backend Developer Intern", 
    "Full Stack Developer Intern", "Data Science Intern", "Data Analyst Intern", 
    "Machine Learning Intern", "Cloud Engineer Intern", "DevOps Intern", 
    "Cybersecurity Intern", "Information Security Intern", "Product Management Intern", 
    "Systems Engineer Intern", "R&D Intern", "Quality Assurance Intern", "UI/UX Design Intern"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const documentLink = idCard ? `<a href="${URL.createObjectURL(idCard)}" target="_blank" style="margin-top: 10px;">(Click to View)</a>` : '';

    const htmlContent = `
      <div style="text-align: left; padding: 20px;">
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Company:</strong> ${company}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Role:</strong> ${role}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Start Date:</strong> ${startDate}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>End Date:</strong> ${endDate}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Supporting Document:</strong> ${documentLink}
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
        const tokenString = localStorage.getItem('user');
        const token = JSON.parse(tokenString);
        try {
          const formData = new FormData();
          formData.append('company', company);
          formData.append('role', role);
          formData.append('startDate', startDate);
          formData.append('endDate', endDate);
          formData.append('doc', idCard);
          formData.append('studentid', token._id);

          const response = await axios.post("/api/v1/intern/addinternship", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          });
          toast.success("Data uploaded successfully!");
          setTimeout(() => {
            window.location.reload()
          }, 2000);
        } catch (err) {
          toast.error("Error uploading data!");
        } finally {
          setSpin(false);
        }
      }
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <ToastContainer />
      <div className="w-full flex flex-col p-10 justify-between">
        <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Internship Form</h3>
            <p className="text-base mb-2">Enter Your details.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Company</label>
              <select 
                value={company}
                onChange={(e) => {
                  const select = e.target.value;
                  setCompany(select);
                  setNewCompany(select);
                }} 
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none">
                {companyList.map((val, index) => (
                  <option key={index} value={val}>{val}</option>
                ))}
              </select>
              {newCompany === "Others" && (
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Type the company name"
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                />
              )}
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              >
                {roleList.map((val, index) => (
                  <option key={index} value={val}>{val}</option>
                ))}
              </select>
              <label>Start Date</label>
              <input
                type="date"
                placeholder="Enter Your Starting Date"
                value={startDate}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label>End Date</label>
              <input
                type="date"
                placeholder="Enter Your End Date"
                value={endDate}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setEndDate(e.target.value)}
              />
              <label className="mt-4">Upload Your ID Card</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setIdCard(e.target.files[0])}
              />
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
