import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 

const ForgotPassword = ({ }) => {
    const [email, setEmail] = useState('');
    const [previousPassword, setPreviousPassword] = useState('');
    const [otp, setOtp] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Previous Password:', previousPassword);
        console.log('OTP:', otp);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-96">
                <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-6">
                    Forgot Password
                </h2>
                
                <div className="mb-4">
                    <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-2">Registered Email ID:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="previousPassword" className="block text-lg font-semibold text-gray-700 mb-2">Previous Password:</label>
                    <input
                        type="password"
                        id="previousPassword"
                        value={previousPassword}
                        onChange={(e) => setPreviousPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="otp" className="block text-lg font-semibold text-gray-700 mb-2">OTP:</label>
                    <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-200">
                    Submit
                </button>

                <Link to="/log"> 
                    <button
                        type="button"
                        className="w-full mt-4 bg-gray-200 text-gray-800 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-200"
                    >
                        Back
                    </button>
                </Link>
            </form>
        </div>
    );
};

export default ForgotPassword;
