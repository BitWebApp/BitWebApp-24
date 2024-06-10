import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { GridLoader, ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { ClipLoader, GridLoader } from "react-spinners";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';

const PlacementOne = () => {
  const [company, setCompany] = useState("");
  const [ctc, setCTC] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState("");
  const [spin, setSpin] = useState(false);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [finalSubmitLoading, setFinalSubmitLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSpin(true);
    try {
      const formData = new FormData();
      formData.append("company", company);
      formData.append("ctc", ctc);
      formData.append("date", date);
      formData.append("doc", file);
      const response = await axios.patch("/api/v1/users/pone", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      console.log(response.data);
      toast.success("Data uploaded successfully");
      setTimeout(() => {
        navigate("/db");
      }, 2000);
    } catch (err) {
      console.log(err);
    } finally {
      setSpin(false);
    }
  };

  const handleFinalSubmit = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to modify your data after this submission!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, submit it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setFinalSubmitLoading(true);
        // Simulate an API call for final submission
        setTimeout(() => {
          Swal.fire(
            'Submitted!',
            'Your exam records have been submitted.',
            'success'
          );
          setIsFinalSubmitted(true);
          localStorage.setItem('isFinalSubmitted', JSON.stringify(true));
          setFinalSubmitLoading(false);
        }, 2000); // Simulated delay
      }
    });
  };

  return (
    <div className="flex flex-col items-center px-4 sm:px-0">
      <ToastContainer />
      <span className="font-bold underline underline-offset-8 my-10 text-2xl sm:text-3xl">
        Placement Record Data - 1
      </span>
      <div className="w-full max-w-md h-auto flex flex-col justify-between items-center bg-lime-100 rounded-lg border-2 border-black">
        <form className="w-full py-5 px-4 sm:px-10 space-y-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Company Name"
            className="inputClass w-full"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <input
            type="text"
            placeholder="CTC"
            className="inputClass w-full"
            value={ctc}
            onChange={(e) => setCTC(e.target.value)}
          />
          <span className="font-bold underline text-md">Date of joining:</span>
          <input
            type="date"
            placeholder="Date"
            className="inputClass w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <span className="font-bold underline-offset-4 underline">
            Supporting Docs:
          </span>
          <input
            type="file"
            className="fileButton w-full"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
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
              {spin ? <ClipLoader /> : "Upload"}
            </button>
          )}
          <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
            <Link to="/db">Go back to Dashboard</Link>
          </span>
        </form>
      </div>
      <button
        onClick={handleFinalSubmit}
        className={finalSubmitLoading ? "bg-black text-white w-full rounded-md p-4 text-center flex items-center opacity-70 justify-center my-2 hover:bg-black/90" : "bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"}
        disabled={isFinalSubmitted}
      >
        {finalSubmitLoading ? <ClipLoader color="gray" /> : 'Final Submit'}
      </button>
    </div>
  );
};

export default PlacementOne;
