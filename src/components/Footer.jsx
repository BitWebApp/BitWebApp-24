import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function Footer() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !rollNumber || !content) {
      Swal.fire("Error", "All fields are required!", "error");
      return;
    }

    try {
      const response = await axios.post("/api/v1/reviews", {
        name,
        rollNumber,
        content,
      });
      if (response.data) {
        Swal.fire("Success", "Review Submitted!", "success");
        setName("");
        setRollNumber("");
        setContent("");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      const errorMessage =
        error.response?.data?.message || "There was an error submitting the review!";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-5 lg:px-20">
        {/* Section 1: Logo and Info */}
        <div className="flex flex-col items-center text-center space-y-4">
          <img
            src="/static/images/Birla_Institute_of_Technology_Mesra.png"
            alt="BIT Mesra Logo"
            className="w-28 h-auto"
          />
          <h1 className="text-lg font-semibold tracking-wider">All Rights Reserved</h1>
          <p className="text-sm">&copy; 2025 | bitacademicapp.ac.in</p>
          <a
            href="https://www.bitmesra.ac.in"
            className="text-blue-400 hover:text-blue-300 transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit our official website
          </a>
        </div>

        {/* Section 2: Quick Links */}
        <div className="flex flex-col items-center text-center space-y-3">
          <h2 className="text-lg font-semibold tracking-wide text-blue-400">Quick Links</h2>
          <Link
            to="/"
            className="text-sm font-medium hover:text-blue-300 transition-all duration-200"
          >
            Home
          </Link>
          <Link
            to="/sg"
            className="text-sm font-medium hover:text-blue-300 transition-all duration-200"
          >
            Signup
          </Link>
          <Link
            to="/features"
            className="text-sm font-medium hover:text-blue-300 transition-all duration-200"
          >
            Features
          </Link>
          <Link
            to="/interview-experiences"
            className="text-sm font-medium hover:text-blue-300 transition-all duration-200"
          >
            Interview Experiences
          </Link>
        </div>

        {/* Section 3: Review Form */}
        <div className="flex flex-col items-center text-center space-y-5">
          <h2 className="text-lg font-semibold tracking-wide text-blue-400">Leave a Review</h2>
          <form
            className="w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-lg space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-md border border-gray-600 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="name"
              />
              <input
                type="text"
                placeholder="Your Roll Number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="flex-1 rounded-md border border-gray-600 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="roll-number"
              />
            </div>
            <textarea
              placeholder="Write your review here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-28 rounded-md border border-gray-600 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-all duration-200"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Footer;