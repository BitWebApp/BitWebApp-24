import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';

export default function InternshipForm() {
  
  const [company, setCompany] = useState("");
  const [newCompany,setNewCompany]=useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [idCard, setIdCard] = useState(null); // Ensure this is null initially
  const [spin, setSpin] = useState(false);

  const navigate = useNavigate();
  const companyList=["google","Atlassian","Microsoft","Texas Instruments","Wells Fargo","Visa","Cisco","Intuit","NPCI","Walmart Global Tech","SalesForce","PayPal","Fastenal","Uber","Sprinkler","Others"]
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
      console.log(token._id);
      try {
        const formData = new FormData();
        formData.append('company', company);
        formData.append('role', role);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('doc', idCard);
        formData.append('studentid',token._id);

        const response = await axios.post("/api/v1/intern/addinternship", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        });
        console.log('Response:', response.data); // Log the response here
        toast.success("Data uploaded successfully!");
        setTimeout(() => {
          window.location.reload()
        }, 2000);
        toast.success("Check the dashboard search to see your update!");
        
      } catch (err) {
        console.error('Error:', err); // Log the error here
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
              {/* <input
                type="text"
                placeholder="Enter Your Company"
                value={company}
                required
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setCompany(e.target.value)}
              /> */}
              <select 
                value={company === '' ? '' : company}
                onChange={(e)=>{
                  const select=e.target.value;
                  setCompany(select);
                  setNewCompany(select);
                }} 
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none">
              {companyList.map((val,index)=>{
                 return(
                  <option key={index} value={val}>{val}</option> 
                 )
              })}
              </select>
              {newCompany==="Others" && (<input
              type='text'
              value={company}
              onChange={(e)=>setCompany(e.target.value)}
              placeholder="type the company name"
              
              
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
                
              )}
              <label>Role</label>
              {/* <input
                type="text"
                placeholder="Enter the role"
                value={role}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setRole(e.target.value)}
              /> */}
              <select
               value={role}
               onChange={(e)=>setRole(e.target.value)}
               className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
               >
                <option value="Data Science Analyst Intern">Data Science Analyst</option>
                <option value="Software intern">Software Intern</option>
               </select>
              <label>Start Date </label>
              <input
                type="date"
                placeholder="Enter Your Starting Date"
                value={startDate}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label>End Date </label>
              <input
                type="date"
                placeholder="Enter Your End Date"
                value={endDate}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setEndDate(e.target.value)}
              />
              <label className="block text-l mb-2">Upload suitable Docs</label>
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
                {spin ? <ClipLoader size={24} color="#ffffff"/> : "Submit"}
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
