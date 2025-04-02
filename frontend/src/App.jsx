import { useEffect, useState, React } from "react";
import PropTypes from "prop-types";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import SidebarAdmin from "./components/SideBarAdmin";
import SidebarFaculty from "./components/SideBarFaculty";
import Header from "./components/Header";
import HeaderAdmin from "./components/HeaderAdmin";
import HeaderFaculty from "./components/HeaderFaculty";
import Login from "./components/Login";
import Loginadmin from "./components/Loginadmin";
import LoginFaculty from "./components/LoginFaculty";
import Signup from "./components/signup";
import Signupadmin from "./components/Signupadmin";
import LandingPage from "./components/LandingPage";
import ForgotPassword from "./components/forgot-password";
import Features from "./components/Features";
import InterviewExperiences from "./components/InterviewExperiences";
import VerifyUsers from "./components/VerifyUsers";
import Userform from "./components/userform";
import Alumni from "./components/Alumni";
import AddWorkExperience from "./components/AddWorkExperience";
import ShowWorkExperience from "./components/ShowWorkExperience";
import ShowAllAlumni from "./components/ShowAllAlumni";
import AddProfessor from "./components/AddProfessor";
import Academicform from "./components/academicform";
import AdminAcademicRecords from "./components/AdminAcademicRecords";
import Awardform from "./components/award-form";
import Placement from "./components/Placement";
import PlacementOne from "./components/PlacementOne";
import PlacementTwo from "./components/PlacementTwo";
import PlacementThree from "./components/PlacementThree";
import ClassroomForm from "./components/ClassroomForm";
import RoomStatus from "./components/RoomStatus";
import BookedRooms from "./components/BookedRooms";
import AdminRoomRequests from "./components/AdminRoomRequests";
import Research from "./components/Research";
import HigherEducation from "./components/HigherEducation";
import ExamForm from "./components/ExamForm";
import ProjectForm from "./components/ProjectForm";
import InternshipForm from "./components/InternshipForm";
import InterviewForm from "./components/Interview-Form";
import StudentTable from "./components/StudentTable";
import AcademicTable from "./components/AcademicTable";
import AwardTable from "./components/AwardTable";
import PlacementTable from "./components/Placement-Table";
import ExamTable from "./components/examtable";
import HigherEduTable from "./components/higher-eduTable";
import ProjectTable from "./components/project-table";
import Internshiptable from "./components/internshiptable";
import StudentAwardTable from "./components/StudentAwardTable";
import Review from "./components/Review";
import AddBacklog from "./components/AddBacklog";
import BacklogTable from "./components/Backlogtable";
import PECourseForm from "./components/PECourseForm";
import PeCoursesTable from "./components/PEtable";
import PEAdminTable from "./components/PE-admin-table";
import AdminAddCompanies from "./components/AdminAddCompanies";
import CompanyAssignmentForm from "./components/CompanyAssignmentForm";
import AdminApplications from "./components/AdminApplications";
import AdminApplicationDetails from "./components/AdminApplicationDetails";
import ViewProfProjectDetails from "./components/ViewProfProjectDetails";
import StudentProjectDashboard from "./components/StudentProjectDashboard";
import StudentViewProfProjectDetails from "./components/StudentViewProfProjectDetails";
import StudentApplyProject from "./components/StudentApplyProject";
import AcceptStudents from "./components/AcceptStudents";
import { HashLoader, SyncLoader } from "react-spinners";
import IncreaseLimit from "./components/IncreaseLimit";
import AdminDashboard from "./components/AdminDashboard"
import ClassroomBookingCalendar from "./components/ClassroomBookingCalendar";
import GroupManagement from "./components/GroupManagement";
import FacultyForgotPassword from "./components/FacultyForgotPassword";
import MajorProject from "./components/MajorProject";
import UserBugReporter from "./components/UserBugReporter";
import AdminBugTrackerSummary from "./components/AdminBugTrackerSummary";
import AdminBugTrackerDetails from "./components/AdminBugTrackerDetails";
import Academicanalysis from "./components/Academicanalysis";
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
          path="interview-experiences"
          element={<InterviewExperiences />}
        />
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route
          path="/db"
          element={
            <ProtectUser>
              <Layout sidebar={Sidebar} header={Header} />
            </ProtectUser>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="alumni" element={<Alumni />} />
           
          <Route path="student-projects-dashboard" element={< StudentProjectDashboard />} />
          <Route path="student-prof-project/:id" element={< StudentViewProfProjectDetails />} />
          <Route path="student-apply-project/:id" element={< StudentApplyProject />} />
          <Route path="academic-table" element={<AcademicTable />} />
          <Route path="backlogs" element={<AddBacklog />} />
          <Route path="PE-form" element={<PECourseForm />} />
          <Route path="award-form" element={<Awardform />} />
          <Route path="exam-form" element={<ExamForm />} />
          <Route path="higher-education" element={<HigherEducation />} />
          <Route path="placement" element={<Placement />}>
            <Route path="placement-one" element={<PlacementOne />} />
            <Route path="placement-two" element={<PlacementTwo />} />
            <Route path="placement-three" element={<PlacementThree />} />
          </Route>
          <Route path="project-form" element={<ProjectForm />} />
          <Route path="internship-form" element={<InternshipForm />} />
          <Route path="interview" element={<InterviewForm />} />
          <Route path="classroom-form" element={<ClassroomForm />} />
          <Route path="apply-summer" element={<Research />} />
          <Route path="userform" element={<Userform />} />
          <Route path="add-work-experience" element={<AddWorkExperience />} />
          <Route path="show-work-experience" element={<ShowWorkExperience />} />
          <Route path="academic-form" element={<Academicform />} />
          <Route path="manage-group" element={<GroupManagement />} />
          <Route path="room-status" element={<RoomStatus />} />
          <Route path="booked-rooms" element={<BookedRooms />} />
          <Route path="major-project" element={<MajorProject />} />
          <Route path="minor-project" element={<MajorProject />} />
          <Route path="report-bug" element={<UserBugReporter />} />
          <Route
            path="booking-calendar"
            element={<ClassroomBookingCalendar />}
          />
        </Route>

        <Route
          path="/admin-db"
          element={
            <ProtectAdmin>
              <Layout sidebar={SidebarAdmin} header={HeaderAdmin} />
            </ProtectAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="student-table" element={<StudentTable />} />
          <Route path="verify-users" element={<VerifyUsers />} />
          <Route path="show-all-alumni" element={<ShowAllAlumni />} />
          <Route
            path="admin-academic-form"
            element={<AdminAcademicRecords />}
          />
          <Route path="PE-admin-table" element={<PEAdminTable />} />
          <Route path="award-table" element={<AwardTable />} />
          <Route path="exam-table" element={<ExamTable />} />
          <Route path="higher-education-table" element={<HigherEduTable />} />
          <Route path="placement-table" element={<PlacementTable />} />
          <Route path="project-form-table" element={<ProjectTable />} />
          <Route path="internship-form-table" element={<InternshipForm />} />
          <Route path="internship-table" element={<Internshiptable />} />
          <Route path="admin-room-request" element={<AdminRoomRequests />} />
          <Route path="companies-table" element={<AdminAddCompanies />} />
          <Route path="assign-company" element={<CompanyAssignmentForm />} />
          <Route path="add-prof" element={<AddProfessor />} />
          <Route path="review" element={<Review />} />
          <Route path="student-award-table" element={<StudentAwardTable />} />
          <Route path="backlogs-table" element={<BacklogTable />} />
          <Route path="PE-table" element={<PeCoursesTable />} />
          <Route path="increase-limit" element={<IncreaseLimit />} />
          <Route path="bug-tracker" element={<AdminBugTrackerSummary />} />
          <Route path="bug-tracker/:bugId" element={<AdminBugTrackerDetails />} />
          <Route path="academicanalysis" element ={<Academicanalysis />} />
        </Route>

        <Route
          path="/faculty-db"
          element={
            <ProtectFaculty>
              <Layout sidebar={SidebarFaculty} header={HeaderFaculty} />
            </ProtectFaculty>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="accept-students" element={<AcceptStudents />} />
          <Route path="major-project" element={<MajorProject />} />
          <Route path="minor-project" element={<MajorProject />} />
          <Route path="adhoc-projects-dashboard" element={<AdminDashboard />} />
          <Route path="adhoc-project/:id" element={<ViewProfProjectDetails />} />
          {/* Replace old adhoc-project-applications routes with project-specific routes */}
          {/* Old: */}
          {/* <Route path="adhoc-project-applications" element={<AdminApplications />} />
          <Route path="adhoc-project-applications/:applicationId" element={<AdminApplicationDetails />} /> */}
          
          {/* New routes for project-specific application management */}
          <Route path="adhoc-project-applications/status/:projectId" element={<AdminApplications />} />
          <Route path="adhoc-project-applications/status/:projectId/:applicationId" element={<AdminApplicationDetails />} />
          <Route path="report-bug" element={<UserBugReporter />} />
          <Route path="academicanalysis" element ={<Academicanalysis />} />
        </Route>
        <Route path="/sg" element={<Signup />} />
        <Route path="/log.a" element={<Loginadmin />} />
        <Route path="/sg.a" element={<Signupadmin />} />
        <Route path="/faculty-login" element={<LoginFaculty />} />
        <Route path="/faculty-forget-password" element={<FacultyForgotPassword />} />
      </Routes>
    </Router>
  );
}

// function ProtectedRoute({ children }) {
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const navigate = useNavigate();
//   useEffect(() => {
//     const checkUser = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get("/api/v1/users/get-user");
//         if (response.status == 200) {
//           setIsAuthenticated(true);
//         }
//       } catch (err) {
//         console.log("Error fetching user!", err);
//       } finally {
//         setLoading(false);
//       }
//       if (!isAuthenticated) {
//         setLoading(true);
//         try {
//           const response = await axios.get("/api/v1/admin/get-admin");
//           if (response.status == 200) {
//             setIsAuthenticated(true);
//           }
//         } catch (err) {
//           console.log("Error fetching admin!", err);
//         } finally {
//           setLoading(false);
//         }
//       }
//       if (!isAuthenticated) {
//         setLoading(true);
//         try {
//           const response = await axios.get("/api/v1/prof/getcurrentProf");
//           if (response.status == 200) {
//             setIsAuthenticated(true);
//           }
//         } catch (err) {
//           console.log("Error fetching admin!", err);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };
//     checkUser();
//   }, []);
//   if (loading) {
//     return (
//       <div className="h-screen w-full flex flex-col justify-center items-center">
//         <HashLoader size={150} />
//         <div className="text-xl py-10 flex font-bold font">
//           LOADING
//           <SyncLoader
//             className="translate-y-3"
//             size={5}
//             speedMultiplier={0.75}
//           />
//         </div>
//       </div>
//     );
//   }
//   if (!isAuthenticated) {
//     navigate("/");
//     return null;
//   }
//   return children;
// }

function ProtectAdmin({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/v1/admin/get-admin");
        if (response.status == 200) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log("Error fetching admin!", error);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
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
    navigate("/");
    return null;
  }
  return children;
}

function ProtectFaculty({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkFaculty = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/v1/prof/getcurrentProf");
        if (response.status == 200) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log("Error fetching faculty!", error);
      } finally {
        setLoading(false);
      }
    };
    checkFaculty();
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
    navigate("/");
    return null;
  }
  return children;
}
function ProtectUser({ children }) {
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
      } catch (error) {
        console.log("Error fetching user!", error);
      } finally {
        setLoading(false);
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
    navigate("/");
    return null;
  }
  return children;
}

ProtectAdmin.propTypes = {
  children: PropTypes.node.isRequired,
};

ProtectFaculty.propTypes = {
  children: PropTypes.node.isRequired,
};

ProtectUser.propTypes = {
  children: PropTypes.node.isRequired,
};

// ProtectedRoute.propTypes = {
//   children: PropTypes.node.isRequired,
// };
