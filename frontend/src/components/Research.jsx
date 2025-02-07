import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";

const extractErrorMessage = (htmlString) => {
  const match = htmlString.match(/<pre>(.*?)<\/pre>/s);
  if (match && match[1]) {
    return match[1].split("<br>")[0].replace("Error: ", "").trim();
  }
  return "An unknown error occurred";
};

const handleError = (error, defaultMessage) => {
  console.error("Full error:", error);

  let message = defaultMessage;
  if (error.response) {
    if (typeof error.response.data === "string") {
      message = extractErrorMessage(error.response.data);
    } else if (error.response.data?.message) {
      message = error.response.data.message;
    }
  }
  toast.error(message);
};

const Research = () => {
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [appliedProfessors, setAppliedProfessors] = useState([]);
  const [allocatedProf, setAllocatedProf] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [selectedProf, setSelectedProf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summerSorted, setSummerSorted] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allProfsResponse, appliedProfsResponse] =
        await Promise.all([
          axios.get("/api/v1/prof/getProf"),
          axios.get("/api/v1/group/get-app-profs")
        ]);
      const { isSummerAllocated, prof, summerAppliedProfs } =
        appliedProfsResponse?.data?.data || {};
      const sortedProfessors = allProfsResponse.data.message.sort((a, b) => {
        const seatsA =
          a.limits.summer_training - a.currentCount.summer_training;
        const seatsB =
          b.limits.summer_training - b.currentCount.summer_training;
        return seatsB - seatsA;
      });

      setAppliedProfessors(summerAppliedProfs);

      if (isSummerAllocated && prof) setAllocatedProf(prof);

      setProfessors(sortedProfessors);
      setFilteredProfessors(sortedProfessors);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      handleError(error)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedProf) {
      Swal.fire({
        icon: "error",
        title: "No Selection",
        text: "Please select a professor to apply.",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/v1/group/apply-faculty", {
        facultyId: selectedProf,
      });
      setLoading(false);
      await fetchData();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Applied successfully",
      });
      setSelectedProf(null);
    } catch (error) {
      setLoading(false);
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Application Failed",
        text: error.response?.data?.message || "Failed to apply. Try again.",
      });
    }
  };

  return (
    <>
    <Toaster position="top-right" />
    <div className="container mx-auto p-6">
      {allocatedProf ? (
        <div className="text-center bg-green-100 p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-green-700">Congratulations!</h1>
          <p className="text-lg mt-4">
            Your summer training has been successfully sorted under{" "}
            {allocatedProf?.fullName || "an assigned professor"}.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">Apply for Summer Training</h1>
          <div className="bg-white shadow-md rounded-lg p-4">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">ID No</th>
                  <th className="border px-4 py-2">Full Name</th>
                  <th className="border px-4 py-2">Seats Available</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Select</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfessors.map((prof) => {
                  const seatsAvailable =
                    prof.limits.summer_training - prof.currentCount.summer_training;
                  const isApplied = appliedProfessors.includes(prof._id);
                  console.log(appliedProfessors)
                  const isAllocated = allocatedProf?._id === prof._id;
                  const isDisabled = isApplied || isAllocated || seatsAvailable === 0;
                  
                  let seatStatus = isApplied
                    ? "✅ Applied"
                    : seatsAvailable === 0
                    ? "❌ No Seats Available"
                    : seatsAvailable < 3
                    ? "⚠️ High Demand"
                    : "✅ Available";

                  return (
                    <tr key={prof._id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 text-center">{prof.idNumber}</td>
                      <td className="border px-4 py-2 text-center">{prof.fullName}</td>
                      <td className="border px-4 py-2 text-center">{seatsAvailable}</td>
                      <td className="border px-4 py-2 text-center font-bold">
                        {seatStatus}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <input
                          type="radio"
                          name="professor"
                          disabled={isDisabled}
                          checked={selectedProf === prof._id}
                          onChange={() => setSelectedProf(prof._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedProf}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ${
                loading || !selectedProf ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Applying..." : "Submit Application"}
            </button>
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default Research;