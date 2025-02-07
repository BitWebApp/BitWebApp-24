import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginFaculty() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/prof/login", {
        email,
        password,
      });
      console.log(response)
      localStorage.setItem(
        "faculty",
        JSON.stringify(response.data.data.professor)
      );
      console.log(response);
      toast.success("Login Successful! Redirecting to dashboard...");

      setTimeout(() => {
        navigate("/faculty-db");
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
        toast.error("Error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center my-20 mx-auto">
      <ToastContainer />
      <h2 className="text-3xl mb-8">Faculty Log In</h2>
      <form
        action="/home"
        className="inline-block bg-gray-100 w-80 border border-gray-300 rounded p-8 mb-4"
      >
        <p className="mb-4">
          <label className="block text-left text-sm mb-1">Email address</label>
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </p>
        <p className="mb-4">
          <div className="flex justify-between">
            <label className="block text-left text-sm mb-1">Password</label>
            <Link
              to="/forgot-password"
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
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color={"#fff"} /> : "Login"}
          </button>
        </p>
      </form>
      <footer className="text-sm flex flex-col items-center justify-center text-center">
        <p className="max-w-80 mb-2">
          If you are unable to log in, please contact an administrator for
          assistance in adding your account.
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
