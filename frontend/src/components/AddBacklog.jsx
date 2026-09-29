import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function BacklogForm() {
  const [backlog, setBacklog] = useState("");
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/v1/backlogs/get-subj');
        setSubjects(response.data.data);
        // console.log("hello", response)
      } catch (error) {
        // console.log(error)
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submit button clicked");

    const htmlContent = `
      <div style="text-align: left; padding: 20px;">
        <p style="font-size: 20px; margin: 10px 0; color: #333;">
          <strong>Backlog Subject:</strong> ${backlog}
        </p>
        <br/>
      </div>
      <p style="font-size: 17px; color: #666;">
          Do you want to add this backlog?
      </p>
    `;

    Swal.fire({
      title: 'Are you sure?',
      html: htmlContent,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, add it!',
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
          const response = await axios.post('/api/v1/backlogs/add-backlog', {
            backlogid: backlog,
          });

          if (response.data.success) {
            toast.success("Backlog added successfully!");
            setBacklog("");
            Swal.fire(
              'Added!',
              'Your backlog has been added.',
              'success'
            );
            navigate('/db/backlogs-table');
          } else {
            toast.error(response.data.message || 'Failed to add backlog. Please try again.');
          }
        } catch (error) {
          if (error.response && error.response.data) {
            toast.error(error.response.data.message);
          } else {
            toast.error('Failed to add backlog. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full flex flex-col p-10 justify-between">
        <h3 className="text-xl text-black font-semibold">BIT WEB APP</h3>
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Backlog Form</h3>
            <p className="text-base mb-2">Select your backlog subject.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Backlog Subject</label>
              <select
                value={backlog}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setBacklog(e.target.value)}
                required
              >
                <option value="" disabled>Select Backlog Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.subjectCode}: {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-8"></div>
            <div className="w-full flex flex-col my-4">
              <button
                className={loading ? "bg-black text-white w-full rounded-md p-4 text-center flex items-center opacity-70 justify-center my-2 hover:bg-black/90" : "bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"}
                type="submit"
              >
                {loading ? <ClipLoader size={24} color="#ffffff" /> : "Add"}
              </button>
            </div>
          </form>
          <div className="w-full items-center justify-center flex">
            <p className="text-sm font-normal text-black">
              <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
                <Link to="/db/backlogs-table">See Backlogs</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
