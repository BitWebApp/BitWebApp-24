import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

      // Show success toast
      toast.success("Login Successful! Redirecting to dashboard...");

      setTimeout(() => {
        navigate("/admin-db/");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        const htmlDoc = new DOMParser().parseFromString(
          error.response.data,
          "text/html"
        );
        const errorElement = htmlDoc.querySelector("body");
        if (errorElement) {
          const errorMessage = errorElement.textContent.trim();
          const errormsg = errorMessage.split("at")[0].trim();
          console.log(errormsg);
          toast.error(errormsg);
        } else {
          console.log("Error: An unknown error occurred");
          toast.error("An unknown error occurred");
        }
      } else {
        console.log("Error:", error.message);
        toast.error("Error occurred during signup");
      }
    } finally {
      setLoading(false); // Set loading to false after the login process is complete
    }
  };

  return (
    <div className="text-center my-20 mx-auto">
      <ToastContainer />
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
            {loading ? <ClipLoader size={20} color={"#fff"} /> : "Login"}
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
