import React from "react";
import { Link } from "react-router-dom";
export default function LandingPage() {
    return (
        <div className="container min-h-screen bg-black bg-center bg-cover px-28 py-5 relative">
        <nav className="flex items-center">
            <img className="size-20 rounded-full" src="images/mesralogo.jpg"/>
            <ul className="flex-1 text-end">
                <li className="list-none inline-block px-5"><Link to="/log" className="no-underline text-white px-2">Student Login</Link></li>
                <img className="inline-block" src="images/img_profile_24_outline.svg"></img>
                <li className="list-none inline-block px-5"><Link to="/log.a" className="no-underline text-white px-2">Admin Login</Link></li>
                <img className="inline-block" src="images/img_profile_24_outline.svg"></img>
            </ul>
            
        </nav>

        <div className="text-white mt-40 max-w-xl">
            <h1 className="text-6xl font-semibold leading-normal mb-4">About The <span className="font-light"></span> Academic Web App</h1>
<p className="mt-5">The academic web app for BIT Mesra College is a digital gateway to a world of knowledge and opportunities. Seamlessly blending functionality with user-friendly design, it offers students and faculty a centralized platform for academic pursuits. With intuitive navigation, students can access course materials, submit assignments, and track their academic progress effortlessly. Faculty members utilize its robust features for grading, scheduling, and communication with students. Beyond academics, the app serves as a hub for campus announcements, event updates, and community engagement. With its responsive interface and comprehensive features, the BIT Mesra academic web app enriches the college experience, fostering a dynamic learning environment.</p>
       <div className="mt-10">
        <Link to="/log" className="bg-red-600 rounded-3xl py-3 px-8 font-medium inline-block mr-4 hover:bg-yellow-300 hover:border-yellow-400 duration-300 hover-border">Student Login</Link>
        <Link to="/log.a" className="bg-red-600 rounded-3xl py-3 px-8 font-medium inline-block mr-4 hover:bg-yellow-300 hover:border-yellow-400 duration-300 hover-border">Admin Login</Link>
       </div>
        </div>
        <img className="w-full xl:w-1/2 xl:absolute bottom-20 right-12" src="images/mesracampus.jpg"></img>
        </div>
    );
}
