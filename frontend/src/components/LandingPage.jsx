import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import About from "./About";

export default function LandingPage() {
    return (
        <>
            <NavBar />
            <About />
            <Footer />
        </>
    );
}
