import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

export default function InternshipForm() {
  const [internshipType, setInternshipType] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [mentor, setMentor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [idCard, setIdCard] = useState(null);
  const [spin, setSpin] = useState(false);
  const [professors, setProfessors] = useState([]);
  const [companyList, setCompanyList] = useState([]);

  const roleList = [
    "Software Engineering Intern",
    "Frontend Developer Intern",
    "Backend Developer Intern",
    "Full Stack Developer Intern",
    "Mobile App Developer Intern",
    "Embedded Systems Intern",
    "Quality Assurance Engineer Intern",
    "Site Reliability Engineer (SRE) Intern",
    "DevOps Engineer Intern",
    "Firmware Developer Intern",
    "Data Scientist Intern",
    "Data Engineer Intern",
    "Business Intelligence Analyst Intern",
    "Machine Learning Engineer Intern",
    "Artificial Intelligence Engineer Intern",
    "Natural Language Processing (NLP) Intern",
    "Computer Vision Engineer Intern",
    "Deep Learning Engineer Intern",
    "Cybersecurity Intern",
    "Network Engineer Intern",
    "Cloud Security Intern",
    "Application Security Intern",
    "Penetration Testing Intern",
    "IoT Security Intern",
    "Cloud Engineer Intern",
    "Infrastructure Engineer Intern",
    "System Administrator Intern",
    "Product Manager Intern",
    "Technical Program Manager Intern",
    "Project Coordinator Intern",
    "UI/UX Designer Intern",
    "Game Developer Intern",
    "AR/VR Developer Intern",
    "Blockchain Developer Intern",
    "Robotics Engineer Intern",
    "Software Testing Intern",
    "Research Intern (AI/ML)",
    "Research Intern (Cybersecurity)",
    "Research Intern (Data Science)",
    "Tech Writer Intern",
    "Solutions Architect Intern",
    "Hardware Design Engineer Intern",
    "Digital Marketing Analyst Intern",
  ];

  // Fetch companies and professors
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await axios.get("/api/v1/users/get-user-companies");
        setCompanyList(data?.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to load company list!");
      }
    };

    const fetchProfessors = async () => {
      try {
        const { data } = await axios.get("/api/v1/prof/getProf");
        // console.log(data)
        setProfessors(data?.message || []);
      } catch (error) {
        console.error("Error fetching professors:", error);
        toast.error("Failed to load professor list!");
      }
    };

    fetchCompanies();
    if (internshipType === "research" && location === "inside_bit") {
      fetchProfessors();
    }
  }, [internshipType, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !internshipType ||
      !location ||
      !startDate ||
      !endDate ||
      (internshipType === "industrial" && (!company || !role)) ||
      (internshipType === "research" && !mentor) ||
      (location === "outside_bit" && !idCard)
    ) {
      toast.error("Please fill in all the required fields!");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to submit the form?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, submit it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSpin(true);
        try {
          const formData = new FormData();
          formData.append("type", internshipType);
          formData.append("location", location);
          formData.append("company", company);
          formData.append("role", role);
          formData.append("mentor", mentor);
          formData.append("startDate", startDate);
          formData.append("endDate", endDate);
          formData.append("doc", idCard);

          await axios.post("/api/v1/intern/addinternship", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          toast.success("Form submitted successfully!");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          // console.log(error)
          toast.error(error.message);
        } finally {
          setSpin(false);
        }
      }
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <ToastContainer />
      <div className="w-full flex flex-col p-10">
        <h3 className="text-3xl font-semibold mb-6">Internship/Research Form</h3>
        <form onSubmit={handleSubmit}>
          <label>Type</label>
          <select
            value={internshipType}
            onChange={(e) => setInternshipType(e.target.value)}
            className="w-full py-2 my-2 border-b border-black"
          >
            <option value="" disabled>
              Select Type
            </option>
            <option value="industrial">Industrial Internship</option>
            <option value="research">Research Project</option>
          </select>

          <label>Location</label>
          <div className="my-2">
            <label>
              <input
                type="radio"
                value="inside_bit"
                checked={location === "inside_bit"}
                onChange={(e) => setLocation(e.target.value)}
              />
              Inside BIT
            </label>
            <label className="ml-4">
              <input
                type="radio"
                value="outside_bit"
                checked={location === "outside_bit"}
                onChange={(e) => setLocation(e.target.value)}
              />
              Outside BIT
            </label>
          </div>

          {internshipType === "industrial" && (
            <>
              <label>Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full py-2 my-2 border-b border-black"
              >
                <option value="" disabled>
                  Select Company
                </option>
                {companyList.map((c, idx) => (
                  <option key={idx} value={c._id}>
                    {c.companyName}
                  </option>
                ))}
              </select>

              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full py-2 my-2 border-b border-black"
              >
                <option value="" disabled>
                  Select Role
                </option>
                {roleList.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </>
          )}

          {internshipType === "research" && location === "inside_bit" && (
            <>
              <label>Mentor Name</label>
              <select
                value={mentor}
                onChange={(e) => setMentor(e.target.value)}
                className="w-full py-2 my-2 border-b border-black"
              >
                <option value="" disabled>
                  Select Mentor
                </option>
                {professors?.map((prof, idx) => (
                  <option className="text-black" key={idx} value={prof._id}>
                    {prof?.fullName}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full py-2 my-2 border-b border-black"
          />

          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full py-2 my-2 border-b border-black"
          />

          {location === "outside_bit" && (
            <>
              <label>Upload Supporting Document</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setIdCard(e.target.files[0])}
                className="w-full py-2 my-2 border-b border-black"
              />
            </>
          )}

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {spin ? <ClipLoader color="white" size={20} /> : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
