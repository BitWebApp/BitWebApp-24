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
	const [reportDescription, setReportDescription] = useState('');

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
		const payload = {
			reportDescription,
			requesterType: reporterType
		};
		try {
			await axios.post("/api/v1/tracker/bugs", payload);
			toast.success('Bug reported successfully!');
			setReportDescription('');
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message;
			toast.error(`Error: ${errorMessage}`);
		}
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
            <button
              type="submit"
              className="w-full py-2 px-4 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
            >
              Submit Bug
            </button>
          </form>
        </div>
      </div>
		</div>
	);
};