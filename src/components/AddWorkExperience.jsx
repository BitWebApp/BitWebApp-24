import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AddWorkExperience() {
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrentlyWorking: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Reset end date if currently working is checked
    if (name === 'isCurrentlyWorking' && checked) {
      setFormData(prev => ({
        ...prev,
        endDate: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.company || !formData.role || !formData.startDate || 
        (!formData.isCurrentlyWorking && !formData.endDate)) {
      setError("Please fill all required fields");
      return;
    }
    
    try {
      setLoading(true);
      await axios.post("/api/v1/alumni/work-experience", formData, {
        withCredentials: true
      });
      
      Swal.fire("Success!", "Work experience added successfully", "success");
      navigate("/db/alumni");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add work experience");
      Swal.fire("Error!", error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Add Work Experience</h2>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-md">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Company *</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role *</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Start Date *</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            disabled={formData.isCurrentlyWorking}
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isCurrentlyWorking"
              checked={formData.isCurrentlyWorking}
              onChange={handleChange}
              className="mr-2"
            />
            I am currently working here
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Adding...' : 'Add Work Experience'}
        </button>
      </form>
    </div>
  );
}