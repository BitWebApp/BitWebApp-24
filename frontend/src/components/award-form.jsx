import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Awardform() {
  const [award, setaward] = useState("");
  const [dor, setdor] = useState("");
  const [des, setdes] = useState("");
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [supdoc, setsupdoc] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center ">
      <div className="w-full flex flex-col p-6 justify-between">
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Award Form</h3>
            <p className="text-base mb-2">Enter Your details.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Award Name</label>
              <input
                type="text"
                placeholder="Enter Your Award Name"
                value={award}
                onChange={(e) => setaward(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Award Description</label>
              <input
                type="text"
                placeholder="Enter Award Description"
                value={des}
                onChange={(e) => setdes(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Date Received</label>
              <input
                type="date"
                value={dor}
                onChange={(e) => setdor(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <label>Roll Number</label>
              <input
                type="text"
                placeholder="Enter Your Roll Number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <label>Supporting Document</label>
              <input
                type="file"
                onChange={(e) => setsupdoc(e.target.files[0])}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
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
