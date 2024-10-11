import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function PEForm() {
  const [selectedPe, setSelectedPe] = useState("");
  const [loading, setLoading] = useState(false);
  const [peCourses, setPeCourses] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userHasPeCourse, setUserHasPeCourse] = useState(false); // Track if the user already has a PE course
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch branch from backend
    const fetchBranchFromBackend = async () => {
      try {
        const response = await axios.get('/api/v1/users/fetchBranch');  // API to get branch
        if (response.data.success && response.data.data) {
          const userBranch = response.data.data;
          // Set available PE courses based on user branch
          if (userBranch === "artificial intelligence and machine learning") {
            setPeCourses([
              { id: "AI315", name: "Advanced Algorithms" },
              { id: "AI317", name: "Information Retrieval" },
              { id: "AI319", name: "Introduction to Compiler Design" }
            ]);
          } else if (userBranch === "computer science and engineering") {
            setPeCourses([
              { id: "IT349", name: "Cryptography and Network Security" },
              { id: "IT354", name: "Wireless Sensor Network" },
              { id: "IT353", name: "Blockchain Technology" },
              { id: "CS351", name: "Nature Inspired Computing" }
            ]);
          } else {
            console.error('No PE course available for your branch:', userBranch);
          }
        } else {
          console.error('Failed to fetch branch from backend');
        }
      } catch (error) {
        console.error('Error fetching branch from backend:', error);
      }
    };

    // Fetch user's selected PE courses
    const fetchUserPeCourses = async () => {
      try {
        const response = await axios.get('/api/v1/pe/my-pe-courses');  // API to get the user's PE courses
        if (response.data.success && response.data.data.length > 0) {
          setUserHasPeCourse(true); // User already selected a course
        }
      } catch (error) {
        console.error('Error fetching user PE courses:', error);
      }
    };

    fetchBranchFromBackend();
    fetchUserPeCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPe) {
      toast.error("Please select a PE course.");
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      html: `
        <div style="text-align: left; padding: 20px;">
          <p style="font-size: 20px; margin: 10px 0; color: #333;">
            <strong>Selected PE Course:</strong> ${selectedPe}
          </p>
        </div>
        <p style="font-size: 17px; color: #666;">
          <strong>Warning:</strong> This is your final choice. You cannot change it after submission.
        </p>
        <p style="font-size: 17px; color: #666;">
          Do you want to add this PE course? You will not be able to edit your choice further on.
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, add it!',
      cancelButtonText: 'No, cancel!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          setLoading(true);
          const response = await axios.post('/api/v1/pe/add-pe', {
            peCourseId: selectedPe,
          });

          if (response.data.success) {
            toast.success("PE course added successfully!");
            setIsSubmitted(true);
            setSelectedPe("");
            Swal.fire('Added!', 'Your PE course has been added.', 'success');
            navigate('/db/PE-table');
          } else {
            toast.error(response.data.message || 'Failed to add the course. Please try again.');
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to add the course. Please try again.');
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
                required
                disabled={userHasPeCourse || isSubmitted}  // Disable if user already has a PE course
              >
                <option value="" disabled>Select PE Course</option>
                {peCourses.length > 0 ? (
                  peCourses.map((course, index) => (
                    <option key={course.id || index} value={course.id}>
                      {course.id}: {course.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No PE Courses Available</option>
                )}
              </select>
            </div>
            <div className="h-8"></div>
            <div className="w-full flex flex-col my-4">
              <button
                className={`bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90 ${loading && 'opacity-70'}`}
                type="submit"
                disabled={loading || userHasPeCourse || isSubmitted}  // Disable if user already has a PE course
              >
                {loading ? <ClipLoader size={24} color="#ffffff" /> : "Add"}
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