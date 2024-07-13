import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [rollNumber, setRollNumber] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRollNumberValid, setIsRollNumberValid] = useState(true);

  const validateRollNumber = (rollNumber) => {
    const rollNumberPattern = /^BTECH\/10\d{3}\/\d{2}$/;
    return rollNumberPattern.test(rollNumber);
  };

  const findStudent = async () => {
    if (!rollNumber) {
      setError('Please enter a roll number');
      return;
    }

    if (!validateRollNumber(rollNumber)) {
      setIsRollNumberValid(false);
      setError('Invalid roll number format. It should be BTECH/10XXX/YY');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/v1/users/getbyroll", {
        rollNumber
      });
      setUser(response.data.data);
      setError(null);
    } catch (err) {
      setError('User not found or an error occurred');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      findStudent();
    }
  };

  return (
    <div className="p-6 w-full mx-auto">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:flex-1">
          <input
            className={`w-full text-black py-2 px-4 bg-gray-100 border ${
              isRollNumberValid ? 'border-gray-300' : 'border-red-500'
            } rounded-md outline-none focus:ring-2 focus:ring-blue-600`}
            type="text"
            placeholder="Enter Roll Number (e.g., BTECH/10XXX/YY)"
            onChange={(e) => {
              setRollNumber(e.target.value.toUpperCase());
              setIsRollNumberValid(true);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
          />
          {!isRollNumberValid && (
            <p className="text-red-500 text-xs mt-1">
              Invalid roll number format. It should be BTECH/10XXX/YY
            </p>
          )}
        </div>
        <button
          className="bg-blue-600 text-white font-bold rounded-md px-6 py-2 hover:bg-blue-700 transition"
          onClick={findStudent}
        >
          Find
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {user && (
        <div className="border p-6 rounded-lg shadow-lg bg-white mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Student Profile</h2>
          <div className="flex flex-col md:flex-row items-center mb-6">
            <img
              src={user.image || 'https://via.placeholder.com/150'}
              alt="Student"
              className="w-32 h-32 rounded-full mr-4 mb-4 md:mb-0"
            />
            <div className="text-center md:text-left">
              <p className="text-xl font-semibold">{user.fullName}</p>
              <p className="text-gray-600">{user.rollNumber}</p>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-600">{user.mobileNumber}</p>
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <img
              src={user.idCard}
              alt="ID Card"
              className="w-64 h-auto border border-gray-300 rounded-md"
            />
          </div>
          <p className="mb-2"><strong>Branch:</strong> {user.branch}</p>
          <p className="mb-2"><strong>Section:</strong> {user.section}</p>
          <p className="mb-2"><strong>Semester:</strong> {user.semester}</p>
          <p className="mb-2"><strong>CGPA:</strong> {user.cgpa}</p>
          <div>
            <h3 className="text-xl font-bold mt-6 mb-2 text-blue-600">Higher Education</h3>
            {user.higherEd.length > 0 ? (
              user.higherEd.map((edu) => (
                <div key={edu._id} className="mb-4 bg-gray-100 p-4 rounded-md shadow-sm">
                  <p><strong>Institution:</strong> {edu.institution}</p>
                  <p><strong>Degree:</strong> {edu.degree}</p>
                  <p><strong>Field of Study:</strong> {edu.fieldOfStudy}</p>
                  <a href={edu.docs[0]} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Document</a>
                </div>
              ))
            ) : (
              <p>No higher education details available.</p>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold mt-6 mb-2 text-blue-600">Internships</h3>
            {user.internShips.length > 0 ? (
              user.internShips.map((intern) => (
                <div key={intern._id} className="mb-4 bg-gray-100 p-4 rounded-md shadow-sm">
                  <p><strong>Company:</strong> {intern.company}</p>
                  <p><strong>Role:</strong> {intern.role}</p>
                  <a href={intern.doc} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Document</a>
                </div>
              ))
            ) : (
              <p>No internship details available.</p>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold mt-6 mb-2 text-blue-600">Exams</h3>
            {user.exams.length > 0 ? (
              user.exams.map((exam) => (
                <div key={exam._id} className="mb-4 bg-gray-100 p-4 rounded-md shadow-sm">
                  <p><strong>Exam Name:</strong> {exam.examName}</p>
                  <p><strong>Score:</strong> {exam.score}</p>
                  <a href={exam.docs[0]} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Document</a>
                </div>
              ))
            ) : (
              <p>No exam details available.</p>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold mt-6 mb-2 text-blue-600">Placements</h3>
            {user.placementOne ? (
              <div className="mb-4 bg-gray-100 p-4 rounded-md shadow-sm">
                <p><strong>Company:</strong> {user.placementOne.company}</p>
                <p><strong>CTC:</strong> {user.placementOne.ctc}</p>
                <a href={user.placementOne.doc} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Document</a>
              </div>
            ) : (
              <p>No placement details available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
