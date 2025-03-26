import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const AdminBugTrackerDetails = () => {
  const { bugId } = useParams();
  const navigate = useNavigate();
  const [bug, setBug] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    axios.get(`/api/v1/tracker/bugs/${bugId}`)
      .then(res => {
        setBug(res.data);
        setNewStatus(res.data.status);
      })
      .catch(err => {
          toast.error("Failed to load bug details");
          console.error(err);
      });
  }, [bugId]);

  const updateStatus = () => {
    Swal.fire({
      title: "Confirm Update",
      text: "Are you sure you want to update the status?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        setIsUpdating(true);
        axios.put(`/api/v1/tracker/bugs/${bugId}`, { status: newStatus })
          .then(res => {
            setBug(res.data);
            toast.success("Status updated successfully");
            Swal.fire("Updated!", "The bug status has been updated.", "success");
          })
          .catch(err => {
            toast.error("Failed to update status");
            Swal.fire("Error!", "Could not update status.", "error");
            console.error(err);
          })
          .finally(() => setIsUpdating(false));
      }
    });
  };

  if (!bug) return <div className="container mx-auto p-4"><ToastContainer /><p>Loading...</p></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <button 
        onClick={() => navigate("/admin-db/bug-tracker")} 
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
      >
        Back
      </button>
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Bug Details</h1>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Reporter</h2>
          <p className="text-gray-700">{bug.reporter.id?.fullName || bug.reporter.kind}</p>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Title</h2>
          <p className="text-gray-700">{bug.title}</p>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-gray-700">{bug.reportDescription}</p>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Status</h2>
          <p className="text-gray-700">{bug.status}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Attached Files</h2>
          {bug.links && bug.links.length > 0 ? (
            <ul className="list-disc list-inside text-blue-500">
              {bug.links.map((link, index) => (
                <li key={index}>
                  <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">{link}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No attachments</p>
          )}
        </div>
        
        <div className="flex items-center">
          <label htmlFor="statusSelect" className="mr-4 font-medium">Update Status:</label>
          <select 
            id="statusSelect" 
            value={newStatus} 
            onChange={(e) => setNewStatus(e.target.value)}
            className="border rounded p-2 mr-4"
            disabled={isUpdating}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <button 
            onClick={updateStatus}
            disabled={isUpdating}
            className={`px-4 py-2 rounded transition ${isUpdating ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminBugTrackerDetails;
