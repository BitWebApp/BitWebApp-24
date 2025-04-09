import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function PEForm() {
  const [selectedPeIV, setSelectedPeIV] = useState("");
  const [selectedPeV, setSelectedPeV] = useState("");
  const [loading, setLoading] = useState(false);
  const [peCoursesIV, setPeCoursesIV] = useState([]);
  const [peCoursesV, setPeCoursesV] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userHasPeCourse, setUserHasPeCourse] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchFromBackend = async () => {
      try {
        const response = await axios.get('/api/v1/users/fetchBranch');
        if (response.data.success && response.data.data) {
          const userBranch = response.data.data.toLowerCase();

          if (userBranch === "artificial intelligence and machine learning") {
            setPeCoursesIV([
              { id: "IT347", name: "Introduction to Distributed System + Lab (IT348)" },
              { id: "IT445", name: "Internet of Things + Lab (IT446)" },
              { id: "AI425", name: "Computer Vision + Lab (AI426)" },
              { id: "IT451", name: "Cloud Computing + Lab (IT452)" },
            ]);
            setPeCoursesV([
              { id: "IT351", name: "Natural Language Processing" },
              { id: "AI429", name: "Speech Processing" },
              { id: "IT349", name: "Cryptography & Network Security" },
            ]);
          } else if (userBranch === "computer science and engineering") {
            setPeCoursesIV([
              { id: "CS431", name: "Computer Graphics + Lab (CS432)" },
              { id: "CS435", name: "Frontend Design + Lab (CS436)" },
              { id: "CS437", name: "Deep Learning + Lab (CS438)" },
            ]);
            setPeCoursesV([
              { id: "IT445", name: "Internet of Things (IoT) + Lab (IT446)" },
              { id: "IT331", name: "Image Processing + Lab (IT332)" },
              { id: "IT347", name: "Cloud Computing + Lab (IT348)" },
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

    const fetchUserPeCourses = async () => {
      try {
        const response = await axios.get('/api/v1/pe/my-pe-courses');
        if (response.data.success && response.data.data.length > 0) {
          setUserHasPeCourse(true);
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

    if (!selectedPeIV || !selectedPeV) {
      toast.error("Please select both PE IV and PE V courses.");
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      html: `
        <div style="text-align: left; padding: 20px;">
          <p style="font-size: 18px;"><strong>PE IV:</strong> ${selectedPeIV}</p>
          <p style="font-size: 18px;"><strong>PE V:</strong> ${selectedPeV}</p>
        </div>
        <p style="font-size: 16px; color: #666;">You cannot change these after submission.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit!',
      cancelButtonText: 'No, cancel!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          setLoading(true);
          console.log("going to response");
          
          const response = await axios.post(
            '/api/v1/pe/add-pe',
            {
              peCourseIVId: selectedPeIV,   
              peCourseVId: selectedPeV,     // Same as above
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // If you're using JWT token
              },
              withCredentials: true,
            }
          );

          console.log("response received", response);
          
          
          
          if (response.data.success) {
            toast.success("PE courses added successfully!");
            setIsSubmitted(true);
            setSelectedPeIV("");
            setSelectedPeV("");
            Swal.fire('Submitted!', 'Your PE courses have been recorded.', 'success');
            navigate('/db/PE-table');
          } else {
            console.log(response.data);
            
            toast.error(response.data.message || 'Submission failed in else.');
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Submission failed in catch.');
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
            <p className="text-base mb-2">Select your PE IV and PE V courses.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>PE IV Course</label>
              <select
                value={selectedPeIV}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
                onChange={(e) => setSelectedPeIV(e.target.value)}
                required
                disabled={userHasPeCourse || isSubmitted}
              >
                <option value="" disabled>Select PE IV Course</option>
                {peCoursesIV.length > 0 ? (
                  peCoursesIV.map((course, index) => (
                    <option key={index} value={course.id}>{course.id}: {course.name}</option>
                  ))
                ) : (
                  <option disabled>No PE IV Courses Available</option>
                )}
              </select>
            </div>

            <div className="w-full flex flex-col mt-4">
              <label>PE V Course</label>
              <select
                value={selectedPeV}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
                onChange={(e) => setSelectedPeV(e.target.value)}
                required
                disabled={userHasPeCourse || isSubmitted}
              >
                <option value="" disabled>Select PE V Course</option>
                {peCoursesV.length > 0 ? (
                  peCoursesV.map((course, index) => (
                    <option key={index} value={course.id}>{course.id}: {course.name}</option>
                  ))
                ) : (
                  <option disabled>No PE V Courses Available</option>
                )}
              </select>
            </div>

            <div className="h-8"></div>
            <div className="w-full flex flex-col my-4">
              <button
                className={`bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90 ${loading && 'opacity-70'}`}
                type="submit"
                disabled={loading || userHasPeCourse || isSubmitted}
              >
                {loading ? <ClipLoader size={24} color="#ffffff" /> : "Submit"}
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
