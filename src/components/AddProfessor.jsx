import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChalkboardTeacher, FaBook } from 'react-icons/fa';
import Swal from 'sweetalert2';

const quotes = [
    "Education is the most powerful weapon which you can use to change the world. – Nelson Mandela",
    "The beautiful thing about learning is that no one can take it away from you. – B.B. King",
    "Teaching is the greatest act of optimism. – Colleen Wilcox",
    "The art of teaching is the art of assisting discovery. – Mark Van Doren",
    "A teacher affects eternity; he can never tell where his influence stops. – Henry Adams",
];

const AddProfessor = () => {
    const [formData, setFormData] = useState({
        idNumber: '',
        fullName: '',
        contact: '',
        email: ''
    });

    const [quote, setQuote] = useState('');

    // Set a random quote on component mount
    useEffect(() => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/v1/prof/addprof', formData);
            Swal.fire({
                title: 'Success!',
                text: 'Professor added successfully! 🎉',
                icon: 'success',
                confirmButtonText: 'Cool',
            });
            setFormData({ idNumber: '', fullName: '', contact: '', email: '' }); // Reset form
        } catch (err) {
            Swal.fire({
                title: 'Oops!',
                text: err.response?.data?.message || 'Failed to add professor. 😢',
                icon: 'error',
                confirmButtonText: 'Try Again',
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    <FaChalkboardTeacher className="inline-block mr-2" />
                    Add New Professor
                </h2>

                {/* Quote Section */}
                <blockquote className="text-center italic text-gray-600 mb-4">
                    "{quote}"
                </blockquote>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ID Number Field */}
                    <div>
                        <label htmlFor="idNumber" className="block text-gray-700 font-semibold mb-2">
                            ID Number:
                        </label>
                        <input
                            type="text"
                            id="idNumber"
                            name="idNumber"
                            value={formData.idNumber}
                            onChange={handleChange}
                            required
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </div>

                    {/* Full Name Field */}
                    <div>
                        <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-2">
                            Full Name:
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </div>

                    {/* Contact Field */}
                    <div>
                        <label htmlFor="contact" className="block text-gray-700 font-semibold mb-2">
                            Contact:
                        </label>
                        <input
                            type="text"
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                    >
                        <FaBook className="inline-block mr-2" />
                        Add Professor
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProfessor;