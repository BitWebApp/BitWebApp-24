import {
  HiHome,
  HiPresentationChartLine,
  HiBeaker,
} from "react-icons/hi";
import { FileText, GraduationCap } from "lucide-react";

const facultyLinks = [
  {
    text: "Dashboard",
    icon: <HiHome />,
    to: "/faculty-db",
  },
  {
    text: "Summer Training",
    icon: <HiHome />,
    to: "/faculty-db/accept-students",
  },
  {
    text: "Major Project",
    icon: <HiPresentationChartLine />,
    to: "/faculty-db/accept-major-project",
  },
  {
    text: "Minor Project",
    icon: <HiPresentationChartLine />,
    to: "/faculty-db/accept-minor-project",
  },
  {
    text: "MCA Minor Project",
    icon: <FileText className="w-5 h-5" />,
    to: "/faculty-db/course-document?course=MCA%20Minor%20Project",
  },
  {
    text: "MCA Major Project",
    icon: <FileText className="w-5 h-5" />,
    to: "/faculty-db/course-document?course=MCA%20Major%20Project",
  },
  {
    text: "MTech Thesis 1",
    icon: <GraduationCap className="w-5 h-5" />,
    to: "/faculty-db/course-document?course=MTech%20Thesis%201",
  },
  {
    text: "MTech Thesis 2",
    icon: <GraduationCap className="w-5 h-5" />,
    to: "/faculty-db/course-document?course=MTech%20Thesis%202",
  },
  {
    text: "Ad-hoc Projects",
    icon: <HiPresentationChartLine />,
    to: "/faculty-db/adhoc-projects-dashboard",
  },
  {
    text: "Project 1",
    icon: <HiPresentationChartLine />,
    to: "/faculty-db/accept-project1",
  },
  {
    text: "Report Issues",
    icon: <HiBeaker />,
    to: "/faculty-db/report-bug",
  },
  {
    text: "Academic Analysis",
    icon: <HiBeaker />,
    to: "/faculty-db/academicanalysis",
  },
];

export default facultyLinks;