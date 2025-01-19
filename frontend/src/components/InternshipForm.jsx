import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

export default function InternshipForm() {
  const [internshipType, setInternshipType] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [mentor, setMentor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [idCard, setIdCard] = useState(null);
  const [spin, setSpin] = useState(false);

  const companyList = [
    "Google", "Microsoft", "Apple", "Amazon", "Meta (Facebook)", "Netflix", 
    "IBM", "Oracle", "Intel", "Cisco", "NVIDIA", "Qualcomm", "Broadcom", 
    "Visa", "Mastercard", "PayPal", "Stripe", "Salesforce"
  ];

  const roleList = [
    "Software Engineer Intern", "Frontend Developer Intern", 
    "Backend Developer Intern", "Data Science Intern"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!internshipType || !location || !startDate || !endDate || 
        (internshipType === "Industrial Internship" && (!company || !role)) || 
        (internshipType === "Research Project" && !mentor) || 
        (location === "Outside BIT" && !idCard)) {
      toast.error("Please fill in all the required fields!");
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to submit the form?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSpin(true);
        try {
          const formData = new FormData();
          formData.append('type', internshipType);
          formData.append('location', location);
          formData.append('company', company);
          formData.append('role', role);
          formData.append('mentor', mentor);
          formData.append('startDate', startDate);
          formData.append('endDate', endDate);
          formData.append('doc', idCard);

          await axios.post("/api/v1/intern/addinternship", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          toast.success("Form submitted successfully!");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          toast.error("Submission failed!");
        } finally {
          setSpin(false);
        }
      }
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <ToastContainer />
      <div className="w-full flex flex-col p-10">
        <h3 className="text-3xl font-semibold mb-6">Internship/Research Form</h3>
        <form onSubmit={handleSubmit}>
          <label>Type</label>
          <select
            value={internshipType}
            onChange={(e) => setInternshipType(e.target.value)}
            className="w-full py-2 my-2 border-b border-black"
          >
            <option value="" disabled>Select Type</option>
            <option value="Industrial Internship">Industrial Internship</option>
            <option value="Research Project">Research Project</option>
          </select>

          <label>Location</label>
          <div className="my-2">
            <label>
              <input
                type="radio"
                value="Inside BIT"
                checked={location === "Inside BIT"}
                onChange={(e) => setLocation(e.target.value)}
              />
              Inside BIT
            </label>
            <label className="ml-4">
              <input
                type="radio"
                value="Outside BIT"
                checked={location === "Outside BIT"}
                onChange={(e) => setLocation(e.target.value)}
              />
              Outside BIT
            </label>
          </div>

          {internshipType === "Industrial Internship" && (
            <>
              <label>Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full py-2 my-2 border-b border-black"
              >
                <option value="" disabled>Select Company</option>
                {companyList.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>

              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full py-2 my-2 border-b border-black"
              >
                <option value="" disabled>Select Role</option>
                {roleList.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </>
          )}

          {internshipType === "Research Project" && (
            <>
              <label>Mentor Name</label>
              <input
                type="text"
                value={mentor}
                onChange={(e) => setMentor(e.target.value)}
                className="w-full py-2 my-2 border-b border-black"
              />
            </>
          )}

          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full py-2 my-2 border-b border-black"
          />

          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full py-2 my-2 border-b border-black"
          />

          {location === "Outside BIT" && (
            <>
              <label>Upload Supporting Document</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setIdCard(e.target.files[0])}
                className="w-full py-2 my-2 border-b border-black"
              />
            </>
          )}

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {spin ? <ClipLoader color="white" size={20} /> : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
