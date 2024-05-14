import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

export default function InternshipForm() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  // const [password, setPassword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [idCard, setIdCard] = useState("");
  // const [branch, setBranch] = useState("");
  // const [section, setSection] = useState("");
  // const [image, setImage] = useState("");
  // const [mobileNumber, setMobileNumber] = useState("");
  // const [semester, setSemester] = useState("");
  // const [cgpa, setCgpa] = useState("");
  // const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

 

  const handleSubmit = (e) => {
    e.preventDefault();
  
  };

  return (
    <div className="w-full min-h-screen flex justify-center items=center">
     
      <div className="w-full flex flex-col p-10 justify-between">
      <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
        <div className="w-full flex flex-col ">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Internship Form</h3>
            <p className="text-base mb-2">Enter Your  details.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Company</label>
              <input
                type="email"
                placeholder="Enter Your Company"
                value={company}
                required
              title="Please select the company"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setCompany(e.target.value)}
              />
              <label>Role</label>
              <input
                type="text"
                placeholder="Enter the role"
                value={role}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setRole(e.target.value)}
              />
              {/* <div className="relative">
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Your Password"
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 top-4 text-gray-600 hover:text-red-900 hover:text-black-1500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"} Password
                </button>
              </div> */}
              <label>Starting Date </label>
              <input
                type="date"
                placeholder="Enter Your Starting Date"
                value={startDate}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label>Ending Date </label>
              <input
                type="date"
                placeholder="Enter Your Roll Number"
                value={endDate}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setEndDate(e.target.value)}
              />
              <label className="block text-l mb-2">Upload suitable Docs</label>
              <input
                type="file"
                accept="image/*"
                value={idCard}
                onChange={(e) => setIdCard(e.target.files[0])}
              />
              <div className="h-5"></div>
              {/* <label>Branch</label>
              <input
                type="text"
                placeholder="Enter Your Branch"
                value={branch}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setBranch(e.target.value)}
              />
              <label>Section</label>
              <input
                type="text"
                placeholder="Enter Your Section"
                value={section}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setSection(e.target.value)}
              />
              <label>Upload Your Image</label>
              <input
                type="file"
                accept="image/*"
                value={image}
                onChange={(e) => setImage(e.target.files[0])}
              /> */}
              <div className="h-5"></div>

              {/* <label>Mobile Number</label>
              <input
                type="text"
                placeholder="Enter Your Mobile Number"
                value={mobileNumber}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setMobileNumber(e.target.value)}
              /> */}
              {/* <label>Semester</label>
              <input
                type="text"
                placeholder="Enter Your Semester Number"
                value={semester}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setSemester(e.target.value)}
              /> */}
              {/* <label>CGPA</label>
              <input
                type="text"
                placeholder="Enter Your CGPA"
                value={cgpa}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setCgpa(e.target.value)}
              /> */}
            </div>
            <div className="h-8"></div>
            <div className="w-full flex items-center justify-between">
            
              
            </div>
            <div className="w-full flex flex-col my-4">
              <button
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
