import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserCompanyAssignmentForm = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("/api/v1/admin/get-companies");
      setCompanies(response.data.data.sort((a, b) => 
          a.companyName.localeCompare(b.companyName))); // Access the data property of the response
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch companies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/v1/users/self-assign-company", {
        companyId: selectedCompany,
      });

      toast.success("Company assigned successfully");
      setSelectedCompany("");
    } catch (err) {
      toast.error("Failed to assign company");
      console.error("Error assigning company:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <ClipLoader size={42} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error fetching companies: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <ToastContainer />
      <div className="w-full flex flex-col p-10 justify-between">
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Assign Company</h3>
            <p className="text-base mb-2">Select a company to assign to yourself.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Company</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-row w-full mt-4">
              <button
                type="submit"
                className="w-full py-2 px-4 text-white bg-blue-600 rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? <ClipLoader color="white" size={20} /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserCompanyAssignmentForm;
