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
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [review, setReview] = useState("");
  const [professorData, setProfessorData] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/prof/login", {
        email,
        password,
      });
      
      console.log("Login response:", response.data); // Debug log
      
      localStorage.setItem(
        "faculty",
        JSON.stringify(response.data.data.professor)
      );
      
      setProfessorData(response.data.data.professor);
      toast.success("Login Successful!");
      
      const needsReview = response.data.data.review === false || 
                         response.data.data.review === undefined;
      
      console.log("Needs review:", needsReview); 
      
      if (needsReview) {
        setShowReviewPrompt(true);
      } else {
        navigate("/faculty-db");
      }
    } catch (error) {
      console.log("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed. Please try again.");  
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!review.trim()) {
      toast.warning("Please enter your feedback before submitting");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/v1/review-professor", {
        prof: professorData._id, // Using the stored professor _id
        content: review
      });
      
      toast.success("Thank you for your feedback!");
      navigate("/faculty-db");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const skipReview = () => {
    navigate("/faculty-db");
  };

  return (
    <div className="text-center h-screen flex flex-col justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <ToastContainer />
      
      {!showReviewPrompt ? (
        <>
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
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-auto">
  <div className="flex flex-col lg:flex-row gap-8 items-center justify-center w-full max-w-6xl my-8">
    
    {/* Left Side - Greeting Card (always visible) */}
    <div className="w-full lg:w-1/2 min-h-[400px] flex items-center justify-center">
      <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-6 md:p-8 rounded-3xl shadow-2xl text-white w-full max-w-md h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="flex justify-center space-x-4 mb-4">
            <span className="text-3xl animate-bounce">🎉</span>
            <span className="text-3xl animate-bounce delay-100">✨</span>
            <span className="text-3xl animate-bounce delay-200">🌟</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Hello, {professorData?.fullName || "Professor"}!
          </h2>
          <p className="text-lg md:text-xl font-medium mb-6 text-blue-100">
            You're the star of our academic universe
          </p>
          
          <div className="bg-white/20 backdrop-blur-sm p-4 md:p-6 rounded-2xl mb-6">
            <p className="text-base md:text-lg italic">
              "Your wisdom doesn't just teach - it transforms lives every day"
            </p>
            <div className="flex justify-center mt-3">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Right Side - Review Card (always visible) */}
    <div className="w-full lg:w-1/2 min-h-[400px] flex items-center justify-center">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-purple-100 w-full max-w-md h-full flex flex-col justify-center">
        <div className="text-center mb-4">
          <h3 className="text-2xl md:text-3xl font-bold text-purple-800 mb-2">
            Share Your Magic
          </h3>
          <p className="text-purple-600 font-medium">
            Few words of appreciation needed
          </p>
        </div>

        <div className="flex-grow flex flex-col">
          <textarea
            className="w-full flex-grow p-4 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 bg-purple-50/50 min-h-[150px]"
            placeholder="Dear Professor, what would make your experience even better?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          ></textarea>
          <p className={`text-right text-sm mt-2 ${review.length > 0 ? 'text-pink-500' : 'text-purple-400'}`}>
            {review.length > 0 ? "We treasure your insights! 💎" : "Type from your heart..."}
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
            <p className="text-sm text-center text-purple-700 mb-2 italic">
              With deepest respect and admiration,
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <p className="font-bold text-blue-600">Kushagra Sahay</p>
                <p className="text-xs text-purple-500">Team Lead, BITACADEMIA</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-pink-600">Sumit Kumar</p>
                <p className="text-xs text-purple-500">Team Lead, BITACADEMIA</p>
              </div>
            </div>
            <p className="text-xs text-center text-purple-400 mt-2">
              We cherish every word you share with us
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <button
              onClick={handleReviewSubmit}
              className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <ClipLoader size={20} color={"#fff"} className="mr-2" />
              ) : (
                <>
                  <span className="mr-2">📬</span>
                  Send Your Wisdom
                </>
              )}
            </button>
            <button
              onClick={skipReview}
              className="w-full px-4 py-2 text-sm text-purple-500 hover:text-purple-700 font-medium"
              disabled={loading}
            >
              Remind me later (we value your time)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      )}
    </div>
  );
}