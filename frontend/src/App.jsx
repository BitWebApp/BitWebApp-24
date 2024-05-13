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
import PlacementOne from "./components/PlacementOne";
import PlacementTwo from "./components/PlacementTwo";
import PlacementThree from "./components/PlacementThree";
import HigherEducation from "./components/HigherEducation";
import ExamForm from "./components/ExamForm";
import ProjectForm from "./components/ProjectForm";
import InternshipForm from "./components/InternshipForm";
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
            <Route path="placement-one" element={<PlacementOne />} />
            <Route path="placement-two" element={<PlacementTwo />} />
            <Route path="placement-three" element={<PlacementThree />} />
            <Route path="higher-education" element={<HigherEducation />} />
            <Route path="exam-form" element={<ExamForm />} />
            <Route path="project-form" element={<ProjectForm />} />
            <Route path="internship-form" element={<InternshipForm />} />
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
