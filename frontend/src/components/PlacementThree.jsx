import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ClipLoader, GridLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';

const PlacementThree = () => {
  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Engineer");
  const [ctc, setCTC] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [spin, setSpin] = useState(false);
  const [isDataPresent, setIsDataPresent] = useState(false);
  const [newCompany, setNewCompany] = useState("");

  const navigate = useNavigate();

  const companyList = [
    "Google", "Microsoft", "Apple", "Amazon", "Meta (Facebook)", "Netflix", 
    "IBM", "Oracle", "Intel", "Cisco", "NVIDIA", "Qualcomm", "Broadcom", 
    "Texas Instruments", "Visa", "Mastercard", "PayPal", "Stripe", 
    "Salesforce", "Wells Fargo", "Uber", "Atlassian", "Fastenal", 
    "Walmart Global Tech", "Intuit", "Sprinkler", "NPCI", "Others"
  ];

  const roleList = [
    "Software Engineer", "Frontend Developer", "Backend Developer", 
    "Full Stack Developer", "Data Science", "Data Analyst", 
    "Machine Learning", "Cloud Engineer", "DevOps", 
    "Cybersecurity", "Information Security", "Product Management", 
    "Systems Engineer", "R&D", "Quality Assurance", "UI/UX Design"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/v1/users/PlacementThree");
        if (response.data) {
          setCompany(response.data.data.company);
          setRole(response.data.data.role);
          setCTC(response.data.data.ctc);
          const formattedDate = new Date(response.data.data.date)
            .toISOString()
            .split("T")[0];
          setDate(formattedDate);
          setIsDataPresent(true);
        }
      } catch (err) {
        // console.log(err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const documentLink = file ? `<a href="${URL.createObjectURL(file)}" target="_blank" style="margin-top: 10px;">(Click to View)</a>` : '';

    const htmlContent = `
      <div style="text-align: left; padding: 20px;">
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Company:</strong> ${company}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Role:</strong> ${role}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>CTC:</strong> ${ctc}
        </p>
        <p style="font-size: 18px; margin: 10px 0; color: #333;">
          <strong>Date:</strong> ${date}
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
        try {
          const formData = new FormData();
          formData.append("company", company);
          formData.append("role", role);
          formData.append("ctc", ctc);
          formData.append("date", date);
          formData.append("doc", file);
          const response = await axios.patch("/api/v1/users/pone", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          });
          toast.success("Data uploaded successfully");
          setTimeout(() => {
            navigate("/db");
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
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Placement Form</h3>
            <p className="text-base mb-2">Enter Your Placement details.</p>
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
              <label>CTC</label>
              <input
                type="text"
                placeholder="Enter CTC"
                value={ctc}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setCTC(e.target.value)}
                disabled={isDataPresent}
              />
              <label>Date of joining</label>
              <input
                type="date"
                placeholder="Enter Your Joining Date"
                value={date}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setDate(e.target.value)}
                disabled={isDataPresent}
              />
              <label className="mt-4">Upload Supporting Documents</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={isDataPresent}
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
            <div className="w-full items-center justify-center flex">
              <p className="text-sm font-normal text-black mt-5">
                <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
                  <Link to="/db">Go back to Dashboard</Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlacementThree;
