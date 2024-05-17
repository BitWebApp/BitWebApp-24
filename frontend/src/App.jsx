import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/signup";
import Userform from "./components/userform";
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
import Placement from "./components/Placement";
import InternshipForm from "./components/InternshipForm";
import StudentTable from "./components/StudentTable";
import AcademicTable from "./components/AcademicTable";
import AwardTable from "./components/AwardTable";
import PlacementTable from "./components/Placement-Table";
import ExamTable from "./components/examtable";
import HigherEduTable from "./components/higher-eduTable";
import ProjectTable from "./components/project-table";
import InternTable from "./components/intern-table";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/log" element={<Login />} />
        <Route path="/db" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="user-form" element={<Userform />} />
          <Route path="academic-form" element={<Academicform />} />
          <Route path="award-form" element={<Awardform />} />
          <Route path="placement" element={<Placement />}>
            <Route path="placement-one" element={<PlacementOne />} />
            <Route path="placement-two" element={<PlacementTwo />} />
            <Route path="placement-three" element={<PlacementThree />} />
          </Route>
          <Route path="higher-education" element={<HigherEducation />} />
          <Route path="exam-table" element={<ExamTable />} />
          <Route path="project-form" element={<ProjectForm />} />
          <Route path="internship-form" element={<InternshipForm />} />
          <Route path="Student-Table" element={<StudentTable />} />
          <Route path="academic-table" element={<AcademicTable />} />
          <Route path="award-table" element={<AwardTable />} />
          <Route path="placement-Table" element={<PlacementTable />} />
          <Route path="higher-education-table" element={<HigherEduTable />} />
          <Route path="exam-form" element={<ExamForm />} />
          <Route path="project-form-table" element={<ProjectTable />} />
          <Route path="internship-form-table" element={<InternTable />} />
        </Route>
        <Route path="/sg" element={<Signup />} />
        <Route path="/sb" element={<Sidebar />} />
        <Route path="/log.a" element={<Loginadmin />} />
        <Route path="/sg.a" element={<Signupadmin />} />
      </Routes>
    </Router>
  );
}
