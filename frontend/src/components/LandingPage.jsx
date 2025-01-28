import React from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";
import About from "./About";
import ReviewCarousel from "./ReviewCarousel";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <About />
      {/* Call-to-action section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
  <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8 md:p-12">
    <div className="mb-8 md:mb-0 text-center md:text-left">
      <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Know Your Student
      </h2>
      <p className="text-gray-600 mt-4 text-lg md:text-xl max-w-md">
        Discover detailed student profiles and explore their achievements with ease. Unlock insights into their academic journey.
      </p>
    </div>
    <Link
      to="/public-user"
      className="relative inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl px-10 py-4 hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
    >
      Find a Student
      <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </span>
    </Link>
  </div>
</div>
      <ReviewCarousel />
      <Footer />
    </>
  );
}
