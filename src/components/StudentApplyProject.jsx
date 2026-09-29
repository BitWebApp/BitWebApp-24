import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentApplyProject = ({ project }) => {
  const [application, setApplication] = useState({
    studentId: JSON.parse(localStorage.getItem("user"))?._id || "",
    projectId: project._id || "",
    doc: [],
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("notapplied"); // Track application status

  // Function to fetch application status
  const fetchStatus = async () => {
    try {
        const response = await axios.get("/api/v1/profProject/student/applications", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            params: { projId: project._id }
          });
          
      if (response.data.success) {
        const appStatus = response.data.data;
        setStatus(appStatus);
      }
    } catch (error) {
      console.error("Failed to fetch application status:", error.message);
    }
  };

  // Fetch status when component mounts or project changes
  useEffect(() => {
    fetchStatus();
  }, [project._id]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);

    setApplication((prevState) => ({
      ...prevState,
      doc: [
        ...prevState.doc,
        ...selectedFiles.filter(
          (file) =>
            !prevState.doc.some(
              (existingFile) =>
                existingFile.name === file.name && existingFile.size === file.size
            )
        ),
      ],
    }));
  };

  const handleFileRemove = (fileIndex) => {
    setApplication((prevState) => ({
      ...prevState,
      doc: prevState.doc.filter((_, index) => index !== fileIndex),
    }));
  };

  const submitApplication = async () => {
    try {
      setLoading(true);
      const formPayload = new FormData();
      formPayload.append("projectId", application.projectId);
      formPayload.append("studentId", application.studentId);
      application.doc.forEach((file) => formPayload.append("files", file));

      const response = await axios.post("/api/v1/profProject/apply", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (response.data.success) {
        toast.success("Successfully applied to the project!");
        setApplication((prevState) => ({ ...prevState, doc: [] })); // Clear files after successful submission
        fetchStatus(); // Fetch updated status from the backend
      }
    } catch (error) {
      console.error("Application submission failed:", error.message);
      toast.error("Failed to submit the application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Apply to {project.title}</h2>

      {/* Show application status if not "notapplied" */}
      {status && status !== "notapplied" ? (
        <>
          <p className={`${status.toLowerCase() === "accepted" ? "text-green-500" : status.toLowerCase() === "rejected" ? "text-red-500" : "text-orange-500"} font-semibold`}>
            You have successfully applied to this project.
          </p>
          <p>
            Status:{" "}
            <span className={`${status.toLowerCase() === "accepted" ? "text-green-500" : status.toLowerCase() === "rejected" ? "text-red-500" : "text-orange-500"} font-semibold`}>
              {status.toUpperCase()}
            </span>
          </p>
        </>
      ) : (
        // Only show form if status is "notapplied"
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (status === "notapplied") {
              submitApplication();
            }
          }}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="p-2 border rounded w-full"
            multiple
          />

          {application.doc.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold">Uploaded Files:</h4>
              <ul className="list-disc pl-6 mt-2">
                {application.doc.map((file, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleFileRemove(index)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || status !== "notapplied"}
            className={`py-2 px-4 rounded ${
              loading || status !== "notapplied"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {loading ? "Applying..." : "Apply"}
          </button>
        </form>
      )}
    </div>
  );
};

export default StudentApplyProject;
