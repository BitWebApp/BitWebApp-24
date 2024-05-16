import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Academicform() {
  const [semester, setSemester] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [userid, setUserid] = useState("");
  const [spin, setSpin] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSpin(true);
    const tokenString=localStorage.getItem('user');
    const token = JSON.parse(tokenString);
    console.log(token._id);
    try {
      const formData = {
        userId: token._id,
        semester: semester,
        gpa: cgpa
      };
      const response = await axios.post("/api/v1/academics/create", formData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      console.log(response.data);
      toast.success("Data uploaded successfully!");
      setTimeout(() => {
        navigate("/db"); 
      }, 2000);
    } catch (err) {
      console.log(err);
      toast.error("Error uploading data!");
    } finally {
      setSpin(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items=center">
      <div className="w-full flex flex-col p-10 justify-between">
        <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Academic Form</h3>
            <p className="text-base mb-2">Enter Your details.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              {/* <label>UserId</label>
              <input
                type="text"
                placeholder="Enter Your UserId"
                value={userid}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setUserid(e.target.value)}
                required
              /> */}
              <label>Semester</label>
              <input
                type="text"
                placeholder="Enter Your Semester Number"
                value={semester}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setSemester(e.target.value)}
                required
              />
              <label>CGPA</label>
              <input
                type="text"
                placeholder="Enter Your CGPA"
                value={cgpa}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setCgpa(e.target.value)}
                required
              />
            </div>
            <div className="h-8"></div>
            <div className="w-full flex flex-col my-4">
              <button
                className="bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"
                type="submit"
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
