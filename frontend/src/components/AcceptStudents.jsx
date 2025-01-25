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
                setAppliedStudents(response.data.data);
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
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
                <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Faculty Dashboard</h1>

                {/* Display success or error messages */}
                {message && <p className="text-green-600 font-semibold text-center mb-4">{message}</p>}
                {error && <p className="text-red-600 font-semibold text-center mb-4">{error}</p>}

                <h2 className="text-xl font-bold text-gray-700 mb-4">Applied Students</h2>
                {appliedStudents.length > 0 ? (
                    <div className="space-y-4">
                        {appliedStudents.map((student) => (
                            <div
                                key={student._id}
                                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:shadow-md"
                            >
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">{student.name}</p>
                                    <p className="text-sm text-gray-600">{student.email}</p>
                                </div>
                                <div>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-blue-600"
                                        checked={selectedStudents.includes(student._id)}
                                        onChange={() => handleSelectionChange(student._id)}
                                    />
                                </div>
                            </div>
                        ))}
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
            </div>
        </div>
    );
};

export default AcceptStudents;