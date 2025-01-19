import { useState, useEffect } from "react";
import {
  HiHome,
  HiUser,
  HiAcademicCap,
  HiBadgeCheck,
  HiDocumentReport,
  HiOutlineBriefcase,
  HiPresentationChartLine,
  HiBriefcase,
  HiOutlineLogout,
  HiArchive,
} from "react-icons/hi";
import axios from "axios";

export function useUserRole() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // const user = JSON.parse(localStorage.getItem("user"));
    // setIsAdmin(user?.username === "admin");
    const checkAdmin = async () => {
      try {
        const respo = await axios.get("/api/v1/admin/get-admin");
        if (respo.status == 200) {
          setIsAdmin(true);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  return isAdmin;
}

export default function useLinks() {
  const isAdmin = useUserRole();

  const additionalLinks = [
    { 
      text: "Dashboard", 
      icon: <HiHome />, 
      to: "/db" 
    },
    {
      text: "Alumni Profile", 
      icon: <HiUser />,
      to: "/db/alumni",
    },
    {
      text: "Academic Records", 
      icon: <HiAcademicCap />,
      to: "/db/academic-table",
    },
    { 
      text: "Backlogs", 
      icon: <HiAcademicCap />, 
      to: "/db/backlogs" 
    },
    { 
      text: "PE-Course", 
      icon: <HiAcademicCap />, 
      to: "/db/PE-form" 
    },
    {
      text: "Awards & Achievements",
      icon: <HiBadgeCheck />,
      to: "/db/award-form",
    },
    { 
      text: "Examinations", 
      icon: <HiDocumentReport />, 
      to: "/db/exam-form" 
    },
    {
      text: "Higher Education",
      icon: <HiAcademicCap />,
      to: "/db/higher-education",
    },
    {
      text: "Placement Records",
      icon: <HiOutlineBriefcase />,
      to: "/db/placement",
    },
    {
      text: "Projects",
      icon: <HiPresentationChartLine />,
      to: "/db/project-form",
    },
    { text: "Internships", icon: <HiBriefcase />, to: "/db/internship-form" },
    { text: "Interview Experience", icon: <HiBriefcase />, to: "/db/interview" },
   
    { 
      text: "Request Classroom", 
      icon: <HiBriefcase />, 
      to: "/db/classroom-form" 
    },
    {
      text: "Prof. Projects",
      icon: <HiPresentationChartLine />,
      to: "/db/student-projects-dashboard",
    },
  ];

  const adminLinks = [
    { 
      text: "Dashboard", 
      icon: <HiHome />, 
      to: "/db" 
    },
    { 
      text: "Student Details", 
      icon: <HiUser />, 
      to: "/db/student-table" 
    },
    { 
      text: "Verify Users", 
      icon: <HiUser />, 
      to: "/verify-users" 
    },
    {
      text: "Alumni Profiles",
      icon: <HiUser />,
      to: "/db/show-all-alumni",
    },
    {
      text: "Academic Records",
      icon: <HiAcademicCap />,
      to: "/db/admin-academic-form",
    },
    {
      text: "PE Courses",
      icon: <HiAcademicCap />,
      to: "/db/PE-admin-table",
    },
    {
      text: "Awards & Achievements",
      icon: <HiBadgeCheck />,
      to: "/db/award-table",
    },
    { 
      text: "Examinations", 
      icon: <HiDocumentReport />, 
      to: "/db/exam-table" 
    },
    {
      text: "Higher Education",
      icon: <HiAcademicCap />,
      to: "/db/higher-education-table",
    },
    {
      text: "Placement Records",
      icon: <HiOutlineBriefcase />,
      to: "/db/placement-table",
    },
    {
      text: "Projects",
      icon: <HiPresentationChartLine />,
      to: "/db/project-form-table",
    },
    {
      text: "Approve Internships",
      icon: <HiBriefcase />,
      to: "/db/internship-form-table",
    },
    {
      text: "Internship Records",
      icon: <HiBriefcase />,
      to: "/db/internship-table",
    },
    {
      text: "Room Allocations",
      icon: <HiBriefcase />,
      to: "/db/admin-room-request",
    },
    {
      text: "Companies List",
      icon: <HiArchive />,
      to: "/db/companies-table",
    },
    {
      text: "Assign Company",
      icon: <HiBriefcase />,
      to: "/db/assign-company",
    },
    {
      text: "Add Project Faculty",
      icon: <HiUser />,
      to: "/db/add-prof",
    },
    {
      text: "Student Reviews",
      icon: <HiArchive />,
      to: "/db/review",
    },
    {
      text: "Prof. Projects",
      icon: <HiPresentationChartLine />,
      to: "/db/admin-projects-dashboard",
    },
  ];

  return isAdmin ? adminLinks : additionalLinks;
}
