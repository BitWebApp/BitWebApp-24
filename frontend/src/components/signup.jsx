import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

export default function Signup() {
    const [email,setEmail]=useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullname,setfullname]=useState("");
  const [rollnumber,setrollnumber]=useState("");
  const [idcard,setidcard]=useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
 
    <div className="flex flex-col md:flex-row items-stretch">
      <div className="relative w-full md:w-1/2 hidden md:block">
        <img
          src="images.jpg"
          className="w-full h-full object-cover"
          alt="bit-mesra"
        />
      </div>
      <div className="w-full md:w-1/2 bg-white flex flex-col p-6 md:p-20 justify-between">
        <h3 className="text-xl text-black font-semibold mb-9">BIT WEB APP</h3>
       
        <div className="w-full flex flex-col max-w-[500px]">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Student-Signup</h3>
            <p className="text-base mb-2">Enter Your Signup details.</p>
          </div>
          <div className="w-full flex flex-col">

          <label className="block text-sm mb-2">Email</label>
          <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
                        <label className="block text-sm mb-2">Username</label>

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
                             <label className="block text-sm mb-2">Full Name</label>

              <input
                type="text"
                placeholder="Enter Your Full-Name"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                value={fullname}
                onChange={(e) => setfullname(e.target.value)}
              /> 
              
              <label className="block text-sm mb-2">Roll Number</label>

<input
  type="text"
  placeholder="Enter Your Roll-Number"
  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
  value={rollnumber}
  onChange={(e) => setrollnumber(e.target.value)}
/> 

 <label className="block text-sm mb-2">Upload ID-Card Image</label>
<input type="file" accept="image/*" 
value={idcard}
onChange={(e) => setidcard(e.target.value)}
/>

              <button
                className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
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
           
          </div>

          <div className="w-full flex flex-col my-4">
          <button
  className="bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"
  onClick={() => navigate("/db")} 
>
  Sign Up
</button>
           
          </div>
        </div>
        <div className="w-full items-center justify-center flex">
          <p className="text-sm font-normal text-black">
            Already have an account?
            <span className="font-semibold underline underline-offset cursor-pointer text-orange-600">
             
              <Link to="/log">Log in</Link>
            </span>
          </p>
          
        </div>
      </div>
    </div>
    
  );
}
