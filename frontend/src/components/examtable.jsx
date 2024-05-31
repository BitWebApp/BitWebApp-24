import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ExamTable() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get("/api/v1/exam/all");
      console.log(response.data.data);
      setExams(response.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-center text-3xl font-bold mb-8">EXAMINATION DETAILS</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-black">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Student</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Roll No</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Exam Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Score</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Supporting-Doc</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200"> 
        {exams.map((exam, index) => (
  <tr key={exam._id} className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.name.fullName}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.name.rollNumber}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.examName}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.score}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {exam.docs.map((doc, index) => (
        <div key={index}>
          <a href={doc} target="_blank" rel="noopener noreferrer">Document {index + 1}</a>
        </div>
      ))}
    </td>
  </tr>
))}


        </tbody>
      </table>
    </div>
  );
}
