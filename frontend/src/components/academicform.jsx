import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function Academicform() {
  const [semester, setSemester] = useState("");
  const [gpa, setGpa] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");

    const htmlContent = `
      <div style="text-align: left; padding: 20px;">
        <p style="font-size: 20px; margin: 10px 0; color: #333;">
          <strong>Semester:</strong> ${semester}
        </p>
        <p style="font-size: 20px; margin: 10px 0; color: #333;">
          <strong>GPA:</strong> ${gpa}
        </p>
        <br/>
      </div>
      <p style="font-size: 17px; color: #666;">
          Do you want to submit the form?
      </p>
    `;

    Swal.fire({
      title: 'Are you sure?',
      html: htmlContent,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel!',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          setLoading(true);
          const response = await axios.post('/api/v1/academics/create', {
            semester: semester,
            gpa: gpa,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });

          if (response.data.success) {
            toast.success("Academic record added successfully!");
            setSemester("");
            setGpa("");
            Swal.fire(
              'Submitted!',
              'Your form has been submitted.',
              'success'
            );
            navigate('/db/academic-table');
          } else {
            toast.error(response.data.message || 'Failed to create academic record. Please try again.');
          }
        } catch (error) {
          if (error.response && error.response.data) {
            toast.error(error.response.data.message);
          } else {
            toast.error('Failed to create academic record. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      }
    });
  };
  const sortAwards = (awards, configs) => {
    return awards.sort((a, b) => {
      for (const config of configs) {
        const { field, direction } = config;
        let comparison = 0;
        if (typeof a[field] === 'string' && typeof b[field] === 'string') {
          comparison = a[field].localeCompare(b[field]);
        } else {
          comparison = a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0;
        }
        if (direction === 'descending') comparison *= -1;
        if (comparison !== 0) return comparison;
      }
      return 0;
    });
  };

  const sorteproject = sorteproject([...projects], sortConfigs);
  const filteredAwards = sortedAwards.filter((award) =>
    Object.values(award).some((value) =>
      typeof value === 'string' ? value.toLowerCase().includes(searchQuery.toLowerCase()) : false
    )
  );
  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full flex flex-col p-10 justify-between">
        <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Academic Form</h3>
            <p className="text-base mb-2">Enter Your details.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Semester</label>
              <select
                value={semester}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setSemester(e.target.value)}
                required
              >
                <option value="" disabled>Select Your Semester</option>
                <option value="1">First Semester</option>
                <option value="2">Second Semester</option>
                <option value="3">Third Semester</option>
                <option value="4">Fourth Semester</option>
                <option value="5">Fifth Semester</option>
                <option value="6">Sixth Semester</option>
                <option value="7">Seventh Semester</option>
                <option value="8">Eighth Semester</option>
                <option value="9">Ninth Semester</option>
                <option value="10">Tenth Semester</option>
              </select>
              <label>GPA</label>
              <input
                type="text"
                placeholder="Enter Your GPA"
                value={gpa}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setGpa(e.target.value)}
                required
              />
            </div>
            <div className="h-8"></div>
            <div className="w-full flex items-center justify-between"></div>
            <div className="w-full flex flex-col my-4">
              <button
                className={loading ? "bg-black text-white w-full rounded-md p-4 text-center flex items-center opacity-70 justify-center my-2 hover:bg-black/90" : "bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"}
                type="submit"
              >
                {loading ? <ClipLoader size={24} color="#ffffff" /> : "Submit"}
              </button>
            </div>
          </form>
          <div className="w-full items-center justify-center flex">
            <p className="text-sm font-normal text-black">
              <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
                <Link to="/db/academic-table">See Records</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
