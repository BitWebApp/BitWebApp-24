import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Academicform() {
  const [semester, setSemester] = useState("");
  const [gpa, setGpa] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      console.log("User Data:", userData);
      
      const userId = userData._id; 
      console.log("User ID:", userId);
      console.log("Semester:", semester);
      console.log("GPA:", gpa);

      console.log("Sending CREATE request");

      const response = await axios.post('/api/v1/academics/create', {
        userId: userId,
        semester: semester,
        gpa: gpa,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      console.log(response);

      console.log("Received CREATE request");

      if (response.data.success) {
        console.log("Navigate to academic table");
        navigate('/db/academic-table');
      } else {
        console.error("Failed to create academic record");
        toast.error(response.data.message || 'Failed to create academic record. Please try again.');
      }
    } catch (error) {
      console.error('Error creating academic record:', error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create academic record. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full flex flex-col p-10 justify-between">
        <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Academic Form</h3>
            <p className="text-base mb-2">Enter Your details.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Semester</label>
              <input
                type="text"
                placeholder="Enter Your Semester Number"
                value={semester}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setSemester(e.target.value)}
                required
              />
              <label>GPA</label>
              <input
                type="text"
                placeholder="Enter Your GPA"
                value={gpa}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setGpa(e.target.value)}
                required
              />
            </div>
            <div className="h-8"></div>
            <div className="w-full flex items-center justify-between"></div>
            <div className="w-full flex flex-col my-4">
              <button
                className="bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"
              >
                {loading ? <ClipLoader/> : "Submit"}
              </button>
            </div>
          </form>
          <div className="w-full items-center justify-center flex">
            <p className="text-sm font-normal text-black">
              <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
                <Link to="/db/academic-table">See Records</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}
