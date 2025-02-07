import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AcceptStudents = () => {
  const [appliedGroups, setAppliedGroups] = useState([]);
  const [acceptedGroups, setAcceptedGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const appliedResponse = await axios.get("/api/v1/prof/getAppliedGroups");
      setAppliedGroups(appliedResponse.data.data);
      
      const acceptedResponse = await axios.get("/api/v1/prof/accepted-groups");
      setAcceptedGroups(acceptedResponse.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch groups.");
    }
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(selectedGroup === group._id ? null : group._id);
  };

  const handleAcceptGroup = async (group) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/v1/prof/accept-group", {
        _id: group._id
      });
  
      setAcceptedGroups([...acceptedGroups, group]);
      setAppliedGroups(appliedGroups.filter(g => g._id !== group._id));
  
      toast.success(response.data.message || "Group accepted successfully!");
  
    } catch (err) {
      console.error("Error accepting group:", err);
      if (err.response && err.response.data) {
        const htmlDoc = new DOMParser().parseFromString(
          err.response.data,
          "text/html"
        );
        const errorElement = htmlDoc.querySelector("body");
        if (errorElement) {
          const errorMessage = errorElement.textContent.trim();
          const errormsg = errorMessage.split("at")[0].trim();
          console.log(errormsg);
          toast.error(errormsg);
        } else {
          toast.error("An unknown error occurred");
        }
      } else {
        toast.error(err.response?.data?.message || "Failed to accept group.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-3xl font-bold text-center text-blue-700">Groups are waiting! Train them this summer.</h2>

        {[{ title: "Applied Groups", groups: appliedGroups }, { title: "Accepted Groups", groups: acceptedGroups }].map(({ title, groups }) => (
          <div key={title} className="mt-8">
            <h3 className={`text-xl font-semibold ${title === "Accepted Groups" ? "text-green-600" : "text-blue-600"} mb-4`}>{title}</h3>
            {groups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Group ID</th>
                      <th className="px-4 py-2 border">Number of Members</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <React.Fragment key={group._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-2 border text-center">{group.groupId}</td>
                          <td className="px-4 py-2 border text-center">{group.members.length} members</td>
                          <td className="px-4 py-2 border text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleGroupClick(group)} 
                                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                              >
                                {selectedGroup === group._id ? "Hide Members" : "View Members"}
                              </button>
                              {title === "Applied Groups" && (
                                <button 
                                  onClick={() => handleAcceptGroup(group)}
                                  disabled={isLoading}
                                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 disabled:bg-green-300"
                                >
                                  {isLoading ? "Accepting..." : "Accept Group"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {selectedGroup === group._id && (
                          <tr>
                            <td colSpan="3" className="border bg-gray-100">
                              <div className="p-4">
                                <h4 className="text-lg font-semibold text-gray-700">Members</h4>
                                <table className="min-w-full bg-white border border-gray-300 mt-2">
                                  <thead>
                                    <tr>
                                      <th className="px-4 py-2 border">Avatar</th>
                                      <th className="px-4 py-2 border">Full Name</th>
                                      <th className="px-4 py-2 border">Roll Number</th>
                                      <th className="px-4 py-2 border">Branch</th>
                                      <th className="px-4 py-2 border">Section</th>
                                      <th className="px-4 py-2 border">LinkedIn</th>
                                      <th className="px-4 py-2 border">Coding Profiles</th>
                                      <th className="px-4 py-2 border">CGPA</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.members.map((member) => (
                                      <tr key={member._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border"><img src={member.image} alt="Avatar" className="w-10 h-10 rounded-full" /></td>
                                        <td className="px-4 py-2 border">{member.fullName}</td>
                                        <td className="px-4 py-2 border">{member.rollNumber}</td>
                                        <td className="px-4 py-2 border">{member.branch}</td>
                                        <td className="px-4 py-2 border">{member.section}</td>
                                        <td className="px-4 py-2 border"><a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">LinkedIn</a></td>
                                        <td className="px-4 py-2 border">
                                          <div className="flex flex-col space-y-1">
                                            {Object.entries(member.codingProfiles || {}).map(([key, value]) =>
                                              value && (
                                                <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </a>
                                              )
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 border text-center">{member.cgpa || "N/A"}</td>
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