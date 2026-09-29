import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ReassignMajorMentor() {
  const [groupIdInput, setGroupIdInput] = useState("");
  const [groupData, setGroupData] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [selectedProfId, setSelectedProfId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [profSearch, setProfSearch] = useState("");

  // Fetch all professors on mount
  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await axios.get("/api/v1/admin/get-all-professors");
        setProfessors(res.data.data);
      } catch (err) {
        console.error("Error fetching professors:", err);
        toast.error("Failed to load professors list");
      }
    };
    fetchProfessors();
  }, []);

  // Search for a group by groupId
  const handleSearch = async () => {
    const trimmed = groupIdInput.trim().toUpperCase();
    if (!trimmed) {
      toast.warn("Please enter a Group ID");
      return;
    }

    setSearching(true);
    setGroupData(null);
    setSelectedProfId("");

    try {
      // We use the existing major projects endpoint and filter client-side
      // Try batch 22 first (the students in the Excel are batch 22)
      const batches = [22, 23, 24, 25];
      let found = null;

      for (const batch of batches) {
        try {
          const res = await axios.get("/api/v1/admin/get-major-projects", {
            params: { batch },
          });
          const records = res.data.data.response || [];
          const match = records.find(
            (r) => r.groupId?.toUpperCase() === trimmed,
          );
          if (match) {
            // Get all members of this group
            const groupMembers = records.filter(
              (r) => r.groupId?.toUpperCase() === trimmed,
            );
            found = {
              groupId: match.groupId,
              type: match.type,
              org: match.org,
              projectTitle: match.projectTitle,
              mentor: match.mentor,
              members: groupMembers.map((r) => ({
                rollNumber: r.student.rollNumber,
                fullName: r.student.fullName,
                email: r.student.email,
                branch: r.student.branch,
              })),
            };
            break;
          }
        } catch {
          // Access denied for this batch, skip it
        }
      }

      if (found) {
        setGroupData(found);
        toast.success(`Found group ${found.groupId}`);
      } else {
        toast.error(`No group found with ID "${trimmed}"`);
      }
    } catch (err) {
      console.error("Error searching group:", err);
      toast.error("Error searching for group");
    } finally {
      setSearching(false);
    }
  };

  // Reassign mentor
  const handleReassign = async () => {
    if (!groupData || !selectedProfId) {
      toast.warn("Please select a professor first");
      return;
    }

    const selectedProf = professors.find((p) => p._id === selectedProfId);
    const confirmMsg = `Are you sure you want to reassign group ${groupData.groupId} to ${selectedProf?.fullName}?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/v1/admin/reassign-major-mentor", {
        groupId: groupData.groupId,
        newProfessorId: selectedProfId,
      });

      toast.success(res.data.message || "Mentor reassigned successfully!");

      // Update the displayed data
      const updated = res.data.data;
      setGroupData((prev) => ({
        ...prev,
        mentor: updated.majorAllocatedProf
          ? {
              fullName: updated.majorAllocatedProf.fullName,
              idNumber: updated.majorAllocatedProf.idNumber,
            }
          : null,
      }));
      setSelectedProfId("");

      // Refresh professors list to get updated counts
      const profRes = await axios.get("/api/v1/admin/get-all-professors");
      setProfessors(profRes.data.data);
    } catch (err) {
      console.error("Error reassigning mentor:", err);
      toast.error(
        err.response?.data?.message || "Failed to reassign mentor",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProfessors = professors.filter(
    (p) =>
      p.fullName?.toLowerCase().includes(profSearch.toLowerCase()) ||
      p.idNumber?.toLowerCase().includes(profSearch.toLowerCase()),
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ToastContainer />
      <h1 className="text-center text-3xl font-bold mb-8">
        REASSIGN MAJOR PROJECT MENTOR
      </h1>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Step 1: Search Group by Group ID
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={groupIdInput}
            onChange={(e) => setGroupIdInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Group ID (e.g. 4QZJDD)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider"
            maxLength={6}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Group Details Section */}
      {groupData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Group Details:{" "}
            <span className="font-mono text-blue-600">
              {groupData.groupId}
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-gray-500 text-sm">Type:</span>
              <p className="font-medium capitalize">{groupData.type}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Organisation:</span>
              <p className="font-medium">{groupData.org || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Project Title:</span>
              <p className="font-medium">
                {groupData.projectTitle || "Not set"}
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Current Mentor:</span>
              <p
                className={`font-medium ${groupData.mentor ? "text-green-700" : "text-red-500"}`}
              >
                {groupData.mentor ? groupData.mentor.fullName : "Not assigned"}
              </p>
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-sm">Members:</span>
            <table className="w-full mt-2 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2">Roll Number</th>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Branch</th>
                </tr>
              </thead>
              <tbody>
                {groupData.members.map((m, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-3 py-2 font-mono">{m.rollNumber}</td>
                    <td className="px-3 py-2 capitalize">{m.fullName}</td>
                    <td className="px-3 py-2">{m.email}</td>
                    <td className="px-3 py-2">{m.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reassign Section */}
      {groupData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Step 2: Select New Mentor
          </h2>

          <input
            type="text"
            value={profSearch}
            onChange={(e) => setProfSearch(e.target.value)}
            placeholder="Search professor by name or ID..."
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={selectedProfId}
            onChange={(e) => setSelectedProfId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            size={Math.min(8, filteredProfessors.length + 1)}
          >
            <option value="">-- Select a Professor --</option>
            {filteredProfessors.map((prof) => (
              <option key={prof._id} value={prof._id}>
                {prof.fullName} ({prof.idNumber}) — Major slots:{" "}
                {prof.currentCount?.major_project || 0}/
                {prof.limits?.major_project || 0}
              </option>
            ))}
          </select>

          {selectedProfId && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Confirm:</strong> You are about to reassign group{" "}
                <strong className="font-mono">{groupData.groupId}</strong>
                {groupData.mentor && (
                  <>
                    {" "}
                    from{" "}
                    <strong className="text-red-600">
                      {groupData.mentor.fullName}
                    </strong>
                  </>
                )}{" "}
                to{" "}
                <strong className="text-green-700">
                  {
                    professors.find((p) => p._id === selectedProfId)
                      ?.fullName
                  }
                </strong>
                .
              </p>
            </div>
          )}

          <button
            onClick={handleReassign}
            disabled={loading || !selectedProfId}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold text-lg transition-colors"
          >
            {loading ? "Reassigning..." : "Reassign Mentor"}
          </button>
        </div>
      )}

      {/* Instructions */}
      {!groupData && !searching && (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
          <p className="text-lg mb-2">
            Enter a Major Project Group ID above to get started.
          </p>
          <p className="text-sm">
            You can find Group IDs in the{" "}
            <a
              href="/admin-db/major-project-table"
              className="text-blue-600 underline"
            >
              Major Project Records
            </a>{" "}
            table.
          </p>
        </div>
      )}
    </div>
  );
}
