import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

export default function Login() {
  const [email,setEmail]=useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row items-stretch">
      <div className="relative w-full md:w-1/2 flex-shrink-0 hidden md:block">
        <img
                src="bitpiccc.jpg"

          className="w-full h-full object-cover"
          alt="bit-mesra"
        />
      </div>
      <div className="w-full md:w-1/2 bg-white flex flex-col p-6 md:p-20 justify-between">
        <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>

        <div className="w-full flex flex-col max-w-[500px]">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Student-Login</h3>
            <p className="text-base mb-2">Enter Your login details.</p>
          </div>
          <div className="w-full flex flex-col">
          <label>Email</label>

            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
                      <label>Username</label>

            <input
              type="Text"
              placeholder="Enter Your username"
             value={username}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="relative">
            <label>Password</label>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"} Password
              </button>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-full flex items-center">
              <input type="checkbox" className="w-4 h-4 mr-2" />
              <p className="text-sm">Remember Me</p>
            </div>
            <p className="text-sm cursor-pointer underline underline-offset-2 font-medium whitespace-nowrap">
              Forgot Password
            </p>
          </div>

          <div className="w-full flex flex-col my-4">
            <button
              className="bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"
            >
  <Link to="/log">Log In</Link>            </button>
            
            <button className="font-semibold bg-white text-black w-full rounded-md p-4 text-center flex items-center justify-center my-2 border-2 border-black">
            <Link to="/sg">Sign Up</Link>
            </button>
          </div>
        </div>
        <div className="w-full items-center justify-center flex">
          <p className="text-sm font-normal text-black">
            Dont have an account?
            <span className="font-semibold underline underline-offset cursor-pointer">
             
            <Link to="/sg">Sign Up</Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
