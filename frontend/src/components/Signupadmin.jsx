import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/v1/admin/register", {
        username,
        password,
      });
      console.log(response.data);
      
      toast.success('Registration Successful! Redirecting to login...'); 
      setTimeout(() => {
        navigate("/log.a");
      }, 2000);
      
    } catch (error) {
      console.error(error);
      
      toast.error('Registration Failed. Password too short.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center h-screen flex flex-col justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <ToastContainer />
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Join as Admin</h2>
      <h5 className="text-lg text-gray-600 mb-6">Create your personal account</h5>
      <div className="max-w-md mx-auto w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-lg p-6 mb-4 border-2 border-blue-500"
        >
          <p className="mb-4">
            <label className="block text-left text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </p>
          <p className="mb-4">
            <label className="block text-left text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </p>
          <button
            type="submit"
            className="w-full p-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 font-medium"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="#ffffff" /> : 'Register'}
          </button>
        </form>

        <footer className="text-sm text-gray-600">
          <p className="mb-2">
            Already have an Account?{" "}
            <Link to="/log.a" className="text-blue-500 hover:text-blue-700 font-medium">
              Log In
            </Link>
          </p>
          <Link to="/" className="text-blue-500 hover:text-blue-700 font-medium">
            Back to Homepage
          </Link>
        </footer>
      </div>
    </div>
  );
}
