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
      <div className="p-5 bg-gray-300 m-auto flex">
        <h2 className="mx-5 my-auto text-xl md:text-3xl font-bold text-blue-600">Know Your Student</h2>
        <button className="bg-blue-600 md:m-3 text-white font-bold rounded-md p-3 md:px-6 md:py-2 hover:bg-blue-700 transition">
          <Link to="/public-user">Find a Student</Link>
        </button>
      </div>
      <ReviewCarousel />
      <Footer />
    </>
  );
}
