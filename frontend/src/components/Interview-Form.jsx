import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

export default function InterviewForm() {
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [ctc, setCtc] = useState('');
  const [stipend, setStipend] = useState('');
  const [cgpaCriteria, setCgpaCriteria] = useState('');
  const [experience, setExperience] = useState('');
  const [document, setDocument] = useState(null);
  const [refLinks,setrefLinks] = useState(null);
  const [spin, setSpin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const documentLink = document
      ? `<a href="${URL.createObjectURL(document)}" target="_blank" style="margin-top: 10px;">(Click to View)</a>`
      : '';

    const htmlContent = `
      <div style="text-align: left; padding: 20px;">
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Company Name:</strong> ${companyName}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Role:</strong> ${role}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>CTC:</strong> ${ctc}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Stipend:</strong> ${stipend}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>CGPA Criteria:</strong> ${cgpaCriteria}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Experience:</strong> ${experience}
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
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        setSpin(true);
        try {
          // Simulate API request here
          await new Promise((resolve) => setTimeout(resolve, 2000));
          toast.success('Data uploaded successfully!');
        } catch (err) {
          toast.error('Error uploading data!');
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
            <h3 className="text-3xl font-semibold mb-4">Share Your Interview Experience</h3>
            <p className="text-base mb-2">Please enter your details below.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Company Name</label>
              <input
                type="text"
                placeholder="Enter the company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
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
              <label>Experience</label>
              <textarea
                placeholder="Describe your interview experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              ></textarea>
                  <label>Reference Links</label>
              <input
                type="text"
                placeholder="Enter the Reference Links"
                value={refLinks}
                onChange={(e) => setrefLinks(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label className="mt-4">Upload Supporting Document</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setDocument(e.target.files[0])}
              />
            </div>
            <div className="flex flex-row w-full mt-4">
              <button
                type="submit"
                className="w-full py-2 px-4 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
              >
                {spin ? <ClipLoader color="white" size={20} /> : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
