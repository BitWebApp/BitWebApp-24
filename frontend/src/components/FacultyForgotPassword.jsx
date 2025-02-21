import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FacultyForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/prof/forgot-pass", { email });
      toast.success("OTP sent to your email address.");
      setOtpSent(true);
    } catch (error) {
      toast.error("Failed to send OTP. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const isValidPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  const handleChangePassword = async () => {
    if (!isValidPassword(newPassword)) {
      toast.error("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/v1/prof/change-pass", { email, otp, newpassword: newPassword });
      toast.success("Password changed successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/faculty-login");
      }, 2000);
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center my-20 mx-auto">
      <ToastContainer />
      <h2 className="text-3xl mb-8">Faculty Forgot Password</h2>
      <form className="inline-block bg-gray-100 w-80 border border-gray-300 rounded p-8 mb-4">
        <p className="mb-4">
          <label className="block text-left text-sm mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={otpSent}
          />
        </p>
        {otpSent && (
          <>
            <p className="mb-4">
              <label className="block text-left text-sm mb-1">OTP</label>
              <input
                type="text"
                name="otp"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </p>
            <p className="mb-4">
              <label className="block text-left text-sm mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </p>
            <p className="mb-4">
              <label className="block text-left text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </p>
          </>
        )}
        <p>
          <button
            type="button"
            onClick={otpSent ? handleChangePassword : handleSendOtp}
            className="w-full p-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition duration-500"
            disabled={loading}
          >
            {loading ? (
              <ClipLoader size={20} color={"#fff"} />
            ) : otpSent ? (
              "Change Password"
            ) : (
              "Get OTP"
            )}
          </button>
        </p>
      </form>
      <footer className="text-sm">
        <p>
          Remember your password?{" "}
          <Link to="/faculty/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
          .
        </p>
        <p>
          <Link to="/faculty" className="text-blue-500 hover:underline">
            Back to Faculty Homepage
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}