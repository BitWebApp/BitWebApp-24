import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/v1/users/login", {
        email,
        password
      });

      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      console.log(response.data);
      toast.success("Login successful!");
      setTimeout(() => {
        navigate("/db");
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
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row items-stretch">
      <ToastContainer />
      <div className="relative w-full md:w-1/2 flex-shrink-0 hidden md:block">
        <img src="/static/images/bitphoto.JPG"
          className="w-full h-full object-cover"
          alt="bit-mesra"
        />
      </div>
      <div className="w-full md:w-1/2 bg-white flex flex-col p-6 md:p-20 justify-between">
        <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>

        <div className="w-full flex flex-col max-w-[500px]">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Student-Login</h3>
            <p className="text-base mb-2">Enter Your login details.</p>
          </div>
          <div className="w-full flex flex-col">
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter Your email"
              value={email}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              required
              onChange={(e) => setemail(e.target.value)}
            />
            <div className="relative">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="absolute bottom-4 right-4 text-gray-600 hover:text-red-900 hover:text-black-1500"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"} Password
              </button>
            </div>
          </div>
          <div className="h-8"></div>

          <div className="w-full flex items-center justify-between">
            <div className="w-full flex items-center">
              <input type="checkbox" className="w-4 h-4 mr-2" />
              <p className="text-sm">Remember Me</p>
            </div>
            <p className="text-sm cursor-pointer underline underline-offset-2 font-medium whitespace-nowrap text-red-600">
            <Link to="/forgot-password">Forgot Password</Link>
            </p>
          </div>

          <div className="w-full flex flex-col my-4">
            <button
              className={`bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleLogin}
              disabled={isLoading} 
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
          <div className="w-full items-center justify-center flex">
            <p className="text-sm font-normal text-black">
              Don't have an account?
              <span className="font-semibold underline underline-offset cursor-pointer text-orange-600">
                <Link to="/sg">Sign Up</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
