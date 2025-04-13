import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

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
              { id: "AI347", name: "Introduction to Distributed System + Lab (IT347)" },
              { id: "IT445", name: "Internet of Things + Lab (IT445)" },
              { id: "AI425", name: "Computer Vision + Lab (AI425)" },
              { id: "IT451", name: "Cloud Computing + Lab (IT451)" },
            ]);
            setPeCoursesV([
              { id: "IT351", name: "Natural Language Processing" },
              { id: "AI429", name: "Speech Processing" },
              { id: "IT349", name: "Cryptography & Network Security" },
            ]);
          } else if (userBranch === "computer science and engineering") {
            setPeCoursesIV([
              { id: "CS431", name: "Computer Graphics + Lab (CS431)" },
              { id: "CS435", name: "Frontend Design + Lab (CS435)" },
              { id: "CS437", name: "Deep Learning + Lab (CS437)" },
            ]);
            setPeCoursesV([
              { id: "IT445", name: "Internet of Things (IoT) + Lab (IT445)" },
              { id: "IT331", name: "Image Processing + Lab (IT331)" },
              { id: "IT347", name: "Cloud Computing + Lab (IT347)" },
            ]);
          } else {
            console.error('No PE course available for your branch:', userBranch);
          }
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
          const response = await axios.post(
            '/api/v1/pe/add-pe',
            {
              peCourseIVId: selectedPeIV,
              peCourseVId: selectedPeV,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              },
              withCredentials: true,
            }
          );

          if (response.data.success) {
            toast.success("PE courses added successfully!");
            setIsSubmitted(true);
            setSelectedPeIV("");
            setSelectedPeV("");
            Swal.fire('Submitted!', 'Your PE courses have been recorded.', 'success');
            navigate('/db/PE-table');
          } else {
            toast.error(response.data.message || 'Submission failed.');
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Submission failed.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // const isDisabled = userHasPeCourse || isSubmitted;
const isDisabled = true;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-2xl p-8">
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">PE Course Selection Form</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">PE IV Course</label>
            <select
              value={selectedPeIV}
              onChange={(e) => setSelectedPeIV(e.target.value)}
              disabled={isDisabled}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black disabled:bg-gray-100"
              required
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

          <div>
            <label className="block text-sm font-medium text-gray-700">PE V Course</label>
            <select
              value={selectedPeV}
              onChange={(e) => setSelectedPeV(e.target.value)}
              disabled={isDisabled}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black disabled:bg-gray-100"
              required
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

          <button
            type="submit"
            disabled={loading || isDisabled}
            className={`w-full py-3 rounded-md font-medium transition duration-200 ${
              loading || isDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-black/90'
            }`}
          >
            {loading ? <ClipLoader size={24} color="#fff" /> : 'Submit'}
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            Already submitted?{' '}
            <Link to="/db/PE-table" className="text-blue-600 hover:underline font-medium">
              View your PE Courses
            </Link>
          </p>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
}
