import React from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";
import About from "./About";
import ReviewCarousel from "./ReviewCarousel";
import Features from "./Features"
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <About />
      <Features />
      <ReviewCarousel />
      <Footer />
    </>
  );
}
