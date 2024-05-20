import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { GridLoader } from "react-spinners";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HigherEducation = () => {
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [doc, setDoc] = useState("");
  const [spin, setSpin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSpin(true);
    try {
      const formData = new FormData();
      formData.append("institution", institution);
      formData.append("degree", degree);
      formData.append("fieldOfStudy", fieldOfStudy);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("doc", doc);
      const response = await axios.post("/api/v1/higher-education", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      console.log(response.data);
      toast.success("Data uploaded successfully!");
      setTimeout(() => {
        navigate("/db");
      }, 2000);
    } catch (err) {
      console.log(err);
    } finally {
      setSpin(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 sm:px-0">
      <ToastContainer />
      <span className="font-bold underline underline-offset-8 my-10 text-2xl sm:text-3xl">
        Higher Education Record Data
      </span>
      <div className="w-full max-w-md h-auto flex flex-col justify-between items-center bg-lime-100 rounded-lg border-2 border-black">
        <form className="w-full py-5 px-4 sm:px-10 space-y-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Institution"
            className="inputClass w-full"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
          <input
            type="text"
            placeholder="Degree"
            className="inputClass w-full"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          />
          <input
            type="text"
            placeholder="Field of Study"
            className="inputClass w-full"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
          />
          <span className="font-bold underline text-md">Start Date:</span>
          <input
            type="date"
            placeholder="Date"
            className="inputClass w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="font-bold underline text-md">End Date:</span>
          <input
            type="date"
            placeholder="Date"
            className="inputClass w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <span className="font-bold underline-offset-4 underline">
            Supporting Docs:
          </span>
          <input
            type="file"
            className="fileButton w-full"
            accept="image/*"
            onChange={(e) => setDoc(e.target.files[0])}
          />

          {spin ? (
            <div className="w-full flex items-center justify-center">
              <GridLoader color="#000" />
            </div>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              className="h-10 w-44 rounded-lg border border-black bg-white font-semibold"
            >
              Upload
            </button>
          )}

          <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
            <Link to="/db">Go back to Dashboard</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default HigherEducation;
