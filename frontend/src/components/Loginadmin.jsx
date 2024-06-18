import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true); // Set loading to true when login starts
    try {
      const response = await axios.post("/api/v1/admin/login", {
        username,
        password,
      });
      localStorage.setItem("user", JSON.stringify(response.data.data.admin));
      console.log(response);
      setTimeout(() => {
        navigate("/db/");
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false after the login process is complete
    }
  };

  return (
    <div className="text-center my-20 mx-auto">
      <h2 className="text-3xl mb-8">Admin Log In</h2>
      <form
        action="/home"
        className="inline-block bg-gray-100 w-80 border border-gray-300 rounded p-8 mb-4"
      >
        <p className="mb-4">
          <label className="block text-left text-sm mb-1">
            Username or email address
          </label>
          <input
            type="text"
            name="first_name"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </p>
        <p className="mb-4">
          <div className="flex justify-between">
            <label className="block text-left text-sm mb-1">Password</label>
            <Link
              to="/forget-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forget password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </p>
        <p>
          <button
            id="sub_btn"
            type="button"
            onClick={handleLogin}
            className="w-full p-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition duration-500"
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <ClipLoader size={20} color={"#fff"} />
            ) : (
              "Login"
            )}
          </button>
        </p>
      </form>
      <footer className="text-sm">
        <p>
          First time?{" "}
          <Link to="/sg.a" className="text-blue-500 hover:underline">
            Create an account
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
