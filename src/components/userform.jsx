import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit, FaSave, FaTimes, FaPlus, FaLinkedin, FaGithub, FaCode, FaFilePdf, FaUserCircle } from 'react-icons/fa';

const SECTIONS = ["A", "B", "C", "D"];
export default function UserForm() {
  // State declarations remain the same
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState(SECTIONS[0]); // Since browser auto-selects first option, user sees "A" already selected hence he never touch it and setSection never gets called leading to frontend showing section A while backend having "". So we should set default value to "A" since browser also defaults to that.
  const [mobileNumber, setMobileNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [abcId, setabcId] = useState("");
  const [linkedin, setlinkedin] = useState("");
  const [codingProfiles, setCodingProfiles] = useState({
    github: "",
    leetcode: "",
    codeforces: "",
    codechef: "",
    atcoder: ""
  });
  const [resume, setResume] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [availableSections, setAvailableSections] = useState(SECTIONS);
  const [graduationYear, setGraduationYear] = useState("");
  const [workExperiences, setWorkExperiences] = useState([]);
  const [alternateEmail, setAlternateEmail] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherMobileNumber, setFatherMobileNumber] = useState("");
  const [motherName, setMotherName] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/v1/users/get-user", { withCredentials: true })
      .then(response => {
        const userData = response.data?.data;
        if (!userData) return;
        setFullName(userData.fullName || "");
        setEmail(userData.email || "");
        setBranch(userData.branch || "");
        setSection(userData.section || SECTIONS[0]);
        setMobileNumber(userData.mobileNumber || "");
        setSemester(userData.semester || "");
        setCgpa(userData.cgpa || "");
        setabcId(userData.abcId || "");
        setlinkedin(userData.linkedin || "");
        setCodingProfiles({
          github: userData.codingProfiles?.github || "",
          leetcode: userData.codingProfiles?.leetcode || "",
          codeforces: userData.codingProfiles?.codeforces || "",
          codechef: userData.codingProfiles?.codechef || "",
          atcoder: userData.codingProfiles?.atcoder || "",
        });
        setUser(userData);
        setAvailableSectionsBasedOnBranch(userData.branch);
        if (userData.semester === "Graduated") {
          setGraduationYear(userData.graduationYear ? (new Date(userData.graduationYear).getFullYear() ? new Date(userData.graduationYear).getFullYear().toString() : userData.graduationYear) : "");
          setWorkExperiences(userData.workExp || userData.workExperiences || []);
        }
        setAlternateEmail(userData.alternateEmail || "");
        setFatherName(userData.fatherName || "");
        setFatherMobileNumber(userData.fatherMobileNumber || "");
        setMotherName(userData.motherName || "");
        setResidentialAddress(userData.residentialAddress || "");
        setResume(userData.resume || null);
        setProfilePreview(userData.image || "");
      })
      .catch(error => {
        console.error("Failed to load user data:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to load user data'
        });
      });
  }, []);

  const setAvailableSectionsBasedOnBranch = (branchVal) => {
    if (branchVal === "artificial intelligence and machine learning") {
      setAvailableSections([SECTIONS[0]]);
    } else {
      setAvailableSections(SECTIONS);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("fullName", fullName || "");
      formData.append("email", email || "");
      formData.append("branch", branch || "");
      formData.append("section", section || "");
      formData.append("mobileNumber", mobileNumber || "");
      formData.append("semester", semester || "");
      formData.append("cgpa", cgpa || "");
      formData.append("abcId", abcId || "");
      formData.append("linkedin", linkedin || "");
      formData.append("github", codingProfiles.github || "");
      formData.append("leetcode", codingProfiles.leetcode || "");
      formData.append("codeforces", codingProfiles.codeforces || "");
      formData.append("atcoder", codingProfiles.atcoder || "");
      formData.append("codechef", codingProfiles.codechef || "");

      if (resume instanceof File) {
        formData.append("resume", resume);
      }
      if (profilePicture instanceof File) {
        formData.append("image", profilePicture);
      }
      if (semester === "Graduated") {
        formData.append("graduationYear", graduationYear || "");
        formData.append("workExp", JSON.stringify(workExperiences || []));
        formData.append("workExperiences", JSON.stringify(workExperiences || []));
      }
      formData.append("alternateEmail", alternateEmail || "");
      formData.append("fatherName", fatherName || "");
      formData.append("fatherMobileNumber", fatherMobileNumber || "");
      formData.append("motherName", motherName || "");
      formData.append("residentialAddress", residentialAddress || "");

      // Do NOT set manual Content-Type header so Axios generates multipart/form-data with boundary!
      const response = await axios.patch(`/api/v1/users/update`, formData, {
        withCredentials: true,
      });

      const updatedUser = response.data?.data;
      if (updatedUser) {
        setUser(updatedUser);
        setFullName(updatedUser.fullName || "");
        setEmail(updatedUser.email || "");
        setBranch(updatedUser.branch || "");
        setSection(updatedUser.section || SECTIONS[0]);
        setMobileNumber(updatedUser.mobileNumber || "");
        setSemester(updatedUser.semester || "");
        setCgpa(updatedUser.cgpa || "");
        setabcId(updatedUser.abcId || "");
        setlinkedin(updatedUser.linkedin || "");
        setCodingProfiles({
          github: updatedUser.codingProfiles?.github || "",
          leetcode: updatedUser.codingProfiles?.leetcode || "",
          codeforces: updatedUser.codingProfiles?.codeforces || "",
          codechef: updatedUser.codingProfiles?.codechef || "",
          atcoder: updatedUser.codingProfiles?.atcoder || "",
        });
        if (updatedUser.image) {
          setProfilePreview(updatedUser.image);
        }
        if (updatedUser.resume) {
          setResume(updatedUser.resume);
        }
        setProfilePicture(null);
        setAlternateEmail(updatedUser.alternateEmail || "");
        setFatherName(updatedUser.fatherName || "");
        setFatherMobileNumber(updatedUser.fatherMobileNumber || "");
        setMotherName(updatedUser.motherName || "");
        setResidentialAddress(updatedUser.residentialAddress || "");
        if (updatedUser.semester === "Graduated") {
          setGraduationYear(updatedUser.graduationYear ? (new Date(updatedUser.graduationYear).getFullYear() ? new Date(updatedUser.graduationYear).getFullYear().toString() : updatedUser.graduationYear) : "");
          setWorkExperiences(updatedUser.workExp || updatedUser.workExperiences || []);
        }

        // Keep localStorage user in sync if present
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem("user", JSON.stringify({ ...parsed, ...updatedUser }));
          }
        } catch (e) {
          // ignore localStorage errors
        }
      }

      setIsEditMode(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: response.data?.message || 'Profile updated successfully'
      });
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to update profile'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setBranch(user.branch || "");
      setSection(user.section || SECTIONS[0]);
      setMobileNumber(user.mobileNumber || "");
      setSemester(user.semester || "");
      setCgpa(user.cgpa || "");
      setabcId(user.abcId || "");
      setlinkedin(user.linkedin || "");
      setCodingProfiles({
        github: user.codingProfiles?.github || "",
        leetcode: user.codingProfiles?.leetcode || "",
        codeforces: user.codingProfiles?.codeforces || "",
        codechef: user.codingProfiles?.codechef || "",
        atcoder: user.codingProfiles?.atcoder || ""
      });
      setResume(user.resume || null);
      setProfilePicture(null);
      setProfilePreview(user.image || "");
      setGraduationYear(user.graduationYear ? (new Date(user.graduationYear).getFullYear() ? new Date(user.graduationYear).getFullYear().toString() : user.graduationYear) : "");
      setWorkExperiences(user.workExp || user.workExperiences || []);
      setAlternateEmail(user.alternateEmail || "");
      setFatherName(user.fatherName || "");
      setFatherMobileNumber(user.fatherMobileNumber || "");
      setMotherName(user.motherName || "");
      setResidentialAddress(user.residentialAddress || "");
      setAvailableSectionsBasedOnBranch(user.branch);
    }
    setIsEditMode(false);
  };

  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, { companyName: "", startYear: "", endYear: "", role: "", description: "" }]);
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...workExperiences];
    updatedExperiences[index][field] = value;
    setWorkExperiences(updatedExperiences);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">BITACADEMIA</h1>
            <div className="flex items-center space-x-4">
              {isEditMode ? (
                <>
                  <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FaSave className="mr-2" /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaEdit className="mr-2" /> Edit Profile
                </button>
              )}
            </div>
          </div>
          <p className="mt-2">Manage your profile information</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Profile Picture and Basic Info */}
            <div className="w-full md:w-1/3 space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {profilePreview ? (
                    <img 
                      src={profilePreview} 
                      alt="Profile" 
                      className="w-40 h-40 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-100">
                      <FaUserCircle className="text-gray-400 text-6xl" />
                    </div>
                  )}
                  {isEditMode && (
                    <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md">
                      <label className="cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleProfilePictureChange}
                        />
                        <FaEdit className="text-blue-600" />
                      </label>
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-center">{fullName || "Your Name"}</h2>
                <p className="text-gray-600 text-center">{branch ? `${branch} (${section})` : "Branch"}</p>
                <p className="text-gray-600 text-center">{semester || "Semester"}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{mobileNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ABC ID</p>
                    <p className="font-medium">{abcId || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">Academic Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">CGPA</p>
                    <p className="font-medium">{cgpa || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="w-full md:w-2/3 space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <select
                      value={branch}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        setBranch(e.target.value);
                        setAvailableSectionsBasedOnBranch(e.target.value);
                      }}
                      disabled={!isEditMode}
                    >
                      <option value="">Select Branch</option>
                      <option value="computer science and engineering">Computer Science</option>
                      <option value="artificial intelligence and machine learning">AI and ML</option>
                      {branch && 
                       branch !== "computer science and engineering" && 
                       branch !== "artificial intelligence and machine learning" && (
                        <option value={branch}>{branch}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select
                      value={section}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setSection(e.target.value)}
                      disabled={!isEditMode || !branch}
                    >
                      {availableSections.map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setMobileNumber(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      value={semester}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setSemester(e.target.value)}
                      disabled={!isEditMode}
                    >
                      <option value="">Select Semester</option>
                      {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"].map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                    <input
                      type="number"
                      value={cgpa}
                      step="0.01"
                      min="0"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setCgpa(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ABC ID</label>
                    <input
                      value={abcId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setabcId(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                    <input
                      value={fatherName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setFatherName(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Email</label>
                    <input
                      value={alternateEmail}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setAlternateEmail(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Mobile</label>
                    <input
                      value={fatherMobileNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setFatherMobileNumber(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                    <input
                      value={motherName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setMotherName(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                    <input
                      value={residentialAddress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setResidentialAddress(e.target.value)}
                      disabled={!isEditMode}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Professional Profiles</h3>
                <p className="text-sm font-semibold text-red-500 mb-4">LinkedIn, Github and atleast one coding profile is required.</p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaLinkedin className="text-blue-700 mr-3 text-xl" />
                    <input
                      type="url"
                      value={linkedin}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setlinkedin(e.target.value)}
                      disabled={!isEditMode}
                      placeholder="LinkedIn Profile URL"
                    />
                  </div>
                  <div className="flex items-center">
                    <FaGithub className="text-gray-800 mr-3 text-xl" />
                    <input
                      type="url"
                      value={codingProfiles.github}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setCodingProfiles({ ...codingProfiles, github: e.target.value })}
                      disabled={!isEditMode}
                      placeholder="GitHub Profile URL"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="text-yellow-600 mr-3 text-sm">LC</p>
                    <input
                      type="url"
                      value={codingProfiles.leetcode}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setCodingProfiles({ ...codingProfiles, leetcode: e.target.value })}
                      disabled={!isEditMode}
                      placeholder="LeetCode Profile URL"
                    />
                  </div>
                  <div className="flex items-center">
                    <img src='https://codeforces.org/s/75877/favicon.ico' className="text-red-500 mr-3 text-xl" />
                    <input
                      type="url"
                      value={codingProfiles.codeforces}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setCodingProfiles({ ...codingProfiles, codeforces: e.target.value })}
                      disabled={!isEditMode}
                      placeholder="Codeforces Profile URL"
                    />
                  </div>
                  <div className="flex items-center">
                    <p className="text-brown-500 mr-3 text-sm">CC</p>
                    <input
                      type="url"
                      value={codingProfiles.codechef}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setCodingProfiles({ ...codingProfiles, codechef: e.target.value })}
                      disabled={!isEditMode}
                      placeholder="CodeChef Profile URL"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Documents</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume (.pdf,.doc,.docx)
                      {resume && typeof resume === 'string' && (
                        <a 
                          href={resume} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline inline-flex items-center"
                        >
                          <FaFilePdf className="mr-1" /> View Current Resume
                        </a>
                      )}
                      {resume && typeof resume !== 'string' && (
                        <span className="ml-2 text-sm text-green-600 font-medium">
                          Selected: {resume.name}
                        </span>
                      )}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        onChange={(e) => setResume(e.target.files[0])}
                        disabled={!isEditMode}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional sections (Family, Alumni, etc.) would follow the same pattern */}
              
              {semester === "Graduated" && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Alumni Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={graduationYear}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setGraduationYear(e.target.value)}
                        disabled={!isEditMode}
                      />
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Work Experience</h4>
                  {workExperiences.map((exp, index) => (
                    <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                          <input
                            type="text"
                            value={exp.companyName || exp.company || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            onChange={(e) => handleExperienceChange(index, 'companyName', e.target.value)}
                            disabled={!isEditMode}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <input
                            type="text"
                            value={exp.role || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                            disabled={!isEditMode}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                          <input
                            type="text"
                            value={exp.startYear || (exp.startDate ? new Date(exp.startDate).getFullYear().toString() : "")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            onChange={(e) => handleExperienceChange(index, 'startYear', e.target.value)}
                            disabled={!isEditMode}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                          <input
                            type="text"
                            value={exp.endYear || (exp.endDate ? new Date(exp.endDate).getFullYear().toString() : "")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            onChange={(e) => handleExperienceChange(index, 'endYear', e.target.value)}
                            disabled={!isEditMode}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={exp.description || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows="3"
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                          disabled={!isEditMode}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={addWorkExperience}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FaPlus className="mr-1" /> Add Work Experience
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
