import React, { useState } from 'react';
import axios from 'axios';

const AddProfessor = () => {
    const [formData, setFormData] = useState({
        idNumber: '',
        fullName: '',
        contact: '',
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post(
                '/api/v1/prof/addprof',
                formData
            );
            setMessage('Professor added successfully!');
            setFormData({ idNumber: '', fullName: '', contact: '' }); // Reset form
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add professor.');
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Add New Professor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">ID Number:</label>
                    <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Full Name:</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Contact:</label>
                    <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                    Add Professor
                </button>
            </form>

            {message && (
                <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>
            )}
            {error && (
                <p className="mt-4 text-center text-red-600 font-semibold">{error}</p>
            )}
        </div>
    );
};

export default AddProfessor;
