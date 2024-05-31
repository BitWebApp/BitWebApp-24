import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/v1/admin/register", {
        username,
        password,
      });
      console.log(response.data);
      setTimeout(() => {
        navigate("/log.a");
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="text-center my-20 mx-auto">
      <h2 className="text-2xl font-light">Join us</h2>
      <h5 className="text-lg font-light mb-5">Create your personal account</h5>
      <form
        onSubmit={handleSubmit}
        className="inline-block bg-gray-100 w-80 border border-gray-300 rounded p-8 mb-4"
      >
        <p className="mb-4">
          <label className="block text-left text-sm mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </p>
        <p className="mb-4">
          <label className="block text-left text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </p>
        <p>
          <button
            id="sub_btn"
            type="submit"
            className="w-full p-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition duration-500"
          >
            Register
          </button>
        </p>
      </form>
      <footer>
        <p>
          Already have an Account?{" "}
          <Link to="/log.a" className="text-blue-500 hover:underline">
            Log In
          </Link>
          .
        </p>
        <p>
          <Link to="/" className="text-blue-500 hover:underline">
            Back to Homepage
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
