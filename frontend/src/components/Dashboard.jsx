import React, { useState } from "react";
import axios from "axios";
import NavBar from "./NavBar"
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
      console.log(user)
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
    <>
    <NavBar />
    <div className="p-4 sm:p-6 w-full max-w-3xl bg-gray-100 h-full mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-semibold text-blue-700 mb-4">Search Student</h1>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full mb-4">
        <input
          className={`w-full text-sm py-2 px-3 bg-gray-200 border ${
            isRollNumberValid ? "border-gray-300" : "border-red-500"
          } rounded-md focus:ring-2 focus:ring-blue-600`}
          type="text"
          placeholder="Roll Number (e.g., BTECH/10XXX/YY)"
          onChange={(e) => {
            setRollNumber(e.target.value.toUpperCase());
            setIsRollNumberValid(true);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-blue-600 text-white text-sm font-semibold rounded-md px-4 py-2 sm:px-6 sm:py-3 hover:bg-blue-700 transition"
          onClick={findStudent}
        >
          Find
        </button>
      </div>

      {loading && <p className="text-center text-blue-600 text-sm">Loading...</p>}
      {error && <p className="text-center text-red-500 text-sm">{error}</p>}

      {user && (
        <div className="border p-4 rounded-lg bg-white shadow-md w-full">
          <h2 className="text-lg font-semibold mb-4 text-center text-blue-600">
            Student Profile
          </h2>
          <div className="flex items-center gap-4 sm:gap-6 mb-4">
            <img
              src={user.image || "https://via.placeholder.com/50"}
              alt="Student"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border"
            />
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-lg">{capitalizeWords(user.fullName)}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{user.rollNumber}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{user.email}</p>
            </div>
          </div>
            
          <li className="flex items-center text-sm sm:text-base font-semibold text-gray-800">
  <span className="font-bold text-gray-800">Branch:</span>
  <span className="  ml-6 text-gray-800 text-xs sm:text-sm">{user.branch.toUpperCase()}</span>
</li>

<li className="flex items-center text-sm sm:text-base font-semibold text-gray-700">
  <span className="font-bold text-gray-700">Semester & Section:</span>
  <span className="  ml-6 text-gray-800 text-xs sm:text-sm"> {user.semester} & {user.section}</span>
</li>

            <li className="flex items-center text-sm sm:text-base font-semibold text-gray-700">
              <span className="font-bold text-gray-700">ABC ID:</span>
              <span className="  ml-6 text-gray-800 text-xs sm:text-sm"> {user.abcId}</span>
            </li>

              {isAdmin && (
               <li className="flex items-center text-sm sm:text-base font-semibold text-gray-700 py-1 mt-2">
               <span className="font-bold text-gray-700">CGPA:</span>
               <span className="  ml-6 text-gray-800 text-xs sm:text-sm"> {user.cgpa}</span>
             </li>
              )}
           
           <div className="mt-4">
            <p className="font-semibold text-blue-600">Academics</p>
            <table className="w-full border-2 border-black border-collapse">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">Semester</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">SGPA</th>
                </tr>
              </thead>
              {user.academics[0]?.academicRecords?.map((ele, index) => (
                <tr className="text-center" key={index}>
                  <td className="border border-black">{ele.semester}</td>
                  <td className="border border-black">{ele.gpa}</td>
                </tr>
              ))}
            </table>
          </div>
          
          <div className="mt-4">
            <p className="font-semibold text-blue-600">Backlogs</p>
            <table className="w-full border-2 border-black border-collapse">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">Course Code</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">Course Name</th>
                </tr>
              </thead>
              {user.backlogs?.map((ele, index) => (
                <tr className="text-center" key={index}>
                  <td className="border border-black">{ele?.subjectCode}</td>
                  <td className="border border-black">{ele?.subjectName}</td>
                </tr>
              ))}
            </table>
          </div>

          <div className="mt-4">
            <p className="font-semibold text-blue-600">Internships</p>
            <table className="w-full border-2 border-black border-collapse">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">Company</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">Role</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">Start Date</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">End Date</th>
                </tr>
              </thead>
              {user.internShips?.map((ele, index) => (
                <tr className="text-center" key={index}>
                  <td className="border border-black">{ele.company}</td>
                  <td className="border border-black">{ele.role}</td>
                  <td className="border border-black">{ele?.startDate ? new Date(ele.startDate).toLocaleDateString(): ''}</td>
                  <td className="border border-black">{ele?.endDate ? new Date(ele.endDate).toLocaleDateString(): ''}</td>
                </tr>
              ))}
            </table>
          </div>

          <div className="mt-4">
            <p className="font-semibold text-blue-600">Placements</p>
            <table className="w-full border-2 border-black border-collapse">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">Company</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">Role</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider border border-black">Date</th>
                </tr>
              </thead>
                <tr className="text-center">
                  <td className="border border-black">{user?.placementOne?.company}</td>
                  <td className="border border-black">{user?.placementOne?.role}</td>
                  <td className="border border-black">{user?.placementOne?.date ? new Date(user?.placementOne?.date).toLocaleDateString() : ''}</td>
                </tr>
            </table>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
