import axios from "axios";
import classNames from "classnames";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    HiAcademicCap,
    HiArchive,
    HiBadgeCheck,
    HiBeaker,
    HiBriefcase,
    HiDocumentReport,
    HiHome,
    HiOutlineBriefcase,
    HiOutlineLogout,
    HiPresentationChartLine,
    HiUser,
    HiUserAdd
} from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileText } from "lucide-react";
const linkclasses =
  "flex items-center gap-5 font-normal p-2.5 hover:bg-neutral-800 hover:no-underline active:bg-neutral-800 rounded-md text-sm transition-colors";

export default function Sidebar() {
  const Sidebar_animation = {
    open: {
      width: "15rem",
      transition: {
        damping: 40,
      },
    },
    closed: {
      width: "4rem",
      transition: {
        damping: 40,
      },
    },
  };
  const [isOpen, setIsOpen] = useState(true);
  const adminLinks = [
    { 
      text: "Dashboard", 
      icon: <HiHome />, 
      to: "/admin-db" 
    },
    { 
      text: "Student Details", 
      icon: <HiUser />, 
      to: "/admin-db/student-table" 
    },
    {
      text: "Verify Users",
      icon: <HiUser />,
      to: "/admin-db/verify-users"
    },
    {
      text: "User Onboarding",
      icon: <HiUserAdd />,
      to: "/admin-db/user-onboarding",
    },
    {
      text: "Alumni Profiles",
      icon: <HiUser />,
      to: "/admin-db/show-all-alumni",
    },
    {
      text: "Academic Records",
      icon: <HiAcademicCap />,
      to: "/admin-db/admin-academic-form",
    },
    {
      text: "Professors Records",
      icon: <HiAcademicCap />,
      to: "/admin-db/professors-table",
    },
    {
      text: "PE Courses",
      icon: <HiAcademicCap />,
      to: "/admin-db/PE-admin-table",
    },
    {
      text: "Awards & Achievements",
      icon: <HiBadgeCheck />,
      to: "/admin-db/award-table",
    },
    { 
      text: "Examinations", 
      icon: <HiDocumentReport />, 
      to: "/admin-db/exam-table" 
    },
    {
      text: "Higher Education",
      icon: <HiAcademicCap />,
      to: "/admin-db/higher-education-table",
    },
    {
      text: "Placement Records",
      icon: <HiOutlineBriefcase />,
      to: "/admin-db/placement-table",
    },
    {
      text: "Projects",
      icon: <HiPresentationChartLine />,
      to: "/admin-db/project-form-table",
    },
    // {
    //   text: "Approve Internships",
    //   icon: <HiBriefcase />,
    //   to: "/admin-db/internship-form-table",
    // },
    {
      text: "Summer Internship Records",
      icon: <HiBriefcase />,
      to: "/admin-db/internship-table",
    },
    {
      text: "Minor Project Records",
      icon: <HiBriefcase />,
      to: "/admin-db/minor-project-table",
    },
    {
      text: "Major Project Records",
      icon: <HiBriefcase />,
      to: "/admin-db/major-project-table",
    },
    {
      text: "Project 1 Records",
      icon: <HiBriefcase />,
      to: "/admin-db/project1-table",
    },
    {
      text: "Room Allocations",
      icon: <HiBriefcase />,
      to: "/admin-db/admin-room-request",
    },
    {
      text:"Increase Faculty Limits",
      icon:<HiArchive />,
      to:"/admin-db/increase-limit"
    },
    {
      text: "Companies List",
      icon: <HiArchive />,
      to: "/admin-db/companies-table",
    },

    {
      text: "Add Project Faculty",
      icon: <HiUser />,
      to: "/admin-db/add-prof",
    },
    {
      text: "Student Reviews",
      icon: <HiArchive />,
      to: "/admin-db/review",
    },
    {
      text: "Bug Tracker",
      icon: <HiBeaker/>,
      to: "/admin-db/bug-tracker",
    },
    {
      text: "Academic Analysis",
      icon: <HiBeaker/>,
      to: "/admin-db/academicanalysis",
    }
  ];

  // State for master admin role
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  
  useEffect(() => {
    const checkMasterAdmin = async () => {
      try {
        const response = await axios.get("/api/v1/admin/get-admin");
        if (response.data?.data?.role === "master") {
          setIsMasterAdmin(true);
        }
      } catch (err) {
        console.log("Not master admin or error checking role");
      }
    };
    checkMasterAdmin();
  }, []);

  // Add Manage Admins link for master admins
  const finalLinks = isMasterAdmin
    ? [...adminLinks, {
        text: "Reassign Major Mentor",
        icon: <HiArchive />,
        to: "/admin-db/reassign-major-mentor",
      }, {
        text: "Course Documents (PDF)",
        icon: <FileText className="w-5 h-5" />,
        to: "/admin-db/upload-course-docs",
      }, {
        text: "Manage Admins",
        icon: <HiUser />,
        to: "/admin-db/manage-admins",
      }]
    : adminLinks;
  // const [isAdmin, setIsAdmin] = useState(true);

  // useEffect(() => {
  //     const user = JSON.parse(localStorage.getItem("user"));
  //             setIsAdmin(user.username === "admin");
  // }, []);

  // const links = isAdmin ? adminLinks : additionalLinks;
  const links = finalLinks;
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    // try {
    //   const response = await axios.post("/api/v1/users/logout");
    //   // console.log(response);
    //   localStorage.removeItem("user");
    //   navigate("/");
    // } catch (error) {
    //   // console.log(error);
      try {
        const resp = await axios.post("/api/v1/admin/logout");
        // console.log(resp);
        localStorage.removeItem("user");
        navigate("/");
      } catch (err) {
        // console.log(err);
      }
     finally {
      navigate("/");
    }
  };

  return (
    <aside>
      <motion.div
        variants={Sidebar_animation}
        animate={isOpen ? "open" : "closed"}
        className="relative left-0 top-0 flex h-screen flex-col overflow-y-scroll overflow-x-hidden lg:overflow-y-scroll z-50 bg-black p-3 text-white"
        style={{ scrollbarWidth: "none" }}
      >
        <Link to="/">
          <img
            className="w-[50%] m-auto"
            src="/static/images/Birla_Institute_of_Technology_Mesra.png"
            alt=""
          />
        </Link>

        <div className="whitespace-pre flex-1 py-4 text-sm flex flex-col gap-1">
          {links.map((link, index) => (
            <Link
              to={link.to}
              key={index}
              className={classNames(
                "cursor-pointer border-t text-neutral-200 hover:text-white border-neutral-800",
                linkclasses
              )}
            >
              <span className="text-xl shrink-0">{link.icon}</span>
              {isOpen && <span className="truncate text-sm font-medium">{link.text}</span>}
            </Link>
          ))}
          <div
            onClick={() => handleLogout()}
            className={classNames(
              "text-red-400 hover:text-red-300 hover:bg-neutral-800 mt-[2rem] cursor-pointer border-t border-neutral-800",
              linkclasses
            )}
          >
            <span className="text-xl shrink-0">
              <HiOutlineLogout />
            </span>
            {isOpen && <span>Logout</span>}
          </div>

          <div
            onClick={() => setIsOpen(!isOpen)}
            className={classNames(
              "text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer border-t border-neutral-800",
              linkclasses
            )}
          >
            <span className="text-xl shrink-0">
              <IoIosArrowBack className={`transition-transform duration-200 ${isOpen ? "" : "rotate-180"}`} />
            </span>
            {isOpen && <span>Collapse</span>}
          </div>
        </div>
      </motion.div>
    </aside>
  );
}
