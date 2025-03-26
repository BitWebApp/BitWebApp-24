import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const api = axios.create({
    baseURL: "/api/v1/tracker",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });

export default function UserBugReporter () {
	const location = useLocation();
	const [reporterType, setReporterType] = useState('');
	const [reporterId, setReporterId] = useState('');
	const [title, setTitle] = useState('');
	const [reportDescription, setReportDescription] = useState('');
	const [attachments, setAttachments] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			const decoded = jwtDecode(token);
            console.log(decoded);
			setReporterId(decoded._id);
		}
		if (location.pathname.startsWith('/faculty-db')) {
			setReporterType('Faculty');
		} else if (location.pathname.startsWith('/db')) {
			setReporterType('User');
		}
	}, [location.pathname]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const formData = new FormData();
		formData.append('title', title);
		formData.append('reportDescription', reportDescription);
		attachments.forEach((file) => {
			formData.append('files', file);
		});

		try {
			await axios.post("/api/v1/tracker/bugs", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			toast.success('Bug reported successfully!');
			setTitle('');
			setReportDescription('');
			setAttachments([]);
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message;
			toast.error(`Error: ${errorMessage}`);
		} finally {
			setLoading(false);
		}
	};

	const handleFileChange = (e) => {
		const files = e.target.files;
		const newFiles = Array.from(files);
		setAttachments([...attachments, ...newFiles]);
	};

	return (
		<div className="w-full min-h-screen flex justify-center items-start pt-10">
      <ToastContainer />
      <div className="w-full flex flex-col p-10">
        <h3 className="text-xl text-black font-semibold">BITACADEMIA</h3>
        <div className="w-full flex flex-col mt-4">
          <h3 className="text-3xl font-semibold mb-4">Report a Bug</h3>
          <p className="text-base mb-2">Please describe the bug below.</p>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-4">
              <label className="block text-black mb-2">Bug Title:</label>
              <input
                type="text"
                placeholder="Enter bug title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border-b border-black bg-transparent outline-none focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-black mb-2">Report Description:</label>
              <textarea
                placeholder="Describe the bug here..."
                rows="1"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                required
                className="w-full p-2 border-b border-black bg-transparent outline-none focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-black mb-2">Upload Attachments:</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg shadow-md transition-all duration-200 ${
                loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Reporting...' : 'Submit Bug'}
            </button>
          </form>
        </div>
      </div>
		</div>
	);
}
