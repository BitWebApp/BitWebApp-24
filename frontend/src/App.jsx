import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import ForgotPassword from "./components/forgot-password";
import InterviewForm from "./components/Interview-Form";
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
import Internshiptable from "./components/internshiptable";
import axios from "axios";
import PropTypes from "prop-types";
import VerifyUsers from "./components/VerifyUsers";
import { HashLoader, SyncLoader } from "react-spinners";
import AdminAcademicRecords from "./components/AdminAcademicRecords";
import StudentAwardTable from "./components/StudentAwardTable";
import Review from "./components/Review";
import AddBacklog from "./components/AddBacklog"
import BacklogTable from "./components/Backlogtable";
import PECourseForm from "./components/PECourseForm";
import PeCoursesTable from "./components/PEtable";
import PEAdminTable from "./components/PE-admin-table"
import ClassroomForm from "./components/ClassroomForm";
import RoomStatus from "./components/RoomStatus";
import BookedRooms from "./components/BookedRooms";
import AdminRoomRequests from "./components/AdminRoomRequests";
import AdminAddCompanies from "./components/AdminAddCompanies";
import CompanyAssignmentForm from "./components/CompanyAssignmentForm";
import Features from "./components/Features";
import ScrollToTop from "./components/ScrollToTop";
import Alumni from "./components/Alumni";
import AddWorkExperience from "./components/AddWorkExperience";
import ShowWorkExperience from "./components/ShowWorkExperience";
import ShowAllAlumni from "./components/ShowAllAlumni";
import InterviewExperiences from "./components/InterviewExperiences";
import AddProfessor from "./components/AddProfessor";
export default function App() {
  return (
    <Router>

      <ScrollToTop />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/public-user" element={<Dashboard />} />
        <Route path="/log" element={<Login />} />
        <Route path="/features" element={<Features />} />
        <Route
          path="/db"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="user-form" element={<Userform />} />
          <Route path="alumni" element={<Alumni />} />
          <Route path="add-work-experience" element={<AddWorkExperience />} />
          <Route path="show-work-experience" element={<ShowWorkExperience />} />
          <Route path="show-all-alumni" element={<ShowAllAlumni />} />
          <Route path="add-prof" element={<AddProfessor/>}/> 
          <Route path="academic-form" element={<Academicform />} />
          <Route path="admin-academic-form" element={<AdminAcademicRecords />} />
          <Route path="award-form" element={<Awardform />} />
          <Route path="placement" element={<Placement />}>
            <Route path="placement-one" element={<PlacementOne />} />
            <Route path="placement-two" element={<PlacementTwo />} />
            <Route path="placement-three" element={<PlacementThree />} />
          </Route>

          <Route path="classroom-form" element={<ClassroomForm />} />
          <Route path="room-status" element={<RoomStatus />} />
          <Route path="booked-rooms" element={<BookedRooms />} />
          <Route path="admin-room-request" element={<AdminRoomRequests />} />
          

          <Route path="higher-education" element={<HigherEducation />} />
          <Route path="exam-table" element={<ExamTable />} />
          <Route path="project-form" element={<ProjectForm />} />
          <Route path="internship-form" element={<InternshipForm />} />
          <Route path="interview" element={<InterviewForm />} />
          <Route path="Student-Table" element={<StudentTable />} />
          <Route path="academic-table" element={<AcademicTable />} />
          <Route path="award-table" element={<AwardTable />} />
          <Route path="placement-Table" element={<PlacementTable />} />
          <Route path="higher-education-table" element={<HigherEduTable />} />
          <Route path="exam-form" element={<ExamForm />} />
          <Route path="project-form-table" element={<ProjectTable />} />
          <Route path="internship-form-table" element={<InternTable />} />
          <Route path="internship-table" element={<Internshiptable />} />
          <Route path="student-award-table" element={<StudentAwardTable />} />
          <Route path="PE-Form" element={<PECourseForm />} />
          <Route path="PE-table" element={<PeCoursesTable />} />
          <Route path="PE-admin-table" element={<PEAdminTable />} />
          <Route path="backlogs" element={<AddBacklog />} />
          <Route path="review" element={<Review />} />
          <Route path="backlogs-table" element={<BacklogTable />} />
          <Route path="companies-table" element={<AdminAddCompanies />} />
          <Route path="assign-company" element={<CompanyAssignmentForm />} />
          <Route path="interview-experiences" element={<InterviewExperiences />} />
        </Route>
        <Route path="verify-users" element={<VerifyUsers />} />
        <Route path="/sg" element={<Signup />} />
        <Route path="/sb" element={<Sidebar />} />
        <Route path="/log.a" element={<Loginadmin />} />
        <Route path="/sg.a" element={<Signupadmin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

      </Routes>
    </Router>
  );
}

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/v1/users/get-user");
        if (response.status == 200) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.log("Error fetching user!", err);
      } finally {
        setLoading(false);
      }
      if (!isAuthenticated) {
        setLoading(true);
        try {
          const response = await axios.get("/api/v1/admin/get-admin");
          if (response.status == 200) {
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.log("Error fetching admin!", err);
        } finally {
          setLoading(false);
        }
      }
    };
    checkUser();
  }, []);
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center">
        <HashLoader size={150} />
        <div className="text-xl py-10 flex font-bold font">
          LOADING
          <SyncLoader
            className="translate-y-3"
            size={5}
            speedMultiplier={0.75}
          />
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    navigate("/log");
    return null;
  }
  return children;
}
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
