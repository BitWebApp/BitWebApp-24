import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

const api = axios.create({
  baseURL: '/api/v1/prof',
});

export default function FacultyAutoLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Invalid auto-login link. No token provided.');
          setLoading(false);
          return;
        }

        console.log('Token found, attempting auto-login...');

        // Send token to backend for auto-login
        const response = await api.post(
          '/auto-login',
          { token },
          { withCredentials: true,
            timeout: 10000 }
        );

        console.log('Auto-login response:', response);

        if (response.status === 200 && response.data.data.accessToken) {
          // Store tokens and user data
          localStorage.setItem('user', JSON.stringify(response.data.data.professor));
          localStorage.setItem('accessToken', response.data.data.accessToken);
          localStorage.setItem('refreshToken', response.data.data.refreshToken);

          console.log('Tokens stored, redirecting to /faculty-db');
          
          // Redirect to faculty dashboard
          setTimeout(() => {
            navigate('/faculty-db', { replace: true });
          }, 500);
        } else {
          setError('Auto-login failed. Please try logging in manually.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Auto-login error:', err);
        setError(
          err.response?.data?.message ||
          'Auto-login failed. The link may have expired. Please try logging in manually.'
        );
        setLoading(false);
      }
    };

    // Set a timeout to show error if auto-login takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Auto-login is taking too long. Please try logging in manually.');
        setLoading(false);
      }
    }, 15000);

    autoLogin();

    return () => clearTimeout(timeoutId);
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <ClipLoader color="#3B82F6" size={50} />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Logging you in...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we verify your credentials
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex justify-center mb-4">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
            Auto-Login Error
          </h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/faculty-login'}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }

  return null;
}
