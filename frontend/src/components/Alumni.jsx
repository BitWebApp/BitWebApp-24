import axios from "axios";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
export default function Alumni() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    alternateEmail: "",
    mobileNumber: "",
    linkedin: "",
  });
  const [alumniForm, setAlumniForm] = useState({
    batch: "",
    program: "",
    branch: "",
  });
  const [higherEdForm, setHigherEdForm] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    docs: [],
  });
  const [editingHigherEdId, setEditingHigherEdId] = useState(null);
  const [editingHigherEdDocs, setEditingHigherEdDocs] = useState([]);
  const [workExpForm, setWorkExpForm] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrentlyWorking: false,
  });
  const [placementForms, setPlacementForms] = useState({
    one: { company: "", role: "", ctc: "", date: "", doc: null },
    two: { company: "", role: "", ctc: "", date: "", doc: null },
    three: { company: "", role: "", ctc: "", date: "", doc: null },
  });
  const [saving, setSaving] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/alumni/summary", {
        withCredentials: true,
      });
      const data = response.data.data;
      setSummary(data);
      setProfileForm({
        fullName: data.user?.fullName || "",
        email: data.user?.email || "",
        alternateEmail: data.user?.alternateEmail || "",
        mobileNumber: data.user?.mobileNumber || "",
        linkedin: data.user?.linkedin || "",
      });
      setAlumniForm({
        batch: data.alumni?.batch || data.user?.batch || "",
        program: data.alumni?.program || "",
        branch: data.user?.branch || data.alumni?.branch || "",
      });
    } catch (error) {
      console.error("Failed to load alumni summary", error);
      Swal.fire("Error", "Failed to load alumni summary", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(profileForm).forEach(([key, value]) => {
      if (value !== "") {
        formData.append(key, value);
      }
    });

    if ([...formData.keys()].length === 0) {
      Swal.fire("Nothing to update", "Please edit at least one field", "info");
      return;
    }

    try {
      setSaving(true);
      await axios.patch("/api/v1/users/update", formData, {
        withCredentials: true,
      });
      await fetchSummary();
      Swal.fire("Success", "Profile updated successfully", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };


  const handleHigherEducationAdd = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("institution", higherEdForm.institution);
      formData.append("degree", higherEdForm.degree);
      formData.append("fieldOfStudy", higherEdForm.fieldOfStudy);
      formData.append("startDate", higherEdForm.startDate);
      formData.append("endDate", higherEdForm.endDate);
      Array.from(higherEdForm.docs).forEach((file) => {
        formData.append("files", file);
      });

      if (editingHigherEdId) {
        formData.append("keepDocs", JSON.stringify(editingHigherEdDocs));
        await axios.put(
          `/api/v1/higher-education/${editingHigherEdId}`,
          formData,
          { withCredentials: true }
        );
      } else {
        await axios.post("/api/v1/higher-education", formData, {
          withCredentials: true,
        });
      }
      setHigherEdForm({
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        docs: [],
      });
      setEditingHigherEdId(null);
      setEditingHigherEdDocs([]);
      await fetchSummary();
      Swal.fire(
        "Success",
        editingHigherEdId ? "Higher education updated" : "Higher education added",
        "success"
      );
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to save higher education",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleHigherEducationEdit = (item) => {
    setEditingHigherEdId(item._id);
    setEditingHigherEdDocs(item.docs || []);
    setHigherEdForm({
      institution: item.institution || "",
      degree: item.degree || "",
      fieldOfStudy: item.fieldOfStudy || "",
      startDate: item.startDate?.slice(0, 10) || "",
      endDate: item.endDate?.slice(0, 10) || "",
      docs: [],
    });
  };

  const handleHigherEducationCancel = () => {
    setEditingHigherEdId(null);
    setEditingHigherEdDocs([]);
    setHigherEdForm({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      docs: [],
    });
  };

  const removeHigherEdDoc = (docUrl) => {
    setEditingHigherEdDocs((prev) => prev.filter((doc) => doc !== docUrl));
  };

  const handleHigherEducationDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this entry?",
      text: "This will permanently remove the higher education record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSaving(true);
      await axios.delete(`/api/v1/higher-education/${id}`, {
        withCredentials: true,
      });
      if (editingHigherEdId === id) {
        handleHigherEducationCancel();
      }
      await fetchSummary();
      Swal.fire("Deleted", "Higher education entry removed", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to delete higher education",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const getDocUrl = (docUrl) => {
    if (!docUrl) {
      return "";
    }
    if (docUrl.startsWith("http://") || docUrl.startsWith("https://")) {
      return docUrl;
    }
    if (docUrl.startsWith("/uploads/")) {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      return `${baseUrl}${docUrl}`;
    }
    return docUrl;
  };

  const isPreviewableImage = (docUrl) => {
    return /\.(png|jpe?g|gif|webp)$/i.test(docUrl || "");
  };

  const handleWorkExperienceAdd = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.post(
        "/api/v1/alumni/work-experience",
        workExpForm,
        { withCredentials: true }
      );
      setWorkExpForm({
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        isCurrentlyWorking: false,
      });
      await fetchSummary();
      Swal.fire("Success", "Work experience added", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to add work experience",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleWorkExperienceDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this entry?",
      text: "This will permanently remove the work experience.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSaving(true);
      await axios.delete(`/api/v1/alumni/work-experience/${id}`, {
        withCredentials: true,
      });
      await fetchSummary();
      Swal.fire("Deleted", "Work experience removed", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to delete work experience",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePlacementSave = async (slotKey, endpoint) => {
    const result = await Swal.fire({
      title: "Submit placement?",
      text: "Placement details cannot be edited after submission.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      const form = placementForms[slotKey];
      formData.append("company", form.company);
      formData.append("role", form.role);
      formData.append("ctc", form.ctc);
      formData.append("date", form.date);
      if (form.doc) {
        formData.append("doc", form.doc);
      }

      await axios.patch(`/api/v1/users/${endpoint}`, formData, {
        withCredentials: true,
      });
      setPlacementForms((prev) => ({
        ...prev,
        [slotKey]: { company: "", role: "", ctc: "", date: "", doc: null },
      }));
      await fetchSummary();
      Swal.fire("Success", "Placement submitted", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to update placement",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Profile Details</h2>
          <form onSubmit={handleProfileSave} className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Full Name"
              value={profileForm.fullName}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
              }
              className="border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Alternate Email"
              value={profileForm.alternateEmail}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  alternateEmail: e.target.value,
                }))
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Mobile Number"
              value={profileForm.mobileNumber}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  mobileNumber: e.target.value,
                }))
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="LinkedIn URL"
              value={profileForm.linkedin}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, linkedin: e.target.value }))
              }
              className="border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Alumni Details</h2>
          {summary?.alumni || alumniForm.batch || alumniForm.branch ? (
            <div className="grid gap-4 md:grid-cols-2 text-sm text-gray-700">
              <div>
                <p className="text-xs uppercase text-gray-500">Batch</p>
                <p className="font-semibold">{alumniForm.batch || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Branch</p>
                <p className="font-semibold">{alumniForm.branch || "-"}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Alumni details are not available yet.
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Summer Project (Industrial)</h3>
            {summary?.summerIndustrial ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p>Group ID: {summary.summerIndustrial.groupId || "-"}</p>
                <p>Organization: {summary.summerIndustrial.org || "BIT"}</p>
                <p>Project Title: {summary.summerIndustrial.projectTitle || "-"}</p>
                <p>Mentor: {summary.summerIndustrial.mentor || "-"}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No industrial summer project found.</p>
            )}
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Major Project (Industrial)</h3>
            {summary?.majorIndustrial ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p>Group ID: {summary.majorIndustrial.groupId || "-"}</p>
                <p>Organization: {summary.majorIndustrial.org || "BIT"}</p>
                <p>Project Title: {summary.majorIndustrial.projectTitle || "-"}</p>
                <p>Mentor: {summary.majorIndustrial.mentor || "-"}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No industrial major project found.</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Higher Education</h2>
          {summary?.higherEducations?.length ? (
            <div className="space-y-4 mb-6">
              {summary.higherEducations.map((item, index) => (
                <div key={index} className="border rounded p-3 text-sm">
                  <p className="font-semibold">{item.institution}</p>
                  <p>{item.degree} - {item.fieldOfStudy}</p>
                  <p>
                    {item.startDate?.slice(0, 10)} to {item.endDate?.slice(0, 10)}
                  </p>
                  {item.docs?.length ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs uppercase text-gray-500">Documents</p>
                      <div className="flex flex-wrap gap-3">
                        {item.docs.map((docUrl, docIndex) => {
                          const resolvedUrl = getDocUrl(docUrl);
                          return (
                            <div key={docIndex} className="flex flex-col gap-1">
                              {isPreviewableImage(resolvedUrl) ? (
                                <img
                                  src={resolvedUrl}
                                  alt="Higher education document"
                                  className="h-24 w-32 object-cover rounded border"
                                />
                              ) : (
                                <a
                                  href={resolvedUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 underline text-xs"
                                >
                                  View document
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleHigherEducationEdit(item)}
                    className="mt-3 text-xs text-blue-600 underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHigherEducationDelete(item._id)}
                    className="mt-3 ml-4 text-xs text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-6">No higher education entries.</p>
          )}

          <form onSubmit={handleHigherEducationAdd} className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Institution"
              value={higherEdForm.institution}
              onChange={(e) =>
                setHigherEdForm((prev) => ({ ...prev, institution: e.target.value }))
              }
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Degree"
              value={higherEdForm.degree}
              onChange={(e) =>
                setHigherEdForm((prev) => ({ ...prev, degree: e.target.value }))
              }
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Field of Study"
              value={higherEdForm.fieldOfStudy}
              onChange={(e) =>
                setHigherEdForm((prev) => ({
                  ...prev,
                  fieldOfStudy: e.target.value,
                }))
              }
              className="border p-2 rounded"
              required
            />
            <input
              type="date"
              value={higherEdForm.startDate}
              onChange={(e) =>
                setHigherEdForm((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border p-2 rounded"
              aria-label="Higher education start date"
              required
            />
            <input
              type="date"
              value={higherEdForm.endDate}
              onChange={(e) =>
                setHigherEdForm((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="border p-2 rounded"
              aria-label="Higher education end date"
              required
            />
            <p className="text-xs text-gray-500 md:col-span-2">
              Higher education dates are program start and end dates.
            </p>
            <input
              type="file"
              multiple
              onChange={(e) =>
                setHigherEdForm((prev) => ({ ...prev, docs: e.target.files }))
              }
              className="border p-2 rounded"
              required={!editingHigherEdId}
            />
            {editingHigherEdId && (
              <div className="md:col-span-2 border rounded p-3">
                <p className="text-xs uppercase text-gray-500 mb-2">
                  Existing documents
                </p>
                {editingHigherEdDocs.length ? (
                  <div className="flex flex-wrap gap-3">
                    {editingHigherEdDocs.map((docUrl) => {
                      const resolvedUrl = getDocUrl(docUrl);
                      return (
                      <div key={docUrl} className="flex flex-col items-start gap-1">
                        {isPreviewableImage(resolvedUrl) ? (
                          <img
                            src={resolvedUrl}
                            alt="Existing document"
                            className="h-20 w-28 object-cover rounded border"
                          />
                        ) : (
                          <a
                            href={resolvedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline text-xs"
                          >
                            View document
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => removeHigherEdDoc(docUrl)}
                          className="text-xs text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    No documents retained. Upload at least one new file.
                  </p>
                )}
              </div>
            )}
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded md:col-span-2"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingHigherEdId
                ? "Update Higher Education"
                : "Add Higher Education"}
            </button>
            {editingHigherEdId && (
              <button
                type="button"
                onClick={handleHigherEducationCancel}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded md:col-span-2"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Placement</h2>
          <div className="border rounded p-3">
            <h4 className="font-semibold mb-2">Placement</h4>
            {summary?.placements?.placementOne ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Company:</span> {summary.placements.placementOne.company}</p>
                <p><span className="font-medium">Role:</span> {summary.placements.placementOne.role}</p>
                <p><span className="font-medium">CTC:</span> {summary.placements.placementOne.ctc} LPA</p>
                <p><span className="font-medium">Date:</span> {summary.placements.placementOne.date?.slice(0, 10)}</p>
                {summary.placements.placementOne.doc && (() => {
                  const docUrl = getDocUrl(summary.placements.placementOne.doc);
                  return (
                    <div className="mt-3">
                      <p className="text-xs uppercase text-gray-500 mb-1">Offer Letter / Document</p>
                      {isPreviewableImage(docUrl) ? (
                        <img
                          src={docUrl}
                          alt="Placement document"
                          className="h-28 w-40 object-cover rounded border"
                        />
                      ) : (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline text-xs"
                        >
                          View submitted document
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">No placement submitted yet.</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Company"
                    value={placementForms.one.company}
                    onChange={(e) =>
                      setPlacementForms((prev) => ({
                        ...prev,
                        one: { ...prev.one, company: e.target.value },
                      }))
                    }
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={placementForms.one.role}
                    onChange={(e) =>
                      setPlacementForms((prev) => ({
                        ...prev,
                        one: { ...prev.one, role: e.target.value },
                      }))
                    }
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="number"
                    placeholder="CTC (in LPA)"
                    value={placementForms.one.ctc}
                    onChange={(e) =>
                      setPlacementForms((prev) => ({
                        ...prev,
                        one: { ...prev.one, ctc: e.target.value },
                      }))
                    }
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="date"
                    value={placementForms.one.date}
                    onChange={(e) =>
                      setPlacementForms((prev) => ({
                        ...prev,
                        one: { ...prev.one, date: e.target.value },
                      }))
                    }
                    className="border p-2 rounded w-full"
                    aria-label="Placement offer date"
                  />
                  <p className="text-xs text-gray-500">
                    Placement date is the offer or joining date in your letter.
                  </p>
                  <input
                    type="file"
                    onChange={(e) =>
                      setPlacementForms((prev) => ({
                        ...prev,
                        one: { ...prev.one, doc: e.target.files?.[0] || null },
                      }))
                    }
                    className="border p-2 rounded w-full"
                  />
                  <p className="text-xs text-amber-600 font-medium">
                    ⚠ Placement details cannot be edited after submission.
                  </p>
                  <button
                    type="button"
                    onClick={() => handlePlacementSave("one", "pone")}
                    className="bg-indigo-600 text-white px-3 py-2 rounded w-full"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Submit Placement"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Work Experience</h2>
          {summary?.workExperiences?.length ? (
            <div className="space-y-3 mb-6">
              {summary.workExperiences.map((exp, index) => (
                <div key={index} className="border rounded p-3 text-sm">
                  <p className="font-semibold">{exp.company}</p>
                  <p>{exp.role}</p>
                  <p>
                    {exp.startDate?.slice(0, 10)} -
                    {exp.isCurrentlyWorking
                      ? " Present"
                      : ` ${exp.endDate?.slice(0, 10)}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleWorkExperienceDelete(exp._id)}
                    className="mt-2 text-xs text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-6">No work experience added.</p>
          )}
          <form onSubmit={handleWorkExperienceAdd} className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Company"
              value={workExpForm.company}
              onChange={(e) =>
                setWorkExpForm((prev) => ({ ...prev, company: e.target.value }))
              }
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Role"
              value={workExpForm.role}
              onChange={(e) =>
                setWorkExpForm((prev) => ({ ...prev, role: e.target.value }))
              }
              className="border p-2 rounded"
              required
            />
            <input
              type="date"
              value={workExpForm.startDate}
              onChange={(e) =>
                setWorkExpForm((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border p-2 rounded"
              aria-label="Work experience start date"
              required
            />
            {!workExpForm.isCurrentlyWorking && (
              <input
                type="date"
                value={workExpForm.endDate}
                onChange={(e) =>
                  setWorkExpForm((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="border p-2 rounded"
                aria-label="Work experience end date"
              />
            )}
            <p className="text-xs text-gray-500 md:col-span-2">
              Work experience dates are your employment start and end dates.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={workExpForm.isCurrentlyWorking}
                onChange={(e) =>
                  setWorkExpForm((prev) => ({
                    ...prev,
                    isCurrentlyWorking: e.target.checked,
                    endDate: e.target.checked ? "" : prev.endDate,
                  }))
                }
              />
              Currently working here
            </label>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded md:col-span-2"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add Work Experience"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
