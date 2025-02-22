import React, { useState, useEffect } from "react";
import axios from "axios";

const AcceptStudents = () => {
  const [appliedGroups, setAppliedGroups] = useState([]);
  const [acceptedGroups, setAcceptedGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedAcceptedGroups, setSelectedAcceptedGroups] = useState([]);
  const [limits, setLimits] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const appliedResponse = await axios.get("/api/v1/prof/getAppliedGroups");
        setAppliedGroups(appliedResponse.data.data);
        console.log(appliedResponse)
        const getLimits = await axios.get("/api/v1/prof/get-limit");
        console.log(getLimits)
        setLimits(getLimits.data.data);
        const acceptedResponse = await axios.get("/api/v1/prof/accepted-groups");
        console.log(acceptedGroups);
        setAcceptedGroups(acceptedResponse.data.message);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch groups.");
      }
    };
    fetchGroups();
  }, []);

  const handleGroupClick = (group) => {
    setSelectedGroup(selectedGroup === group._id ? null : group._id);
  };

  const handleAcceptGroup = async (groupId) => {
    try {
      const response = await axios.post("/api/v1/prof/accept-group", { _id: groupId });
      setMessage(response.data.message);
      if (response.status === 200) window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept group.");
    }
  };

  const handleDenyGroup = async (groupId) => {
    try {
      const response = await axios.post("/api/v1/prof/deny-group", { _id: groupId });
      console.log(response);
      setMessage(response.data.message);
      if (response.status === 200) window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deny group.");
    }
  };

  // New function: Toggle group selection for accepted groups
  const handleSelectAcceptedGroup = (groupId) => {
    setSelectedAcceptedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  // New function: Merge groups API call
  const handleMergeGroups = async () => {
    if (selectedAcceptedGroups.length < 2) {
      setError("Select at least two groups to merge.");
      return;
    }
    try {
      const response = await axios.post("/api/v1/prof/merge-groups", { groupIds: selectedAcceptedGroups });
      setMessage(response.data.message);
      if (response.status === 200) window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to merge groups.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-3xl font-bold text-center text-blue-700">Groups are waiting! Train them this summer.</h2>
        <h2 className="text-3xl font-bold text-center text-blue-700">You can only accept {limits} students.</h2>
        {message && <p className="text-green-600 font-semibold text-center mb-4">{message}</p>}
        {error && <p className="text-red-600 font-semibold text-center mb-4">{error}</p>}

        {[
          { title: "Applied Groups", groups: appliedGroups },
          { title: "Accepted Groups", groups: acceptedGroups }
        ].map(({ title, groups }) => (
          <div key={title} className="mt-8">
            <h3 className={`text-xl font-semibold ${title === "Accepted Groups" ? "text-green-600" : "text-blue-600"} mb-4`}>{title}</h3>
            {Array.isArray(groups) && groups?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      {title === "Accepted Groups" && <th className="px-4 py-2 border">Select</th>}
                      <th className="px-4 py-2 border">Group ID</th>
                      <th className="px-4 py-2 border">Number of Members</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <React.Fragment key={group._id}>
                        <tr className="hover:bg-gray-50">
                          {title === "Accepted Groups" && (
                            <td className="px-4 py-2 border text-center">
                              <input
                                type="checkbox"
                                checked={selectedAcceptedGroups.includes(group._id)}
                                onChange={() => handleSelectAcceptedGroup(group._id)}
                              />
                            </td>
                          )}
                          <td className="px-4 py-2 border text-center">{group.groupId}</td>
                          <td className="px-4 py-2 border text-center">{group.members.length} members</td>
                          <td className="px-4 py-2 border text-center">
                            <button onClick={() => handleGroupClick(group)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
                              {selectedGroup === group._id ? "Hide Members" : "View Members"}
                            </button>
                            {title === "Applied Groups" && (
                              <>
                                <button onClick={() => handleAcceptGroup(group._id)} className="ml-2 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">Accept</button>
                                <button onClick={() => handleDenyGroup(group._id)} className="ml-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Deny</button>
                              </>
                            )}
                          </td>
                        </tr>
                        {selectedGroup === group._id && (
                          <tr>
                            <td colSpan={title === "Accepted Groups" ? "4" : "3"} className="border bg-gray-100">
                              <div className="p-4">
                                <h4 className="text-lg font-semibold text-gray-700">Members</h4>
                                <table className="min-w-full bg-white border border-gray-300 mt-2">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-2 border">Photo</th>
                                      <th className="px-4 py-2 border">Full Name</th>
                                      <th className="px-4 py-2 border">Roll Number</th>
                                      <th className="px-4 py-2 border">CGPA</th>
                                      <th className="px-4 py-2 border">Branch</th>
                                      <th className="px-4 py-2 border">DSA skills</th>
                                      <th className="px-4 py-2 border">GitHub</th>
                                      <th className="px-4 py-2 border">LinkedIn</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.members.map((member) => (
                                      <tr key={member._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border"><img className="w-1/2 m-auto" src={member.image} alt="" /></td>
                                        <td className="px-4 py-2 border">{member.fullName.toUpperCase()}</td>
                                        <td className="px-4 py-2 border">{member.rollNumber}</td>
                                        <td className="px-4 py-2 border">{member.cgpa}</td>
                                        <td className="px-4 py-2 border">{(member.branch==="computer science and engineering") ? "CSE" : (member.branch==="artificial intelligence and machine learning") ? "AIML": "NA"}</td>
                                        <td className="px-4 py-2 border">
                                          <a href={member.codingProfiles.leetcode}>
                                            <button className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105">Click</button>
                                          </a>
                                        </td>
                                        <td className="px-4 py-2 border">
                                          <a href={member.codingProfiles.github}>
                                            <button className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105">Click</button>
                                          </a>
                                        </td>
                                        <td className="px-4 py-2 border">
                                          <a href={member.linkedin}>
                                            <button className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105">Click</button>
                                          </a>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                {title === "Accepted Groups" && selectedAcceptedGroups.length > 1 && (
                  <div className="text-center mt-4">
                    <button onClick={handleMergeGroups} className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600">
                      Merge Selected Groups
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center">No groups found.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcceptStudents;
