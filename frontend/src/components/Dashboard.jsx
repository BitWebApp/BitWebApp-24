import React, { useState } from "react";
import axios from "axios";
import { useUserRole } from "./admin/user-links";

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
              <p className="font-semibold text-gray-900 text-sm sm:text-lg">{user.fullName}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{user.rollNumber}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{user.email}</p>
            </div>
          </div>
         
            
          <li className="flex items-center text-sm sm:text-base font-semibold text-gray-800 py-1">
  <span className="font-bold text-gray-800">Branch:</span>
  <span className="  ml-6 text-gray-800 text-xs sm:text-sm">{user.branch}</span>
</li>

<li className="flex items-center text-sm sm:text-base font-semibold text-gray-700 py-1 mt-2">
  <span className="font-bold text-gray-700">Semester & Section:</span>
  <span className="  ml-6 text-gray-800 text-xs sm:text-sm"> {user.semester}  {user.section}</span>
</li>

              {isAdmin && (
               <li className="flex items-center text-sm sm:text-base font-semibold text-gray-700 py-1 mt-2">
               <span className="font-bold text-gray-700">CGPA:</span>
               <span className="  ml-6 text-gray-800 text-xs sm:text-sm"> {user.cgpa}</span>
             </li>
              )}
           

          {user.higherEd.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-blue-600">Higher Education:</p>
              <ul className="list-disc ml-6 text-gray-800 text-xs sm:text-sm">
                {user.higherEd.map((edu) => (
                  <li key={edu._id}>
                    {edu.degree} ({edu.fieldOfStudy}) at {edu.institution}
                    {isAdmin && (
                      <a
                        href={edu.docs[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        View Document
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user.placementOne?.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-blue-600">Placement Details:</p>
              <ul className="list-disc ml-6 text-gray-800 text-xs sm:text-sm">
                <div className="mb-4 bg-gray-100 p-3 rounded-md shadow-sm">
                  <li>
                    <strong>Company:</strong> {user.placementOne.company}
                  </li>
                  {isAdmin && (
                    <li>
                      <strong>CTC:</strong> {user.placementOne.ctc}
                    </li>
                  )}
                  {isAdmin && (
                    <a
                      href={user.placementOne.doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      View Document
                    </a>
                  )}
                </div>
              </ul>
            </div>
          )}

          {user.internShips?.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-blue-600">Internship Details:</p>
              <ul className="list-disc ml-6 text-gray-800 text-xs sm:text-sm">
                {user.internShips.map((internship) => (
                  <li key={internship._id}>
                    {internship.company} - {internship.role}
                    {isAdmin && (
                      <a
                        href={internship.doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        View Document
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user.exams?.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-blue-600">Exam Details:</p>
              <ul className="list-disc ml-6 text-gray-800 text-xs sm:text-sm">
                {user.exams.map((exam) => (
                  <li key={exam._id}>
                    {exam.examName} - {exam.score}
                    {isAdmin && (
                      <a
                        href={exam.docs[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        View Document
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            
            {isAdmin && user.backlogs.length > 0 ? (
              
              <div className="overflow-x-auto">
                <h3 className="text-lg font-bold mt-4 mb-2 text-blue-600">Backlogs</h3>
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sl No
                      </th>
                      <th className="px-3 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subject Code
                      </th>
                      <th className="px-3 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subject Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.backlogs.map((backlog, index) => (
                      <tr key={backlog._id} className="bg-white border-b hover:bg-gray-100">
                        <td className="px-3 py-2 border-b border-gray-200">{index + 1}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{backlog.subjectCode}</td>
                        <td className="px-3 py-2 border-b border-gray-200">{backlog.subjectName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
