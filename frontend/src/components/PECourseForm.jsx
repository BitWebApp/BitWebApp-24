import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
// import jwt_decode from "jwt-decode"; 
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function PEForm() {
  const [selectedPe, setSelectedPe] = useState("");
  const [loading, setLoading] = useState(false);
  const [peCourses, setPeCourses] = useState([]);
  const [formLocked, setFormLocked] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    // Check if form has already been submitted
    const isFormSubmitted = localStorage.getItem('peFormSubmitted');
    if (isFormSubmitted) {
      setFormLocked(true); // Lock the form if submitted previously
      Swal.fire({
        title: 'Form Locked',
        text: 'You have already submitted the PE form. You cannot submit again.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }

    // const token = localStorage.getItem('jwt'); 
    // if (token) {
      // const decoded = jwt_decode(token);
      // const userBranch = decoded.branch; // Assuming branch is stored as 'branch' in the JWT payload

      // Set PE courses based on branch
      // if (userBranch === "AIML") {
      //   setPeCourses([
      //     { id: "AI315", name: "Advanced Algorithms" },
      //     { id: "AI317", name: "Information Retrieval" },
      //     { id: "AI319", name: "Introduction to Compiler Design" }
      //   ]);
      // } else if (userBranch === "CS") {
        setPeCourses([
          { id: "IT349", name: "Cryptography and Network Security" },
          { id: "IT354", name: "Wireless Sensor Network" },
          { id: "IT353", name: "Blockchain Technology" },
          { id: "CS351", name: "Nature Inspired Computing" }
        ]);
      // }
    // }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");

    if (formLocked) return; // Prevent form submission if locked

    const htmlContent = `
      <div style="text-align: left; padding: 20px;">
        <p style="font-size: 20px; margin: 10px 0; color: #333;">
          <strong>Selected PE Course:</strong> ${selectedPe}
        </p>
        <br/>
      </div>
      <p style="font-size: 17px; color: #666;">
          Do you want to add this PE course? You will not be able to edit your choice further on.
      </p>
    `;

    Swal.fire({
      title: 'Are you sure?',
      html: htmlContent,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, add it!',
      cancelButtonText: 'No, cancel!',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          setLoading(true);
          const response = await axios.post('/api/v1/pe/add-pe', {
            peCourseId: selectedPe,
          });

          if (response.data.success) {
            toast.success("PE course added successfully!");
            setSelectedPe("");
            Swal.fire(
              'Added!',
              'Your PE course has been added.',
              'success'
            );

            // Lock the form after successful submission
            localStorage.setItem('peFormSubmitted', 'true'); 
            setFormLocked(true); // Set form as locked

            navigate('/db/PE-table');
          } else {
            toast.error(response.data.message || 'Failed to add the course. Please try again.');
          }
        } catch (error) {
          if (error.response && error.response.data) {
            toast.error(error.response.data.message);
          } else {
            toast.error('Failed to add the course. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full flex flex-col p-10 justify-between">
        <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">PE Form</h3>
            <p className="text-base mb-2">Select your PE course.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>PE:III Course</label>
              <select
                value={selectedPe}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setSelectedPe(e.target.value)}
                disabled={formLocked} // Disable form if locked
                required
              >
                <option value="" disabled>Select PE Course</option>
                {peCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.id}: {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-8"></div>
            <div className="w-full flex flex-col my-4">
              <button
                className={loading || formLocked ? "bg-black text-white w-full rounded-md p-4 text-center flex items-center opacity-70 justify-center my-2 hover:bg-black/90" : "bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"}
                type="submit"
                disabled={formLocked || loading} // Disable button if locked or loading
              >
                {loading ? <ClipLoader size={24} color="#ffffff" /> : formLocked ? "Form Locked" : "Add"}
              </button>
            </div>
          </form>
          <div className="w-full items-center justify-center flex">
            <p className="text-sm font-normal text-black">
              <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
                <Link to="/db/PE-table">See chosen PE Courses</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
