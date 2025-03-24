import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { FaUsers, FaCheckCircle, FaTimesCircle, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const AcceptStudents = () => {
  const [appliedGroups, setAppliedGroups] = useState([]);
  const [acceptedGroups, setAcceptedGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedAcceptedGroups, setSelectedAcceptedGroups] = useState([]);
  const [limits, setLimits] = useState(0);
  const [description, setDescription] = useState("");
  const [absentees, setAbsentees] = useState([]);
  const [remark, setRemark] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [discussionLogs, setDiscussionLogs] = useState([]);
  const [viewMode, setViewMode] = useState("applied");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const appliedResponse = await axios.get("/api/v1/prof/getAppliedGroups");
        setAppliedGroups(appliedResponse.data.data);
        const getLimits = await axios.get("/api/v1/prof/get-limit");
        setLimits(getLimits.data.data);
        const acceptedResponse = await axios.get("/api/v1/prof/accepted-groups");
        setAcceptedGroups(acceptedResponse.data.message);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch groups.");
      }
    };
    fetchGroups();
  }, []);

  const handleGroupClick = (group) => {
    setSelectedGroup(selectedGroup === group._id ? null : group._id);
  };

  const handleAcceptGroup = async (groupId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to accept this group. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, accept it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post("/api/v1/prof/accept-group", { _id: groupId });
        toast.success(response.data.message);
        if (response.status === 200) window.location.reload();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to accept group.");
      }
    }
  };

  const handleDenyGroup = async (groupId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to deny this group. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, deny it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post("/api/v1/prof/deny-group", { _id: groupId });
        toast.success(response.data.message);
        if (response.status === 200) window.location.reload();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to deny group.");
      }
    }
  };

  const handleSelectAcceptedGroup = (groupId) => {
    setSelectedAcceptedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleMergeGroups = async () => {
    if (selectedAcceptedGroups.length < 2) {
      toast.error("Select at least two groups to merge.");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to merge the selected groups. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, merge them!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post("/api/v1/prof/merge-groups", { groupIds: selectedAcceptedGroups });
        toast.success(response.data.message);
        if (response.status === 200) window.location.reload();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to merge groups.");
      }
    }
  };

  const handleCreateDiscussionLog = async () => {
    try {
      const response = await axios.post("/api/v1/group/add-remark", {
        groupId: selectedGroup,
        description,
        absent: absentees,
        remark,
      });
      toast.success(response.data.message);
      if (response.status === 200) {
        await handleGetDiscussionLogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create discussion log.");
    }
    setShowModal(false);
  };

  const handleGetDiscussionLogs = async () => {
    try {
      const response = await axios.post("/api/v1/group/get-disc", {
        groupId: selectedGroup,
      });
      setDiscussionLogs(response.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch discussion logs.");
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const currentGroups = viewMode === "applied" ? appliedGroups : acceptedGroups;
  const currentTitle = viewMode === "applied" ? "Applied Groups" : "Accepted Groups";

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl p-8">
        <h2 className="text-4xl font-bold text-center text-blue-800 mb-4">
          Groups are waiting! Train them this summer.
        </h2>
        <h2 className="text-2xl font-semibold text-center text-blue-600 mb-8">
          You can only accept {limits} students.
        </h2>

        {/* Dropdown for selecting view mode */}
        <div className="mt-6 flex justify-center">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg text-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="applied">Applied Groups</option>
            <option value="accepted">Accepted Groups</option>
          </select>
        </div>

        <div className="mt-8">
          <h3 className={`text-2xl font-bold ${viewMode === "accepted" ? "text-green-700" : "text-blue-700"} mb-6`}>
            {currentTitle}
          </h3>
          {Array.isArray(currentGroups) && currentGroups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-blue-50">
                    {viewMode === "accepted" && <th className="px-6 py-4 border">Select</th>}
                    <th className="px-6 py-4 border">Group ID</th>
                    <th className="px-6 py-4 border">Number of Members</th>
                    <th className="px-6 py-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGroups.map((group) => (
                    <React.Fragment key={group._id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        {viewMode === "accepted" && (
                          <td className="px-6 py-4 border text-center">
                            <input
                              type="checkbox"
                              checked={selectedAcceptedGroups.includes(group._id)}
                              onChange={() => handleSelectAcceptedGroup(group._id)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 border text-center font-medium">{group.groupId}</td>
                        <td className="px-6 py-4 border text-center">{group.members.length} members</td>
                        <td className="px-6 py-4 border text-center space-x-2">
                          <button
                            onClick={() => handleGroupClick(group)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center"
                          >
                            <FaUsers className="mr-2" />
                            {selectedGroup === group._id ? "Hide Members" : "View Members"}
                          </button>
                          {viewMode === "applied" && (
                            <>
                              <button
                                onClick={() => handleAcceptGroup(group._id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all flex items-center"
                              >
                                <FaCheckCircle className="mr-2" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleDenyGroup(group._id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all flex items-center"
                              >
                                <FaTimesCircle className="mr-2" />
                                Deny
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                      {selectedGroup === group._id && (
                        <tr>
                          <td colSpan={viewMode === "accepted" ? "4" : "3"} className="border bg-gray-50">
                            <div className="p-6">
                              <h4 className="text-xl font-semibold text-gray-700 mb-4">Members</h4>
                              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="px-6 py-4 border">Photo</th>
                                    <th className="px-6 py-4 border">Full Name</th>
                                    <th className="px-6 py-4 border">Roll Number</th>
                                    <th className="px-6 py-4 border">CGPA</th>
                                    <th className="px-6 py-4 border">Branch</th>
                                    <th className="px-6 py-4 border">DSA Skills</th>
                                    <th className="px-6 py-4 border">GitHub</th>
                                    <th className="px-6 py-4 border">LinkedIn</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.members.map((member) => (
                                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4 border">
                                        <img className="w-12 h-12 rounded-full mx-auto" src={member.image} alt={member.fullName} />
                                      </td>
                                      <td className="px-6 py-4 border text-center">{member.fullName.toUpperCase()}</td>
                                      <td className="px-6 py-4 border text-center">{member.rollNumber}</td>
                                      <td className="px-6 py-4 border text-center">{member.cgpa}</td>
                                      <td className="px-6 py-4 border text-center">
                                        {member.branch === "computer science and engineering"
                                          ? "CSE"
                                          : member.branch === "artificial intelligence and machine learning"
                                          ? "AIML"
                                          : "NA"}
                                      </td>
                                      <td className="px-6 py-4 border text-center">
                                        <a href={member.codingProfiles.leetcode} target="_blank" rel="noopener noreferrer">
                                          <button className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all">
                                            LeetCode
                                          </button>
                                        </a>
                                      </td>
                                      <td className="px-6 py-4 border text-center">
                                        <a href={member.codingProfiles.github} target="_blank" rel="noopener noreferrer">
                                          <button className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all">
                                            GitHub
                                          </button>
                                        </a>
                                      </td>
                                      <td className="px-6 py-4 border text-center">
                                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                                          <button className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all">
                                            LinkedIn
                                          </button>
                                        </a>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {viewMode === "accepted" && (
                                <button
                                  onClick={() => setShowModal(true)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center mt-4"
                                >
                                  <FaEdit className="mr-2" />
                                  Create Discussion Log
                                </button>
                              )}
                              {discussionLogs.length > 0 && (
                                <div className="mt-6">
                                  <h4 className="text-xl font-semibold text-gray-700 mb-4">Discussion Logs</h4>
                                  <ul>
                                    {discussionLogs.map((log, index) => (
                                      <li key={index} className="bg-gray-100 p-4 mb-2 rounded-lg">
                                        <p className="text-gray-700"><strong>Description:</strong> {log.description}</p>
                                        <p className="text-gray-700"><strong>Absentees:</strong> {log.absent.map((absentee) => absentee.fullName).join(", ")}</p>
                                        <p className="text-gray-700"><strong>Remarks:</strong> {log.remark}</p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              {viewMode === "accepted" && selectedAcceptedGroups.length > 1 && (
                <div className="text-center mt-6">
                  <button
                    onClick={handleMergeGroups}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-all flex items-center mx-auto"
                  >
                    <FaPlus className="mr-2" />
                    Merge Selected Groups
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-center">No groups found.</p>
          )}
        </div>

        {showModal && (
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-1/2 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Create Discussion Log</h2>
              <form>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description:
                </label>
                <input
                  id="description"
                  type="text"
                  className="block w-full p-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={handleDescriptionChange}
                />
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="absentees">
                  Absentees:
                </label>
                <div className="flex flex-wrap mb-4">
                  {selectedGroup &&
                    acceptedGroups.find((group) => group._id === selectedGroup).members.map((member) => (
                      <div key={member._id} className="mr-2 mb-2">
                        <input
                          type="checkbox"
                          checked={absentees.includes(member._id)}
                          onChange={() =>
                            setAbsentees((prev) =>
                              prev.includes(member._id)
                                ? prev.filter((id) => id !== member._id)
                                : [...prev, member._id]
                            )
                          }
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-1">{member.fullName}</span>
                      </div>
                    ))}
                </div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="remark">
                  Remarks:
                </label>
                <select
                  id="remark"
                  className="block w-full p-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                >
                  <option value="">Select Remark</option>
                  <option value="satisfactory">Satisfactory</option>
                  <option value="poor">Poor</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="excellent">Excellent</option>
                </select>
              </form>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDiscussionLog}
                  className="ml-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptStudents;