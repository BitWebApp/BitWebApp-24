import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { FaGraduationCap, FaChevronLeft } from 'react-icons/fa';

export default function AcademicForm() {
  const [formData, setFormData] = useState({
    semester: "",
    gpa: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const semesters = [
    { value: "1", label: "First Semester" },
    { value: "2", label: "Second Semester" },
    { value: "3", label: "Third Semester" },
    { value: "4", label: "Fourth Semester" },
    { value: "5", label: "Fifth Semester" },
    { value: "6", label: "Sixth Semester" },
    { value: "7", label: "Seventh Semester" },
    { value: "8", label: "Eighth Semester" },
    { value: "9", label: "Ninth Semester" },
    { value: "10", label: "Tenth Semester" }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.semester) newErrors.semester = "Semester is required";
    if (!formData.gpa) {
      newErrors.gpa = "GPA is required";
    } else if (isNaN(formData.gpa) || parseFloat(formData.gpa) < 0 || parseFloat(formData.gpa) > 10) {
      newErrors.gpa = "Please enter a valid GPA (0-10)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const htmlContent = `
      <div style="text-align: left; padding: 10px;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="width: 120px; font-weight: 600; color: #555;">Semester:</div>
          <div>${semesters.find(s => s.value === formData.semester)?.label}</div>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 120px; font-weight: 600; color: #555;">GPA:</div>
          <div>${formData.gpa}</div>
        </div>
      </div>
      <p style="margin-top: 20px; color: #666; font-size: 15px;">
        Are you sure you want to submit this academic record?
      </p>
    `;

    Swal.fire({
      title: 'Review Your Submission',
      html: htmlContent,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel',
      focusConfirm: false,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          setLoading(true);
          const response = await axios.post('/api/v1/academics/create', {
            semester: formData.semester,
            gpa: formData.gpa,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });

          if (response.data.success) {
            toast.success("Academic record added successfully!");
            setFormData({ semester: "", gpa: "" });
            navigate('/db/academic-table');
          } else {
            throw new Error(response.data.message || 'Failed to create academic record');
          }
        } catch (error) {
          toast.error(error.response?.data?.message || error.message || 'Failed to create academic record');
          return false; // Keep the modal open on error
        } finally {
          setLoading(false);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaChevronLeft className="mr-1" /> Back
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex items-center">
              <FaGraduationCap className="text-white text-2xl mr-3" />
              <h1 className="text-2xl font-bold text-white">Academic Record Form</h1>
            </div>
            <p className="mt-1 text-blue-100">Enter your semester academic details</p>
          </div>

          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className={`block w-full pl-3 pr-10 py-2 text-base border ${
                    errors.semester ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm`}
                  required
                >
                  <option value="">Select Your Semester</option>
                  {semesters.map((semester) => (
                    <option key={semester.value} value={semester.value}>
                      {semester.label}
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                )}
              </div>

              <div>
                <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-1">
                  GPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="gpa"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  placeholder="Enter your GPA (0-10)"
                  className={`block w-full px-3 py-2 border ${
                    errors.gpa ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm`}
                  required
                />
                {errors.gpa && (
                  <p className="mt-1 text-sm text-red-600">{errors.gpa}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter your GPA on a scale of 0 to 10
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Link
                  to="/db/academic-table"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all academic records →
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[120px]`}
                >
                  {loading ? (
                    <ClipLoader color="#ffffff" size={20} />
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}