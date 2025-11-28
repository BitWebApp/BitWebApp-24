import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { FaUsers, FaCheckCircle, FaTimesCircle, FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import ChatBox from "./ChatBox";

const AcceptMajorProject = () => {
  const [appliedGroups, setAppliedGroups] = useState([]);
  const [acceptedGroups, setAcceptedGroups] = useState([]);
  const [pendingTypeChanges, setPendingTypeChanges] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedAcceptedGroups, setSelectedAcceptedGroups] = useState([]);
  const [limits, setLimits] = useState(0);
  const [description, setDescription] = useState("");
  const [absentees, setAbsentees] = useState([]);
  const [remark, setRemark] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [discussionLogs, setDiscussionLogs] = useState([]);
  const [viewMode, setViewMode] = useState("applied");
  const [searchTerm, setSearchTerm] = useState("");
  const [marks, setMarks] = useState({});
  const [showMarksInputFor, setShowMarksInputFor] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const [appliedResponse, getLimits, acceptedResponse, typeChangeResponse] = await Promise.all([
          axios.get("/api/v1/prof/major/getAppliedGroups"),
          axios.get("/api/v1/prof/major/get-limit"),
          axios.get("/api/v1/prof/major/accepted-groups"),
          axios.get("/api/v1/prof/major/pending-type-changes")
        ]);
        
        setAppliedGroups(appliedResponse.data.data);
        setLimits(getLimits.data.data);
        setAcceptedGroups(acceptedResponse.data.data);
        setPendingTypeChanges(typeChangeResponse.data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch groups.");
      }
    };
    fetchGroups();
  }, [marks]);

  // Filter groups based on search term
  const filteredGroups = (
    viewMode === "applied" ? appliedGroups : 
    viewMode === "accepted" ? acceptedGroups : 
    []
  ).filter(group => 
    group.groupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.members.some(member => 
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleGiveMarks = async (studentId) => {
    if (!marks[studentId] || isNaN(marks[studentId])) {
      toast.error("Please enter valid marks");
      return;
    }
  
    try {
      const response = await axios.post("/api/v1/major/give-marks", {
        userId: studentId,
        marks: parseFloat(marks[studentId])
      });
      toast.success(response.data.message);
      setMarks(prev => ({ ...prev, [studentId]: "" }));
      setShowMarksInputFor(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit marks");
    }
  };

  const handleGroupClick = (group) => {
    if (selectedGroup === group._id) {
      setSelectedGroup(null);
      setDiscussionLogs([]);
    } else {
      setSelectedGroup(group._id);
      if (viewMode === "accepted") {
        handleGetDiscussionLogs(group._id);
      }
    }
  };

  const handleAcceptGroup = async (groupId) => {
    const result = await Swal.fire({
      title: "Confirm Acceptance",
      text: "Are you sure you want to accept this group?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Yes, accept",
      cancelButtonText: "Cancel",
      background: "#F9FAFB",
      backdrop: `
        rgba(0,0,0,0.5)
        url("/images/confetti.gif")
        left top
        no-repeat
      `
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post("/api/v1/prof/major/accept-group", { _id: groupId });
        toast.success(response.data.message);
        if (response.status === 200) window.location.reload();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to accept group.");
      }
    }
  };

  const handleDenyGroup = async (groupId) => {
    const result = await Swal.fire({
      title: "Confirm Denial",
      text: "Are you sure you want to deny this group?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, deny",
      cancelButtonText: "Cancel",
      background: "#F9FAFB"
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post("/api/v1/prof/major/deny-group", { _id: groupId });
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
      toast.error("Please select at least two groups to merge.");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Merge",
      text: `You are about to merge ${selectedAcceptedGroups.length} groups. This action cannot be undone.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8B5CF6",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Confirm Merge",
      cancelButtonText: "Cancel",
      background: "#F9FAFB"
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post("/api/v1/prof/major/merge-groups", { groupIds: selectedAcceptedGroups });
        toast.success(response.data.message);
        if (response.status === 200) window.location.reload();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to merge groups.");
      }
    }
  };

  const handleCreateDiscussionLog = async () => {
    try {
      const response = await axios.post("/api/v1/major/add-remark", {
        groupId: selectedGroup,
        description,
        absent: absentees,
        remark,
      });
      toast.success(response.data.message);
      setShowModal(false);
      setDescription("");
      setAbsentees([]);
      setRemark("");
      await handleGetDiscussionLogs(selectedGroup);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create discussion log.");
    }
  };

  const handleGetDiscussionLogs = async (groupId) => {
    try {
      const response = await axios.post("/api/v1/major/get-disc", { groupId });
      console.log("hello", response)
      setDiscussionLogs(response.data.data);
      console.log(response.data.data)
    } catch (err) {
      toast.error(err.response?.data?.data || "Failed to fetch discussion logs.");
    }
  };

  const handleApproveTypeChange = async (groupId) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Approve Type Change",
      text: "Are you sure you want to approve this type change request?",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, approve",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post("/api/v1/major/prof-approve-type-change", {
        groupId,
        action: "approve",
      });

      Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Type change request approved successfully",
        confirmButtonColor: "#10b981",
      });

      // Refresh data
      const [acceptedResponse, typeChangeResponse] = await Promise.all([
        axios.get("/api/v1/prof/major/accepted-groups"),
        axios.get("/api/v1/prof/major/pending-type-changes")
      ]);
      setAcceptedGroups(acceptedResponse.data.data);
      setPendingTypeChanges(typeChangeResponse.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve type change request");
    }
  };

  const handleRejectTypeChange = async (groupId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Reject Type Change",
      text: "Are you sure you want to reject this type change request?",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, reject",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post("/api/v1/major/prof-approve-type-change", {
        groupId,
        action: "reject",
      });

      Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Type change request rejected successfully",
        confirmButtonColor: "#10b981",
      });

      // Refresh data
      const typeChangeResponse = await axios.get("/api/v1/prof/major/pending-type-changes");
      setPendingTypeChanges(typeChangeResponse.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject type change request");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold text-center">Major Project Groups</h1>
          <p className="text-center text-blue-100 mt-2">
            Limit Left : You are left to accept {limits} students only.
          </p>
        </div>

        {/* Controls */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search groups or members..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="applied">Applied Groups</option>
                <option value="accepted">Accepted Groups</option>
                <option value="typeChange">Type Change Requests</option>
              </select>
              {viewMode === "accepted" && selectedAcceptedGroups.length > 1 && (
                <button
                  onClick={handleMergeGroups}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Merge Groups
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Groups List */}
        <div className="p-6">
          {viewMode === "typeChange" ? (
            // Type Change Requests View
            pendingTypeChanges.length > 0 ? (
              <div className="space-y-6">
                {pendingTypeChanges.map((group) => (
                  <div
                    key={group._id}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Group Info Header */}
                    <div className="mb-5 pb-4 border-b border-gray-200">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Group ID: <span className="text-blue-600">{group.groupId}</span>
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Leader: <span className="font-semibold">{group.leader?.fullName}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="inline-block bg-white px-4 py-2 rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-600">Current Type: </span>
                            <span className="font-bold text-blue-600 capitalize">{group.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Group Details */}
                    <div className="grid md:grid-cols-3 gap-4 mb-5">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Members</p>
                        <p className="font-bold text-gray-800">{group.members?.length || 0}</p>
                      </div>
                      {group.org && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600">Current Organization</p>
                          <p className="font-bold text-gray-800">{group.org?.companyName}</p>
                        </div>
                      )}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Professor</p>
                        <p className="font-bold text-gray-800">
                          {group.majorAllocatedProf?.fullName || "Not Allocated"}
                        </p>
                      </div>
                    </div>

                    {/* Type Change Requests */}
                    <div className="space-y-3 mb-5">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Pending Requests ({group.typeChangeRequests?.length || 0})
                      </h4>
                      
                      {group.typeChangeRequests?.map((req, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-lg p-4 border-l-4 border-yellow-500"
                        >
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <span className="text-sm text-gray-600">Student: </span>
                              <span className="font-semibold text-gray-800">
                                {req.user?.fullName}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Requested Type: </span>
                              <span className="font-bold text-blue-600 capitalize">
                                {req.requestedType}
                              </span>
                            </div>
                            {req.org && (
                              <div>
                                <span className="text-sm text-gray-600">New Organization: </span>
                                <span className="font-semibold text-gray-800">
                                  {req.org?.companyName}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-sm text-gray-600">Requested: </span>
                              <span className="font-medium text-xs text-gray-700">
                                {new Date(req.initiatedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Outcome Preview */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                      <h4 className="font-semibold text-blue-900 mb-3">Expected Outcome:</h4>
                      {group.typeChangeRequests?.length === 1 ? (
                        group.typeChangeRequests[0].requestedType === "industrial" && group.members?.length === 2 ? (
                          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>
                              <strong>{group.typeChangeRequests[0].user?.fullName}</strong> will be moved to a new industrial group
                            </li>
                            <li>
                              The other member will remain in the current research group
                            </li>
                            <li>Both groups will remain under your supervision</li>
                          </ul>
                        ) : (
                          <p className="text-sm text-blue-800">
                            The group type will be changed to <strong className="capitalize">{group.typeChangeRequests[0].requestedType}</strong>
                          </p>
                        )
                      ) : group.typeChangeRequests?.length === 2 ? (
                        group.typeChangeRequests[0].requestedType === "industrial" && 
                        group.typeChangeRequests[1].requestedType === "industrial" ? (
                          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Both members will be split into separate industrial groups</li>
                            <li>
                              <strong>{group.typeChangeRequests[0].user?.fullName}</strong> → New industrial group with {group.typeChangeRequests[0].org?.companyName}
                            </li>
                            <li>
                              <strong>{group.typeChangeRequests[1].user?.fullName}</strong> → New industrial group with {group.typeChangeRequests[1].org?.companyName}
                            </li>
                            <li>Original group will be deleted</li>
                            <li>Both new groups will remain under your supervision</li>
                          </ul>
                        ) : group.typeChangeRequests[0].requestedType === "research" && 
                              group.typeChangeRequests[1].requestedType === "research" ? (
                          <p className="text-sm text-blue-800">
                            The group will be converted to <strong>research type</strong>
                          </p>
                        ) : (
                          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>One member will move to an industrial group</li>
                            <li>One member will stay in a research group</li>
                            <li>Both groups will remain under your supervision</li>
                          </ul>
                        )
                      ) : null}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleApproveTypeChange(group._id)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md font-medium flex items-center justify-center"
                      >
                        <FaCheckCircle className="mr-2" />
                        Approve Type Change
                      </button>
                      <button
                        onClick={() => handleRejectTypeChange(group._id)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md font-medium flex items-center justify-center"
                      >
                        <FaTimesCircle className="mr-2" />
                        Reject Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  No Pending Type Change Requests
                </h3>
                <p className="text-gray-600 mt-2">
                  There are no type change requests waiting for your approval.
                </p>
              </div>
            )
          ) : (
            // Original Groups List
          filteredGroups.length > 0 ? (
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <div key={group._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Group Header */}
                  <div className={`p-4 flex items-center justify-between ${selectedGroup === group._id ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 cursor-pointer`}>
                    <div className="flex items-center space-x-4">
                      {viewMode === "accepted" && (
                        <input
                          type="checkbox"
                          checked={selectedAcceptedGroups.includes(group._id)}
                          onChange={() => handleSelectAcceptedGroup(group._id)}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">Group ID: {group.groupId}</h3>
                        <p className="text-gray-600">{group.members.length} members</p>
                        <p className="text-sm font-semibold text-gray-700">
                          Type: <span className={`capitalize ${group.type === 'research' ? 'text-purple-600' : 'text-blue-600'}`}>
                            {group.type}
                          </span>
                        </p>
                        {group?.org?.companyName && (
                          <p className="text-gray-600">Company: {group.org.companyName.toUpperCase()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGroupClick(group)}
                        className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <FaUsers className="mr-2" />
                        {selectedGroup === group._id ? "Hide" : "View"} Members
                      </button>
                      {viewMode === "applied" && (
                        <>
                          <button
                            onClick={() => handleAcceptGroup(group._id)}
                            className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <FaCheckCircle className="mr-2" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDenyGroup(group._id)}
                            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <FaTimesCircle className="mr-2" />
                            Deny
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Members View */}
                  {selectedGroup === group._id && (
                    <div className="p-4 bg-gray-50 border-t">
                      <h4 className="font-semibold text-lg text-gray-800 mb-4">Group Members</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                          {group.members.map((member, index) => (
                            <tr key={member._id} className="hover:bg-gray-50">
                              {(viewMode === "accepted") && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                {showMarksInputFor === member._id ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="50"
                                      step="1"
                                      value={marks[member._id] ?? member.marks.minorProject ?? ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Allow empty string or valid number between 0-50
                                        if (value === "" || (!isNaN(value) && value >= 0 && value <= 50)) {
                                          setMarks(prev => ({
                                            ...prev,
                                            [member._id]: value === "" ? "" : value
                                          }));
                                        }
                                      }}
                                      onBlur={(e) => {
                                        if (e.target.value === "") {
                                          setMarks(prev => ({
                                            ...prev,
                                            [member._id]: "0"
                                          }));
                                        }
                                      }}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="0-50"
                                    />
                                    <span className="text-xs text-gray-500">/50</span>
                                    <button
                                      onClick={() => handleGiveMarks(member._id)}
                                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                                    >
                                      Submit
                                    </button>
                                    <button
                                      onClick={() => setShowMarksInputFor(null)}
                                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowMarksInputFor(member._id)}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center"
                                  >
                                    <span>{member.marks.minorProject || 0}/50</span>
                                    <FaEdit className="ml-2 text-sm" />
                                  </button>
                                )}
                              </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col items-center">
                                  <img 
                                    src={member.image || "/images/default-avatar.png"} 
                                    alt={member.fullName}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                  {index === 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                                      Team Lead
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {member.fullName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {member.rollNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {member.cgpa}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {member.branch === "computer science and engineering" ? "CSE" : 
                                member.branch === "artificial intelligence and machine learning" ? "AIML" : 
                                member.branch}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                {member.codingProfiles?.leetcode && (
                                  <a 
                                    href={member.codingProfiles.leetcode} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs hover:bg-orange-200"
                                  >
                                    LeetCode
                                  </a>
                                )}
                                {member.codingProfiles?.github && (
                                  <a 
                                    href={member.codingProfiles.github} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs hover:bg-gray-200"
                                  >
                                    GitHub
                                  </a>
                                )}
                                {member.linkedin && (
                                  <a 
                                    href={member.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200"
                                  >
                                    LinkedIn
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Discussion Logs Section */}
                      {viewMode === "accepted" && (
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-lg text-gray-800">Discussion Logs</h4>
                            <button
                              onClick={() => setShowModal(true)}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FaEdit className="mr-2" />
                              Add Log
                            </button>
                          </div>
                          
                          {discussionLogs.length > 0 ? (
                            <div className="space-y-3">
                              {discussionLogs.map((log, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-gray-700"><span className="font-medium">Description:</span> {log.description}</p>
                                      {log.absent?.length > 0 && (
                                        <p className="text-gray-700 mt-1">
                                          <span className="font-medium">Absentees:</span> {log.absent.map(a => a.fullName).join(", ")}
                                        </p>
                                      )}
                                      {log.remark && (
                                        <p className="text-gray-700 mt-1">
                                          <span className="font-medium">Remark:</span> <span className="capitalize">{log.remark}</span>
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Intl.DateTimeFormat("en-IN", {
                                        timeZone: "Asia/Kolkata",
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      }).format(new Date(log.date))}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                              No discussion logs yet
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-6">
                        <h4 className="font-semibold text-lg text-gray-800 mb-4">Group Chat</h4>
                        <ChatBox groupId={group.groupId} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No groups found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm ? "Try adjusting your search" : `No ${viewMode === "applied" ? "applied" : "accepted"} groups at this time`}
              </p>
            </div>
          )
          )}
        </div>
      </div>

      {/* Discussion Log Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create Discussion Log</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Absentees</label>
                  <div className="space-y-2">
                    {acceptedGroups.find(g => g._id === selectedGroup)?.members.map(member => (
                      <div key={member._id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={absentees.includes(member._id)}
                          onChange={() => setAbsentees(prev => 
                            prev.includes(member._id) 
                              ? prev.filter(id => id !== member._id) 
                              : [...prev, member._id]
                          )}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          {member.fullName} ({member.rollNumber})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  >
                    <option value="">Select remark</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="satisfactory">Satisfactory</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDiscussionLog}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptMajorProject;