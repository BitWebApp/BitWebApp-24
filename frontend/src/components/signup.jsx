import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { GridLoader } from "react-spinners";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullname, setFullname] = useState("");
  const [rollnumber, setRollnumber] = useState("");
  const [idcard, setIdcard] = useState("");
  const [spin, setSpin] = useState(false);
  const [isRollNumberValid, setIsRollNumberValid] = useState(true);
  const [otp, setOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateRollNumber = (rollNumber) => {
    const rollNumberPattern = /^BTECH\/10\d{3}\/\d{2}$/;
    return rollNumberPattern.test(rollNumber);
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleEmailVerification = async () => {
    try {
      setSpin(true);
      if (!validateEmail(email)) {
        toast.error("Please use a valid college mail address.");
        setSpin(false);
        return;
      }
      await axios.post("/api/v1/users/verifyMail", { email });
      toast.success("OTP sent to your email.");
      setIsEmailVerified(true);
    } catch (error) {
      toast.error("Email exists/Invalid Email");
    } finally {
      setSpin(false);
    }
  };

  const handleSignup = async () => {
    if (!validateRollNumber(rollnumber)) {
      setIsRollNumberValid(false);
      toast.error("Invalid roll number format. It should be BTECH/10XXX/YY");
      return;
    }
    setSpin(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);
      formData.append("fullName", fullname);
      formData.append("rollNumber", rollnumber);
      formData.append("idCard", idcard);
      formData.append("usrOTP", otp);

      const response = await axios.post("/api/v1/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      console.log(response.data);
      toast.success("Signup successful! Login using same credentials.");
      setTimeout(() => {
        navigate("/log");
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
      setSpin(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (!isEmailVerified) {
        handleEmailVerification();
      } else {
        handleSignup();
      }
    }
  };

  return (
    <div
      className="flex flex-col md:flex-row items-stretch min-h-screen"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <ToastContainer />
      <div className="relative w-full md:w-1/2 flex-shrink-0 hidden md:flex">
        <img
          src="/static/images/bitphoto.JPG"
          className="w-full h-full object-cover"
          alt="bit-mesra"
        />
      </div>
      <div className="w-full md:w-1/2 bg-gray-50 flex flex-col p-8 md:p-16 justify-center">
        <h3 className="text-2xl text-gray-800 font-bold mb-8 text-left">
          BIT WEB APP
        </h3>
        <div className="flex flex-col w-full mb-8 text-left">
          <h3 className="text-4xl font-semibold mb-3 text-left text-black">
            Student Signup
          </h3>
          <p className="text-lg text-gray-700">
            Please fill in your details to create an account.
          </p>
        </div>
        <div className="w-full flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter Your Email"
            value={email}
            readOnly={isEmailVerified}
            required
            title="Please enter a valid email address"
            className="w-full text-gray-900 py-3 px-4 mb-4 bg-white border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            onChange={(e) => !isEmailVerified && setEmail(e.target.value)}
          />
          {isEmailVerified ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                OTP
              </label>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                className="w-full text-gray-900 py-3 px-4 mb-4 bg-white border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                onChange={(e) => setOtp(e.target.value)}
              />
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter Your Username"
                value={username}
                className="w-full text-gray-900 py-3 px-4 mb-4 bg-white border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                onChange={(e) => setUsername(e.target.value)}
              />
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Password
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg py-3 px-4 mb-4 focus-within:ring-black focus-within:border-black">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Your Password"
                    className="w-full text-gray-900 bg-transparent outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-gray-700 ml-2"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Your Full Name"
                  className="w-full text-gray-900 py-3 px-4 mb-4 bg-white border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="Enter Your Roll Number (e.g., BTECH/10XXX/YY)"
                  className={`w-full text-gray-900 py-3 px-4 mb-4 bg-white border ${
                    isRollNumberValid ? "border-gray-300" : "border-red-500"
                  } rounded-lg focus:ring-black focus:border-black`}
                  value={rollnumber}
                  onChange={(e) => {
                    setRollnumber(e.target.value);
                    setIsRollNumberValid(true);
                  }}
                />
                {!isRollNumberValid && (
                  <p className="text-red-500 text-sm mb-4">
                    Invalid roll number format.
                  </p>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Upload ID Card
                </label>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="w-full text-gray-900 py-3 px-4 mb-4 bg-white border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  onChange={(e) => setIdcard(e.target.files[0])}
                />
              </div>
              <button
                className="w-full py-3 text-white bg-black hover:bg-gray-900 rounded-lg transition-all duration-200"
                onClick={handleSignup}
                disabled={spin}
              >
                {spin ? (
                  <GridLoader
                    color="white"
                    loading={spin}
                    size={10}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                ) : (
                  "Sign Up"
                )}
              </button>
            </>
          ) : (
            <button
              className="w-full py-3 text-white bg-black hover:bg-gray-900 rounded-lg transition-all duration-200"
              onClick={handleEmailVerification}
              disabled={spin}
            >
              {spin ? (
                <GridLoader
                  color="white"
                  loading={spin}
                  size={10}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              ) : (
                "Verify Email"
              )}
            </button>
          )}
        </div>
        <div className="mt-5 text-center">
          <Link
            to="/log"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-all duration-200"
          >
            Already have an account?{" "}
            <span className="text-black font-bold">Login here</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
