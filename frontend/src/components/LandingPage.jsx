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
      <div className="bg-gray-300 m-auto flex justify-center items-center flex-col">
        <h2 className="text-3xl font-bold mb-8 text-blue-600">Know Your Student</h2>
        <button className="bg-blue-600 m-3 text-white font-bold rounded-md px-6 py-2 hover:bg-blue-700 transition">
          <Link to="/public-user">Find a Student</Link>
        </button>
      </div>
      <ReviewCarousel />
      <Footer />
    </>
  );
}
