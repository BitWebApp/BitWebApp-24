import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = async() => {
    axios.post("/api/v1/users/login", {
      username, password
    })
    .then(response => {
      console.log(response)
      navigate('/db')
    })
    .catch(error => {
      console.log(error.message)
    })
  }

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row items-stretch">
      <div className="relative w-full md:w-1/2 flex-shrink-0 hidden md:block">
        <img
                src="/static/images/bitphoto.JPG"

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
                className="absolute bottom-4 right-4 text-gray-600 hover:text-red-900  hover:text-black-1500"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"} Password
              </button>
            </div>
          </div>
          <div className="h-8"></div>

          <div className="w-full flex items-center justify-between">
            <div className="w-full flex items-center">
              <input type="checkbox" className="w-4 h-4 mr-2" />
              <p className="text-sm">Remember Me</p>
            </div>
            <p className="text-sm cursor-pointer underline underline-offset-2 font-medium whitespace-nowrap text-blue-400">
              Forgot Password
            </p>
          </div>

          <div className="w-full flex flex-col my-4">
          <button
            className="bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"
            onClick={() => handleLogin()} 
          >
            Log In
          </button>
          </div>
        </div>
        <div className="w-full items-center justify-center flex">
          <p className="text-sm font-normal text-black">
            Dont have an account?
            <span className="font-semibold underline underline-offset cursor-pointer text-orange-600">
             
            <Link to="/sg">Sign Up</Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
