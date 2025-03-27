import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true); // Set loading to true when login starts
    try {
      const response = await axios.post("/api/v1/admin/login", {
        username,
        password,
      });
      localStorage.setItem("user", JSON.stringify(response.data.data.admin));
      console.log(response);

      // Show success toast
      toast.success("Login Successful! Redirecting to dashboard...");

      setTimeout(() => {
        navigate("/admin-db/");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        const htmlDoc = new DOMParser().parseFromString(
          error.response.data,
          "text/html"
        );
        const errorElement = htmlDoc.querySelector("body");
        if (errorElement) {
          const errorMessage = errorElement.textContent.trim();
          const errormsg = errorMessage.split("at")[0].trim();
          console.log(errormsg);
          toast.error(errormsg);
        } else {
          console.log("Error: An unknown error occurred");
          toast.error("An unknown error occurred");
        }
      } else {
        console.log("Error:", error.message);
        toast.error("Error occurred during signup");
      }
    } finally {
      setLoading(false); // Set loading to false after the login process is complete
    }
  };

  return (
    <div className="text-center h-screen flex flex-col justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <ToastContainer />
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Portal</h2>
      <div className="max-w-md mx-auto w-full">
        <form className="bg-white shadow-xl rounded-lg p-6 mb-4 border-2 border-blue-500">
          <p className="mb-4">
            <label className="block text-left text-sm font-medium text-gray-700 mb-1">
              Username or email address
            </label>
            <input
              type="text"
              name="first_name"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </p>
          <p className="mb-4">
            <div className="flex justify-between items-center">
              <label className="block text-left text-sm font-medium text-gray-700">Password</label>
              <Link
                to="/forgot-password"
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
        </form>

        <footer className="text-sm text-gray-600">
          <p className="mb-2">
            First time?{" "}
            <Link to="/sg.a" className="text-blue-500 hover:text-blue-700 font-medium">
              Create an account
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
