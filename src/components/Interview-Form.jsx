import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTrash, FaLink, FaBriefcase, FaBuilding, FaMoneyBillWave, FaGraduationCap } from "react-icons/fa";

export default function InterviewForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    ctc: "",
    stipend: "",
    cgpaCriteria: "",
    experiences: [""],
    referenceLinks: [""]
  });
  const [spin, setSpin] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/v1/users/get-user-companies");
        setCompanies(response.data.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch company list!");
      }
    };

    fetchCompanies();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName) newErrors.companyName = "Company name is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (formData.experiences.some(exp => !exp.trim())) {
      newErrors.experiences = "All experience fields must be filled";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleAddExperience = () => {
    setFormData(prev => ({ ...prev, experiences: [...prev.experiences, ""] }));
  };

  const handleRemoveExperience = (index) => {
    if (formData.experiences.length > 1) {
      const newExperiences = [...formData.experiences];
      newExperiences.splice(index, 1);
      setFormData(prev => ({ ...prev, experiences: newExperiences }));
    }
  };

  const handleAddReferenceLink = () => {
    setFormData(prev => ({ ...prev, referenceLinks: [...prev.referenceLinks, ""] }));
  };

  const handleRemoveReferenceLink = (index) => {
    const newLinks = [...formData.referenceLinks];
    newLinks.splice(index, 1);
    setFormData(prev => ({ ...prev, referenceLinks: newLinks }));
  };

  const handleExperienceChange = (index, value) => {
    const newExperiences = [...formData.experiences];
    newExperiences[index] = value;
    setFormData(prev => ({ ...prev, experiences: newExperiences }));
    if (errors.experiences) setErrors(prev => ({ ...prev, experiences: null }));
  };

  const handleReferenceLinkChange = (index, value) => {
    const newReferenceLinks = [...formData.referenceLinks];
    newReferenceLinks[index] = value;
    setFormData(prev => ({ ...prev, referenceLinks: newReferenceLinks }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedCompany = companies.find(
      company => company.companyName === formData.companyName
    );

    if (!selectedCompany) {
      toast.error("Please select a valid company!");
      return;
    }

    const experiencesHtml = formData.experiences
      .map((exp, index) => `
        <div class="experience-item">
          <h4 class="experience-title">Round ${index + 1}</h4>
          <p class="experience-content">${exp || "Not provided"}</p>
        </div>
      `)
      .join('');

    const referenceLinksHtml = formData.referenceLinks
      .map((link, index) => `
        <div class="reference-item">
          <a href="${link}" target="_blank" class="reference-link">
            <FaLink class="link-icon" /> Reference ${index + 1}
          </a>
        </div>
      `)
      .join('');

    const htmlContent = `
      <div class="review-container">
        <div class="review-section">
          <h3 class="review-heading"><FaBuilding /> Company Details</h3>
          <div class="review-row">
            <span class="review-label">Company:</span>
            <span class="review-value">${formData.companyName}</span>
          </div>
          <div class="review-row">
            <span class="review-label">Role:</span>
            <span class="review-value">${formData.role}</span>
          </div>
        </div>

        <div class="review-section">
          <h3 class="review-heading"><FaMoneyBillWave /> Compensation</h3>
          <div class="review-row">
            <span class="review-label">CTC:</span>
            <span class="review-value">${formData.ctc || 'Not specified'}</span>
          </div>
          <div class="review-row">
            <span class="review-label">Stipend:</span>
            <span class="review-value">${formData.stipend || 'Not specified'}</span>
          </div>
          <div class="review-row">
            <span class="review-label">CGPA Criteria:</span>
            <span class="review-value">${formData.cgpaCriteria || 'Not specified'}</span>
          </div>
        </div>

        <div class="review-section">
          <h3 class="review-heading"><FaBriefcase /> Interview Experience</h3>
          ${experiencesHtml}
        </div>

        ${formData.referenceLinks.some(link => link) ? `
        <div class="review-section">
          <h3 class="review-heading"><FaLink /> Reference Materials</h3>
          ${referenceLinksHtml}
        </div>
        ` : ''}
      </div>

      <style>
        .review-container {
          max-height: 60vh;
          overflow-y: auto;
          padding: 10px;
          color: #333;
        }
        .review-section {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .review-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          margin-bottom: 15px;
          color: #2c3e50;
        }
        .review-row {
          display: flex;
          margin-bottom: 8px;
        }
        .review-label {
          font-weight: 600;
          width: 120px;
          color: #555;
        }
        .review-value {
          flex: 1;
        }
        .experience-item {
          margin-bottom: 15px;
        }
        .experience-title {
          font-weight: 600;
          margin-bottom: 5px;
          color: #444;
        }
        .experience-content {
          white-space: pre-line;
          line-height: 1.5;
        }
        .reference-item {
          margin-bottom: 8px;
        }
        .reference-link {
          color: #3498db;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .reference-link:hover {
          text-decoration: underline;
        }
        .link-icon {
          font-size: 14px;
        }
      </style>
    `;

    Swal.fire({
      title: "Review Your Submission",
      html: htmlContent,
      icon: "info",
      width: '800px',
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Submit Experience",
      cancelButtonText: "Make Changes",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        setSpin(true);
        try {
          const payload = {
            companyId: selectedCompany._id,
            role: formData.role,
            interviewYear: new Date().getFullYear().toString(),
            cgpa: formData.cgpaCriteria,
            ctc: formData.ctc,
            stipend: formData.stipend,
            experience: formData.experiences,
            referenceMaterialLinks: formData.referenceLinks.filter(link => link)
          };

          const response = await axios.post(
            "/api/v1/users/add-interview-exp",
            payload
          );

          if (response.data.success) {
            toast.success("Interview experience shared successfully!");
            // Reset form
            setFormData({
              companyName: "",
              role: "",
              ctc: "",
              stipend: "",
              cgpaCriteria: "",
              experiences: [""],
              referenceLinks: [""]
            });
          } else {
            throw new Error(response.data.message || "Submission failed");
          }
        } catch (err) {
          console.error("Error submitting form:", err);
          toast.error(err.response?.data?.message || "Error uploading data!");
          return false; // Keep the modal open on error
        } finally {
          setSpin(false);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaBriefcase /> Share Interview Experience
          </h1>
          <p className="mt-2">Help your peers by sharing your interview journey</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.companyName ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map((company, index) => (
                    <option key={index} value={company.companyName}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Software Developer, Data Analyst"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.role ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              {/* CTC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTC (if applicable)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 15 LPA, $100,000"
                  value={formData.ctc}
                  onChange={(e) => handleInputChange("ctc", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Stipend */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stipend (if internship)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 50k/month, $5,000"
                  value={formData.stipend}
                  onChange={(e) => handleInputChange("stipend", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* CGPA Criteria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CGPA Criteria
                </label>
                <input
                  type="text"
                  placeholder="e.g., 7.0+, No backlogs"
                  value={formData.cgpaCriteria}
                  onChange={(e) => handleInputChange("cgpaCriteria", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Interview Experiences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaBriefcase /> Interview Rounds <span className="text-red-500">*</span>
              </h3>
              {formData.experiences.map((experience, index) => (
                <div key={index} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Round {index + 1} Details
                  </label>
                  <textarea
                    placeholder={`Describe Round ${index + 1} (Technical, HR, etc.)`}
                    value={experience}
                    onChange={(e) => handleExperienceChange(index, e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] ${
                      errors.experiences ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formData.experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(index)}
                      className="absolute top-0 right-0 mt-6 mr-2 text-red-500 hover:text-red-700"
                      title="Remove this round"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              {errors.experiences && (
                <p className="text-sm text-red-600">{errors.experiences}</p>
              )}
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FaPlus /> Add Another Round
              </button>
            </div>

            {/* Reference Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaLink /> Reference Materials
              </h3>
              {formData.referenceLinks.map((link, index) => (
                <div key={index} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Link {index + 1}
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/interview-prep"
                    value={link}
                    onChange={(e) => handleReferenceLinkChange(index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReferenceLink(index)}
                      className="absolute top-0 right-0 mt-6 mr-2 text-red-500 hover:text-red-700"
                      title="Remove this link"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddReferenceLink}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FaPlus /> Add Another Reference Link
              </button>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={spin}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200"
              >
                {spin ? (
                  <>
                    <ClipLoader color="white" size={20} /> Submitting...
                  </>
                ) : (
                  "Submit Interview Experience"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}