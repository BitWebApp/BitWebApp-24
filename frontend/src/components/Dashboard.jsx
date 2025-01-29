import React, { useState } from "react";
import axios from "axios";
import { useUserRole } from "./admin/user-links";

const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Dashboard() {
  const [rollNumber, setRollNumber] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRollNumberValid, setIsRollNumberValid] = useState(true);
  const isAdmin = useUserRole();

  const validateRollNumber = (rollNumber) => {
    const rollNumberPattern = /^BTECH\/10\d{3}\/\d{2}$/;
    return rollNumberPattern.test(rollNumber);
  };

  const findStudent = async () => {
    if (!rollNumber) {
      setError("Please enter a roll number");
      return;
    }

    if (!validateRollNumber(rollNumber)) {
      setIsRollNumberValid(false);
      setError("Invalid roll number format. It should be BTECH/10XXX/YY");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/v1/users/getbyroll", {
        rollNumber,
      });
      setUser(response.data.data);
      setError(null);
    } catch (err) {
      setError("User not found or an error occurred");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      findStudent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Student Search Dashboard
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              className={`flex-grow p-3 border ${
                isRollNumberValid ? "border-gray-300" : "border-red-500"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              type="text"
              placeholder="Enter Roll Number (e.g., BTECH/10XXX/YY)"
              value={rollNumber}
              onChange={(e) => {
                setRollNumber(e.target.value.toUpperCase());
                setIsRollNumberValid(true);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              onClick={findStudent}
            >
              Search
            </button>
          </div>
          {loading && (
            <p className="text-center text-blue-600 mt-4">Loading...</p>
          )}
          {error && (
            <p className="text-center text-red-500 mt-4">{error}</p>
          )}
        </div>

        {user && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <img
                src={user.image || "https://via.placeholder.com/150"}
                alt="Student"
                className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-md"
              />
              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                {capitalizeWords(user.fullName)}
              </h2>
              <p className="text-gray-600">{user.rollNumber}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-600">Basic Details</h3>
                <ul className="mt-2 space-y-2">
                  <li>
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    {user.email}
                  </li>
                  <li>
                    <span className="font-medium text-gray-700">Branch:</span>{" "}
                    {user.branch.toUpperCase()}
                  </li>
                  <li>
                    <span className="font-medium text-gray-700">Semester & Section:</span>{" "}
                    {user.semester} & {user.section}
                  </li>
                  <li>
                    <span className="font-medium text-gray-700">ABC ID:</span>{" "}
                    {user.abcId}
                  </li>
                  {isAdmin && (
                    <li>
                      <span className="font-medium text-gray-700">CGPA:</span>{" "}
                      {user.cgpa}
                    </li>
                  )}
                </ul>
              </div>

              {isAdmin && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-600">Academics</h3>
                  <table className="w-full mt-2">
                    <thead>
                      <tr>
                        <th className="text-left text-sm text-gray-600">Semester</th>
                        <th className="text-left text-sm text-gray-600">SGPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.academics[0]?.academicRecords?.map((ele, index) => (
                        <tr key={index}>
                          <td className="text-sm text-gray-700 py-1">{ele.semester}</td>
                          <td className="text-sm text-gray-700 py-1">{ele.gpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-600">Backlogs</h3>
                <table className="w-full mt-2">
                  <thead>
                    <tr>
                      <th className="text-left text-sm text-gray-600">Course Code</th>
                      <th className="text-left text-sm text-gray-600">Course Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.backlogs?.map((ele, index) => (
                      <tr key={index}>
                        <td className="text-sm text-gray-700 py-1">{ele?.subjectCode}</td>
                        <td className="text-sm text-gray-700 py-1">{ele?.subjectName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-600">Internships</h3>
              <table className="w-full mt-2">
                <thead>
                  <tr>
                    <th className="text-left text-sm text-gray-600">Company</th>
                    <th className="text-left text-sm text-gray-600">Role</th>
                    <th className="text-left text-sm text-gray-600">Start Date</th>
                    <th className="text-left text-sm text-gray-600">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.internShips?.map((ele, index) => (
                    <tr key={index}>
                      <td className="text-sm text-gray-700 py-1">{ele.company}</td>
                      <td className="text-sm text-gray-700 py-1">{ele.role}</td>
                      <td className="text-sm text-gray-700 py-1">
                        {ele?.startDate ? new Date(ele.startDate).toLocaleDateString() : ""}
                      </td>
                      <td className="text-sm text-gray-700 py-1">
                        {ele?.endDate ? new Date(ele.endDate).toLocaleDateString() : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-600">Placements</h3>
              <table className="w-full mt-2">
                <thead>
                  <tr>
                    <th className="text-left text-sm text-gray-600">Company</th>
                    <th className="text-left text-sm text-gray-600">Role</th>
                    <th className="text-left text-sm text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-sm text-gray-700 py-1">{user?.placementOne?.company}</td>
                    <td className="text-sm text-gray-700 py-1">{user?.placementOne?.role}</td>
                    <td className="text-sm text-gray-700 py-1">
                      {user?.placementOne?.date ? new Date(user?.placementOne?.date).toLocaleDateString() : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}