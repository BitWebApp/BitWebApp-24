import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const AdminAddCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/v1/admin/get-companies");
        setCompanies(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleAddCompany = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/v1/admin/add-company", {
        companyName: newCompanyName,
      });
      setCompanies((prevCompanies) => [...prevCompanies, response.data.data]);
      setNewCompanyName("");
      setShowForm(false);
    } catch (err) {
      alert(`Error adding company: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
    <div className="overflow-x-auto">
      <h1 className="text-center text-3xl font-bold mb-8">Companies List</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
        >
          {showForm ? "Cancel" : "Add Company"}
        </button>
      </div>

      {showForm && (
        <div className="fixed top-20 right-10 bg-white shadow-lg rounded p-4 w-72 z-50 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Add Company</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-red-500 focus:outline-none"
            >
              ✖
            </button>
          </div>
          <input
            type="text"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            placeholder="Enter company name"
            className="p-2 border rounded w-full mb-3"
          />
          <button
            onClick={handleAddCompany}
            disabled={isSubmitting || !newCompanyName.trim()}
            className={`w-full py-2 ${
              isSubmitting ? "bg-gray-400" : "bg-blue-500"
            } text-white rounded hover:bg-blue-600 focus:outline-none`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <table className="w-full max-w-4xl bg-white shadow-md rounded my-6 overflow-hidden">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="py-3 px-6 text-left">#</th>
              <th className="py-3 px-6 text-left">Company ID</th>
              <th className="py-3 px-6 text-left">Company Name</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr
                key={company._id}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="py-3 px-6 whitespace-nowrap">{index + 1}</td>
                <td className="py-3 px-6">{company._id}</td>
                <td className="py-3 px-6">{company.companyName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAddCompanies;
