import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiUpload, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';

const api = axios.create({
  baseURL: "/api/v1/tracker",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

export default function UserBugReporter() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    reporterType: '',
    reporterId: '',
    title: '',
    reportDescription: '',
    attachments: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setFormData(prev => ({
          ...prev,
          reporterId: decoded._id
        }));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    if (location.pathname.startsWith('/faculty-db')) {
      setFormData(prev => ({
        ...prev,
        reporterType: 'Faculty'
      }));
    } else if (location.pathname.startsWith('/db')) {
      setFormData(prev => ({
        ...prev,
        reporterType: 'User'
      }));
    }
  }, [location.pathname]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.reportDescription.trim()) newErrors.reportDescription = "Description is required";
    if (formData.reportDescription.length < 30) newErrors.reportDescription = "Description should be at least 30 characters";
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.attachments.length > 5) {
      toast.error("Maximum 5 attachments allowed");
      return;
    }
    
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`File too large (max 5MB): ${file.name}`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const formPayload = new FormData();
    formPayload.append('title', formData.title);
    formPayload.append('reportDescription', formData.reportDescription);
    formData.attachments.forEach((file) => {
      formPayload.append('files', file);
    });

    try {
      await api.post("/bugs", formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success('Bug reported successfully!');
      setIsSubmitted(true);
      // Reset form
      setFormData({
        reporterType: formData.reporterType,
        reporterId: formData.reporterId,
        title: '',
        reportDescription: '',
        attachments: []
      });
    } catch (error) {
      console.error("Error submitting bug report:", error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Failed to submit bug report";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <FiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your bug report has been submitted successfully. Our team will review it shortly.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Report Another Bug
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Report a Bug
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Help us improve by reporting any issues you encounter
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Bug Report Form
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Please provide detailed information about the bug
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Briefly describe the issue"
                    className={`block w-full shadow-sm sm:text-sm rounded-md ${
                      errors.title ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>
              </div>

              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    name="reportDescription"
                    id="reportDescription"
                    rows={4}
                    value={formData.reportDescription}
                    onChange={handleInputChange}
                    placeholder="Provide detailed steps to reproduce the issue..."
                    className={`block w-full shadow-sm sm:text-sm rounded-md ${
                      errors.reportDescription ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  {errors.reportDescription && (
                    <p className="mt-2 text-sm text-red-600">{errors.reportDescription}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.reportDescription.length}/500 characters (minimum 30 required)
                  </p>
                </div>
              </div>

              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Attachments
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <FiUpload className="mx-auto h-8 w-8" />
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="sr-only"
                            accept=".jpg,.jpeg,.png,.pdf,.txt"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF, TXT up to 5MB (max 5 files)
                      </p>
                    </div>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {formData.attachments.map((file, index) => (
                          <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="flex-1 w-0 truncate">
                                {file.name}
                              </span>
                              <span className="ml-2 flex-shrink-0 text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)}MB
                              </span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <FiX className="h-5 w-5" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[120px]`}
                >
                  {loading ? (
                    <ClipLoader color="#ffffff" size={20} />
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Please include as much detail as possible to help us reproduce and fix the issue.
                Screenshots are especially helpful.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}