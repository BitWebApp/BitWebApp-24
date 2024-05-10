import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/signup"; // Make sure to import the correct file path
import Userform from "./components/userform"; // Import the Userform component
import Sidebar from "./components/Sidebar";
import Loginadmin from "./components/Loginadmin";
import Signupadmin from "./components/Signupadmin";
import LandingPage from "./components/LandingPage";
import Academicform from "./components/academicform";
import Awardform from "./components/award-form";
export default function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/log" element={<Login />} />
          <Route path="/db" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="user-form" element={<Userform />} /> 
            <Route path="academic-form" element={<Academicform />} /> 
            <Route path="award-form" element={<Awardform />} /> 

          </Route>
        
          <Route path="/sg" element={<Signup />} />
          <Route path="/sb" element={<Sidebar />} />
          <Route path="/log.a" element={<Loginadmin />} />
          <Route path="/sg.a" element={<Signupadmin />} />
        </Routes>
      </Router>
    </div>
  );
}
