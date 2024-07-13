import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from 'axios';

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
      const response = await axios.post('/api/v1/reviews', { name, rollNumber, content });
      if (response.data) {
        Swal.fire("Success", "Review Submitted", "success");
        setName("");
        setRollNumber("");
        setContent("");
        // Optionally, you can refresh the reviews list here if needed
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message === 'Invalid roll number') {
        Swal.fire("Error", "Incorrect Roll Number. Sign up to add a review", "error");
      } else {
        Swal.fire("Error", "There was an error submitting the review!", "error");
      }
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div className="grid bg-red-700 p-16 text-white md:grid-cols-3">
      <div className="text-center leading-10">
        <p>All Rights Reserved</p>
        <p>Copyright &copy; 2024</p>
        <a href="https://bitacademicapp.ac.in">bitacademicapp.ac.in</a>
      </div>
      <div>
        <ul className="text-center leading-10">
          <li>
            <button className="text-white hover:text-gray-300 focus:outline-none">
              <Link to="/">Home</Link>
            </button>
          </li>
          <li>
            <button className="text-white hover:text-gray-300 focus:outline-none">
              <Link to="/signup">Signup</Link>
            </button>
          </li>
          <li>
            <button className="text-white hover:text-gray-300 focus:outline-none">Features</button>
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-3 text-center">
        <p>Your Review down here</p>
        <form className="flex flex-col gap-3 text-center" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border px-4 py-2 text-center"
            autoComplete="Name"
            style={{ color: 'black' }}
          />
          <input
            type="text"
            placeholder="Roll Number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="rounded-md border px-4 py-2 text-center"
            autoComplete="RollNumber"
            style={{ color: 'black' }}
          />
          <textarea
            placeholder="Enter your review"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-20 rounded-md border px-4 py-2 text-center"
            style={{ color: 'black' }}
          />
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Footer;
