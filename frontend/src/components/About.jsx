import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-100 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Bitacademia
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Revolutionizing academic management with innovation, efficiency, and
            personalized insights for students, faculty, and administrators.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Text Content */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                What is Bitacademia?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Bitacademia is an innovative academic management platform
                designed to streamline and enhance the educational experience at
                BIT Mesra. It provides a centralized system for managing academic
                records, facilitating communication, and offering personalized
                insights to improve academic outcomes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose Bitacademia?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                With cutting-edge features like AI-driven analytics, personalized
                dashboards, and a dedicated internship portal, Bitacademia goes
                beyond traditional academic systems. It empowers users to access
                resources, track achievements, and engage in community-driven
                discussions seamlessly.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Elements */}
          <div className="flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To create a dynamic and inclusive academic ecosystem that fosters
                growth, collaboration, and success for every member of the BIT
                Mesra community.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Join the Future of Academic Management
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Experience the power of Bitacademia today and take your academic
            journey to the next level.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
            <Link to="/sg">
              Get Started
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;