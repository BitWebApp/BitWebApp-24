import React from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";
import About from "./About";
import ReviewCarousel from "./ReviewCarousel";

export default function LandingPage() {
    return (
        <>
            <NavBar />
            <About />
            <ReviewCarousel />
            <Footer />
        </>
    );
}
