import {
  HiHome,
  HiPresentationChartLine,
  HiBeaker
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
      text: "Ad-hoc Projects",
      icon: <HiPresentationChartLine />,
      to: "/faculty-db/adhoc-projects-dashboard",
    },
    {
      text: "Report Issues",
      icon: <HiBeaker />,
      to: "/faculty-db/report-bug",
    },
    {
      text: "Academic Analysis",
      icon: <HiBeaker/>,
      to: "/faculty-db/academicanalysis",
    }
  ];

  export default facultyLinks;