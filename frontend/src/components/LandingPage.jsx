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
      <div className="bg-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between bg-white shadow-md rounded-lg p-6 md:p-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-600">
              Know Your Student
            </h2>
            <p className="text-gray-700 mt-2 text-sm md:text-base">
              Discover detailed student profiles and explore their achievements easily.
            </p>
          </div>
          <Link
            to="/public-user"
            className="bg-blue-600 text-white text-lg font-semibold rounded-md px-8 py-3 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-md transition-all"
          >
            Find a Student
          </Link>
        </div>
      </div>
      <ReviewCarousel />
      <Footer />
    </>
  );
}
