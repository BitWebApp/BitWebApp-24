import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function Footer() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      Swal.fire("Error", "Name is a required field", "error");
      return;
    }

    if (!rollNumber) {
      Swal.fire("Error", "Roll Number is a required field", "error");
      return;
    }

    if (!content) {
      Swal.fire("Error", "Content is a required field", "error");
      return;
    }

    try {
      const response = await axios.post("/api/v1/reviews", {
        name,
        rollNumber,
        content,
      });
      if (response.data) {
        Swal.fire("Success", "Review Submitted", "success");
        setName("");
        setRollNumber("");
        setContent("");
        // Optionally, you can refresh the reviews list here if needed
      }
    } catch (error) {
      console.log(error.response.data);
      if (error.response.status == 429) {
        Swal.fire(
          "Error",
          "You have reached the maximum number of reviews allowed per day",
          "error"
        );
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message === "Invalid roll number"
      ) {
        Swal.fire(
          "Error",
          "Incorrect Roll Number. Sign up to add a review",
          "error"
        );
      } else {
        Swal.fire(
          "Error",
          "There was an error submitting the review!",
          "error"
        );
      }
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div className="grid bg-gray-900 p-8 text-white md:grid-cols-3 gap-4">
      <div className="flex flex-col items-center justify-center text-center leading-7 border-b-2 border-gray-300 md:border-b-0 md:border-r-2 pr-4">
        <img
          src="/static/images/Birla_Institute_of_Technology_Mesra.png"
          alt="BIT Mesra Logo"
          className="w-24 h-auto mb-4"
        />
        <p className="text-base font-semibold">All Rights Reserved</p>
        <p className="text-sm font-light">&copy; 2024 | bitacademicapp.ac.in</p>
        <a
          href="https://www.bitmesra.ac.in"
          className="text-blue-300 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit our official website
        </a>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 border-b-2 border-gray-300 md:border-b-0 md:border-r-2 px-2">
        <Link
          to="/"
          className="text-sm font-medium hover:text-gray-300 transition-all duration-200"
        >
          Home
        </Link>
        <Link
          to="/signup"
          className="text-sm font-medium hover:text-gray-300 transition-all duration-200"
        >
          Signup
        </Link>
        <button className="text-sm font-medium hover:text-gray-300 transition-all duration-200">
          Features
        </button>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm font-semibold">Write down your review below</p>
        <form
          className="flex flex-col w-full max-w-sm gap-3"
          onSubmit={handleSubmit}
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-1/2 rounded-md border px-2 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="name"
              required
            />
            <input
              type="text"
              placeholder="Your Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-1/2 rounded-md border px-2 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="roll-number"
              required
            />
          </div>
          <textarea
            placeholder="Write your review here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-20 rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Footer;
