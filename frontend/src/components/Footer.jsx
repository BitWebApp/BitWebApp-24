import React, { useState } from "react";

function Footer() {

  return (
    <div className="grid bg-red-700 p-16 text-gray-400 md:grid-cols-3">
      <div className="text-center leading-10">
        <p>All Rights Reserved</p>
        <p>Copyright @2024</p>
        <a href="https://bitacademicapp.ac.in">
          bitacademicapp.ac.in
        </a>
      </div>
      <div>
        <ul className="text-center leading-10">
          <li>
            <button
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              Home
            </button>
          </li>
          <li>
            <button
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              Contact Us
            </button>
          </li>
          <li></li>
          <li>
            <button
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              Login
            </button>
          </li>
          <li>
            <button
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              Features
            </button>
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-3 text-center">
        <p>Your Review down here</p>
        <input
          type="text"
          placeholder="Name"
          className="rounded-md border px-4 py-2 text-center"
          autoComplete="Name"
        />
        <input
          type="text"
          placeholder="Enter your review"
          className="h-20 rounded-md border px-4 py-2 text-center"
        />
        <button
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Footer;
