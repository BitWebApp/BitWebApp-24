import React from "react";
import {
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Sun,
  Users,
  Presentation,
  Bug,
  Building2,
  FolderGit2,
} from "lucide-react";
import { getStudentYear } from "./utils/studentYear";

export const studentLinks = [
  {
    text: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    to: "/db",
  },
  {
    text: "Alumni",
    icon: <UserCheck className="w-5 h-5 shrink-0" />,
    to: "/db/alumni",
  },
  {
    text: "Academic Records",
    icon: <GraduationCap className="w-5 h-5 shrink-0" />,
    to: "/db/academic-table",
  },
  {
    text: "PE-Course",
    icon: <BookOpen className="w-5 h-5 shrink-0" />,
    to: "/db/PE-form",
  },
  {
    text: "Interview Experience",
    icon: <MessageSquare className="w-5 h-5 shrink-0" />,
    to: "/db/interview",
  },
  {
    text: "Apply to Summer",
    icon: <Sun className="w-5 h-5 shrink-0" />,
    to: "/db/apply-summer",
  },
  {
    text: "Manage Summer Intern Group",
    icon: <Users className="w-5 h-5 shrink-0" />,
    to: "/db/manage-group",
  },
  {
    text: "Apply to Minor",
    icon: <FolderGit2 className="w-5 h-5 shrink-0" />,
    to: "/db/apply-minor",
  },
  {
    text: "Manage Minor Group",
    icon: <Users className="w-5 h-5 shrink-0" />,
    to: "/db/manage-minor-group",
  },
  {
    text: "Apply to Major",
    icon: <FolderGit2 className="w-5 h-5 shrink-0" />,
    to: "/db/apply-major",
  },
  {
    text: "Manage Major Group",
    icon: <Users className="w-5 h-5 shrink-0" />,
    to: "/db/manage-major-group",
  },
  {
    text: "Project 1 Group",
    icon: <Users className="w-5 h-5 shrink-0" />,
    to: "/db/project1-group",
    minYear: 3,
  },
  {
    text: "Apply to Project 1",
    icon: <Presentation className="w-5 h-5 shrink-0" />,
    to: "/db/apply-project1",
    minYear: 3,
  },
  {
    text: "Report Issues",
    icon: <Bug className="w-5 h-5 shrink-0" />,
    to: "/db/report-bug",
  },
  {
    text: "Assign Company",
    icon: <Building2 className="w-5 h-5 shrink-0" />,
    to: "/db/assign-company",
  },
];

export const getVisibleStudentLinks = (user) => {
  const batch = user?.batch;
  const studentYear = getStudentYear(batch);

  return studentLinks.filter((link) => {
    if (studentYear !== null && studentYear !== undefined && !Number.isNaN(studentYear)) {
      if (link.minYear) {
        return studentYear >= link.minYear;
      }
      if (link.year) {
        return link.year === studentYear;
      }
    }
    return true;
  });
};

export default studentLinks;
