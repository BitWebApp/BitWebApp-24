import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

export default function Awardform() {
  const [award, setaward] = useState("");
  const [dor, setdor] = useState("");
  const [des, setdes] = useState("");
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [supdoc, setsupdoc] = useState("");
  // const [branch, setBranch] = useState("");
  // const [section, setSection] = useState("");
  // const [image, setImage] = useState("");
  // const [mobileNumber, setMobileNumber] = useState("");
  // const [semester, setSemester] = useState("");
  // const [cgpa, setCgpa] = useState("");
  // const [showPassword, setShowPassword] = useState(false);
  // const navigate = useNavigate();

  // const togglePasswordVisibility = () => {
  //   setShowPassword(!showPassword);
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
  
  };

  return (
    <div className="w-full min-h-screen flex justify-center items=center">
     
      <div className="w-full flex flex-col p-10 justify-between">
      <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
        <div className="w-full flex flex-col ">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Award Form</h3>
            <p className="text-base mb-2">Enter Your  details.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Award-Name</label>
              <input
                type="text"
                placeholder="Enter Your Award-Name"
                value={award}
                required
              title="Enter Your Award-Name"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setaward(e.target.value)}
              />
              <label>Award Description</label>
              <input
                type="text"
                placeholder="Enter Award Description"
                value={des}
                required
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setdes(e.target.value)}
              />
              <div className="relative">
                <label>Date Received</label>
                <input
                    type="date"
                  placeholder="Enter Date Received"
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  value={dor}
                  onChange={(e) => setdor(e.target.value)}
                />
              
              </div>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter Your Full Name"
                value={fullName}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setFullName(e.target.value)}
              />
              <label>Roll Number</label>
              <input
                type="text"
                placeholder="Enter Your Roll Number"
                value={rollNumber}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setRollNumber(e.target.value)}
              />
              <label className="block text-l mb-2">Supporting Document</label>
              <input
                type="file"
                value={supdoc}
                onChange={(e) => setsupdoc(e.target.files[0])}
              />
              <div className="h-5"></div>
             
              
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
