import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PeCoursesTable = () => {
  const [peCourses, setPeCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPeCourses = async () => {
      try {
        // const response = await axios.get('/api/v1/pe-courses/get-all');
        // setPeCourses(response.data.data); 
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPeCourses();
  }, []);

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Professional Elective Courses</h1>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Course Code</th>
              <th className="py-3 px-6 text-left">Course Name</th>
            </tr>
          </thead>
          <tbody>
            {peCourses.map((course) => (
              <tr key={course._id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6">{course.courseCode}</td>
                <td className="py-3 px-6">{course.courseName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PeCoursesTable;
