import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginFaculty() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/prof/login", {
        email,
        password,
      });
      console.log(response)
      localStorage.setItem(
        "faculty",
        JSON.stringify(response.data.data.professor)
      );
      console.log(response);
      toast.success("Login Successful! Redirecting to dashboard...");

      setTimeout(() => {
        navigate("/faculty-db");
      }, 2000);
    } catch (error) {
        console.log(error)
        toast.error(error.response.data.message || "Login failed. Please try again.");  
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center h-screen flex flex-col justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <ToastContainer />
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Faculty Portal</h2>
      <div className="max-w-md mx-auto w-full">
        <form className="bg-white shadow-xl rounded-lg p-6 mb-4 border-2 border-blue-500">
          <p className="mb-4">
            <label className="block text-left text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </p>
          <p className="mb-4">
            <div className="flex justify-between items-center">
              <label className="block text-left text-sm font-medium text-gray-700">Password</label>
              <Link
                to="/faculty-forget-password"
                className="text-sm text-blue-500 hover:text-blue-700 font-medium"
              >
                Forget password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </p>
          <button
            id="sub_btn"
            type="button"
            onClick={handleLogin}
            className="w-full p-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 font-medium"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color={"#fff"} /> : "Login"}
          </button>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Faculty Resources:</p>
            <div className="grid grid-cols-2 gap-2">
              <a 
                href="/documents/BITACADEMIA SUMMER TRAINING.pdf" 
                target="_blank"
                className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition"
              >
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Faculty Handbook
              </a>
              <a 
                href="https://youtu.be/Y2NYUZYAF0I?si=VcBhU1Oy-iyoqjVf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition"
              >
                <svg className="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                  <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch Tutorial
              </a>
            </div>
          </div>
        </form>

        <footer className="text-sm text-gray-600">
          <p className="mb-2">
            If you are unable to log in, please contact an administrator for
            assistance in adding your account.
          </p>
          <Link to="/" className="text-blue-500 hover:text-blue-700 font-medium">
            Back to Homepage
          </Link>
        </footer>
      </div>
    </div>
  );
}
