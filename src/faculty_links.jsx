import {
  HiHome,
  HiPresentationChartLine,
  HiBeaker,
  HiDocumentText,
  HiAcademicCap,
} from "react-icons/hi";

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
    icon: <HiDocumentText />,
    to: "/faculty-db/course-document?course=MCA%20Minor%20Project",
    isCourseDoc: true,
    courseName: "MCA Minor Project",
  },
  {
    text: "MCA Major Project",
    icon: <HiDocumentText />,
    to: "/faculty-db/course-document?course=MCA%20Major%20Project",
    isCourseDoc: true,
    courseName: "MCA Major Project",
  },
  {
    text: "MTech Thesis 1",
    icon: <HiAcademicCap />,
    to: "/faculty-db/course-document?course=MTech%20Thesis%201",
    isCourseDoc: true,
    courseName: "MTech Thesis 1",
  },
  {
    text: "MTech Thesis 2",
    icon: <HiAcademicCap />,
    to: "/faculty-db/course-document?course=MTech%20Thesis%202",
    isCourseDoc: true,
    courseName: "MTech Thesis 2",
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