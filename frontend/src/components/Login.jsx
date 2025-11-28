import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./NavBar";
import { useEffect } from "react";

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/v1/users/get-user");
        if (response.status == 200) {
          toast.success("User already logged in! Navigating to dashboard...");
          setTimeout(() => {
            navigate("/db");
          }, 3000);
        }
      } catch (error) {
        // console.log("User not logged in", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [navigate]);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/v1/users/login", {
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      toast.success("Login successful!");
      setTimeout(() => {
        navigate("/db");
      }, 2000);
    } catch (error) {
      // if (error.response && error.response.data) {
      //   const htmlDoc = new DOMParser().parseFromString(
      //     error.response.data,
      //     "text/html"
      //   );
      //   const errorElement = htmlDoc.querySelector("body");
      //   if (errorElement) {
      //     const errorMessage = errorElement.textContent.trim();
      //     const errormsg = errorMessage.split("at")[0].trim();
      //     // console.log(errormsg);
      //     toast.error(errormsg);
      //   } else {
      //     // console.log("Error: An unknown error occurred");
      //     toast.error("An unknown error occurred");
      //   }
      // } else {
      //   // console.log("Error:", error.message);
      //   toast.error("Error occurred during signup");
      // }
      let errorMessage = error.response.data.message;
      toast.error(errorMessage || "Error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen w-full flex flex-col md:flex-row overflow-auto">
        <ToastContainer />
        <div className="relative w-full md:w-1/2 h-64 md:h-auto flex-shrink-0 md:sticky md:top-0">
          <img
            src="/static/images/bitphoto.JPG"
            className="w-full h-full object-cover"
            alt="bit-mesra"
          />
        </div>
        <div className="w-full md:w-1/2 bg-gradient-to-b from-gray-50 to-white flex flex-col p-4 md:p-8 lg:p-12">
          <div className="w-full max-w-[500px] mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-blue-600 mb-2">
              Welcome to BITACADEMIA
            </h3>
            <form onKeyDown={handleKeyDown} className="w-full flex flex-col">
              <div className="flex flex-col w-full mb-4">
                <h3 className="text-3xl md:text-4xl font-semibold mb-2 text-gray-800">
                  Student Login
                </h3>
                <p className="text-base md:text-lg mb-2 text-gray-600">
                  Enter your login details below.
                </p>
              </div>
              <div className="w-full flex flex-col mb-4">
                <label className="text-gray-700 text-sm mb-1">Email</label>
                <input
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  className="w-full text-gray-800 py-3 px-4 border rounded-md focus:border-blue-500 focus:outline-none"
                  required
                  onChange={(e) => setemail(e.target.value)}
                />
              </div>
              <div className="w-full flex flex-col mb-4 relative">
                <label className="text-gray-700 text-sm mb-1">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full text-gray-800 py-3 px-4 border rounded-md focus:border-blue-500 focus:outline-none"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-4 text-sm text-gray-500 hover:text-blue-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"} Password
                </button>
              </div>
              <div className="w-full flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 mr-2" />
                  <p className="text-sm text-gray-700">Remember Me</p>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-red-500 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="w-full flex flex-col mb-2">
                <button
                  className={`bg-blue-600 text-white w-full rounded-md py-2.5 text-lg font-semibold hover:bg-blue-700 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.003 8.003 0 014.01 4.545L2.586 6.01A9.96 9.96 0 002 12c0 5.523 4.477 10 10 10V16H6v1.291z"
                      ></path>
                    </svg>
                  ) : (
                    "Log In"
                  )}
                </button>
              </div>

              <div className="w-full border-t pt-2 mt-2">
                <p className="text-sm text-gray-600 mb-2">Helpful Resources:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="/documents/BTech Project Evaluation Rubric.pdf"
                    target="_blank"
                    className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition"
                  >
                    Project Evaluation Rubric
                  </a>
                  <a
                    href="/documents/Project Supervision Log.pdf"
                    target="_blank"
                    className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition"
                  >
                    Project Supervision
                  </a>
                  <a
                    href="/documents/Summer Intern Project Template.pdf"
                    target="_blank"
                    className="flex items-center text-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition"
                  >
                    Summer Intern Project Template
                  </a>
                  <a
                    href="https://youtu.be/keEpt6GNpMA?si=cVt0aIeUbZsHUvl5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-sm transition"
                  >
                    Watch Tutorial
                  </a>
                </div>
              </div>

              <div className="w-full flex items-center justify-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/sg"
                    className="font-medium text-orange-600 hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
