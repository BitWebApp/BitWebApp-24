import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AcceptStudents = () => {
    const [appliedStudents, setAppliedStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Fetch applied students
    useEffect(() => {
        const fetchAppliedStudents = async () => {
            try {
                const response = await axios.get('/api/v1/prof/getAppliedStudents');
                setAppliedStudents(response.data.message);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch students.');
            }
        };
        fetchAppliedStudents();
    }, []);

    // Handle student selection
    const handleSelectionChange = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    // Submit selected students
    const handleSubmit = async () => {
        setMessage('');
        setError('');
        try {
            const response = await axios.post('/api/v1/prof/selectSummerStudents', {
                selectedStudents,
            });
            console.log(response)
            setMessage(response.data.message);
            setSelectedStudents([]);
            setAppliedStudents(
                appliedStudents.filter((student) => !selectedStudents.includes(student._id))
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to select students.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-3xl font-bold text-center text-blue-700">Students are waiting !! Train them this summer.</h2>
                <p className="text-center text-gray-600 italic mb-6">"Your best effort can help BITIANS to land into big MNCs as a Software Engineer, start their techpreneur journey, or become a highly skilled CSE grad."</p>
                {/* Display success or error messages */}
                {message && <p className="text-green-600 font-semibold text-center mb-4">{message}</p>}
                {error && <p className="text-red-600 font-semibold text-center mb-4">{error}</p>}                <p className="text-center text-gray-600 italic mb-4">"Empowering the next generation of leaders!"</p>

                {appliedStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">Image</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Semester</th>
                                    <th className="px-4 py-2 border">Roll Number</th>
                                    <th className="px-4 py-2 border">Section</th>
                                    <th className="px-4 py-2 border">Branch</th>
                                    <th className="px-4 py-2 border">LinkedIn</th>
                                    <th className="px-4 py-2 border">Coding Profiles</th>
                                    <th className="px-4 py-2 border">Select</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appliedStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border text-center">
                                            <img
                                                src={student.image}
                                                alt={student.fullName}
                                                className="w-12 h-12 rounded-full mx-auto"
                                            />
                                        </td>
                                        <td className="px-4 py-2 border">{student.fullName.toUpperCase()}</td>
                                        <td className="px-4 py-2 border">{student.semester}</td>
                                        <td className="px-4 py-2 border">{student.rollNumber}</td>
                                        <td className="px-4 py-2 border">{student.section}</td>
                                        <td className="px-4 py-2 border">{student.branch}</td>
                                        <td className="px-4 py-2 border">
                                            <a
                                                href={student.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline"
                                            >
                                                LinkedIn
                                            </a>
                                        </td>
                                        <td className="px-4 py-2 border">
                                            <div className="flex flex-col space-y-1">
                                                {Object.entries(student.codingProfiles).map(([key, value]) => (
                                                    value && (
                                                        <a
                                                            key={key}
                                                            href={value}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 underline"
                                                        >
                                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 border text-center">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 text-blue-600"
                                                checked={selectedStudents.includes(student._id)}
                                                onChange={() => handleSelectionChange(student._id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center">No students have applied yet.</p>
                )}

                {appliedStudents.length > 0 && (
                    <button
                        onClick={handleSubmit}
                        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
                    >
                        Submit Selected Students
                    </button>
                )}

                <div className="mt-8 text-center">
                    <p className="text-lg font-semibold text-gray-700">“Your guidance can shape their future!”</p>
                    <p className="text-sm text-gray-500">“Believe in their potential, and they will soar!”</p>
                </div>
            </div>
        </div>
    );
};

export default AcceptStudents;