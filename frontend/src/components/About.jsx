import React from "react";

const About = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-300">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-5 text-left text-black">
            ABOUT THE WEB APP
          </h2>
          <p className="text-sm md:text-xl text-gray-700 leading-relaxed">
            The academic web app for BIT Mesra College is a digital gateway to a
            world of knowledge and opportunities. Seamlessly blending
            functionality with user-friendly design, it offers students and
            faculty a centralized platform for academic pursuits. With intuitive
            navigation, students can access course materials, submit
            assignments, and track their academic progress effortlessly. Faculty
            members utilize its robust features for grading, scheduling, and
            communication with students. Beyond academics, the app serves as a
            hub for campus announcements, event updates, and community
            engagement. With its responsive interface and comprehensive
            features, the BIT Mesra academic web app enriches the college
            experience, fostering a dynamic learning environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
