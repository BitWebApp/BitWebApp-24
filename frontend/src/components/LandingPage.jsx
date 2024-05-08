import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";

export default function LandingPage() {
    return (
        <div className="container min-h-screen bg-gray-100 text-gray-800 px-5 py-8 md:px-10 lg:px-20 xl:px-28 relative">
            <nav className="flex items-center justify-between">
                
                <img className="h-12 w-auto rounded-full" src="images/mesralogo.jpg" alt="Logo" />
                <ul className="flex items-center space-x-5">
                <li>
                        <Link to="/log" className="no-underline text-gray-800 hover:text-red-600 text-sm md:text-base font-semibold">Student Login</Link>
                    </li>
                    <Link to='log'> 
                    <li> 
                        <img className="inline-block w-6 h-6" src="https://e7.pngegg.com/pngimages/549/560/png-clipart-computer-icons-login-scalable-graphics-email-accountability-blue-logo-thumbnail.png" alt="Profile" />
                    </li>
                    </Link>

                    <li>
                        <Link to="/log.a" className="no-underline text-gray-800 hover:text-red-600 text-sm md:text-base font-semibold">Admin Login</Link>
                    </li>
                    <li>
                    <Link to='sg'> 
                        <img className="inline-block w-6 h-6" src="data:image/png;base64,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" alt="Profile" />
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="mt-10 md:mt-20 lg:mt-40 max-w-full md:max-w-3xl">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold leading-normal mb-4">About The Academic Web App</h1>
                <p className="mt-5 text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">The academic web app for BIT Mesra College is a digital gateway to a world of knowledge and opportunities. Seamlessly blending functionality with user-friendly design, it offers students and faculty a centralized platform for academic pursuits. With intuitive navigation, students can access course materials, submit assignments, and track their academic progress effortlessly. Faculty members utilize its robust features for grading, scheduling, and communication with students. Beyond academics, the app serves as a hub for campus announcements, event updates, and community engagement. With its responsive interface and comprehensive features, the BIT Mesra academic web app enriches the college experience, fostering a dynamic learning environment.</p>
                <div className="mt-10 flex flex-col md:flex-row">
                <Link to="/log" className="bg-red-600 rounded-full py-3 px-6 md:px-8 font-medium inline-block mb-4 md:mb-0 md:mr-4 text-white transition duration-300 ease-in-out hover:bg-red-700 hover:shadow-lg">Student Login</Link>
                    <Link to="/log.a" className="bg-red-600 rounded-full py-3 px-6 md:px-8 font-medium inline-block text-white transition duration-300 ease-in-out hover:bg-red-700 hover:shadow-lg">Admin Login</Link>
                </div>
            </div>
            <div>
    <div class="mb-4 bg-white-200 p-4"></div>
    
</div>

            <img className="w-full md:w-1/2 bottom-20 right-0 md:right-12" src="images/mesracampus.jpg" alt="Campus" />
            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
}
