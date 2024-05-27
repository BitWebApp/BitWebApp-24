import { useState, useEffect } from "react";
import { HiHome, HiUser, HiAcademicCap, HiBadgeCheck, HiDocumentReport, HiOutlineBriefcase, HiPresentationChartLine, HiBriefcase, HiOutlineLogout } from "react-icons/hi";

export function useUserRole() {
    const [isAdmin, setIsAdmin] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        setIsAdmin(user?.username === "admin");
    }, []);

    return isAdmin;
}

export  default function useLinks() {
    const isAdmin = useUserRole();

    const additionalLinks = [
        { text: "Dashboard", icon: <HiHome />, to: "/db" },
        { text: "Academic Records", icon: <HiAcademicCap />, to: "/db/academic-form" },
        { text: "Awards & Achievements", icon: <HiBadgeCheck />, to: "/db/award-form" },
        { text: "Examinations", icon: <HiDocumentReport />, to: "/db/exam-form" },
        { text: "Higher Education", icon: <HiAcademicCap />, to: "/db/higher-education" },
        { text: "Placement Records", icon: <HiOutlineBriefcase />, to: "/db/placement" },
        { text: "Projects", icon: <HiPresentationChartLine />, to: "/db/project-form" },
        { text: "Internships", icon: <HiBriefcase />, to: "/db/internship-form" }
    ];

    const adminLinks = [
        { text: "Dashboard", icon: <HiHome />, to: "/db" },
        { text: "Student Details", icon: <HiUser />, to: "/db/student-table" },
        { text: "Academic Records", icon: <HiAcademicCap />, to: "/db/admin-academic-form" },
        { text: "Awards & Achievements", icon: <HiBadgeCheck />, to: "/db/award-table" },
        { text: "Examinations", icon: <HiDocumentReport />, to: "/db/exam-table" },
        { text: "Higher Education", icon: <HiAcademicCap />, to: "/db/higher-education-table" },
        { text: "Placement Records", icon: <HiOutlineBriefcase />, to: "/db/placement-table" },
        { text: "Projects", icon: <HiPresentationChartLine />, to: "/db/project-form-table" },
        { text: "Internships", icon: <HiBriefcase />, to: "/db/internship-form-table" }
    ];

    return isAdmin ? adminLinks : additionalLinks;
}
