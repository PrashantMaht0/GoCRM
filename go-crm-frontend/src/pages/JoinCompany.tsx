import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function JoinCompany() {
  const { user, logout } = useAuth();
  const [companyCode, setCompanyCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyCode.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/v1/companies/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companyCode })
      });

      if (response.ok) {
        window.location.reload(); 
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid company code. Please check with your administrator.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join Your Workspace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Logged in as <span className="font-medium text-gray-900">{user?.email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleJoin}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Company Invite Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  placeholder="e.g., GOCRM-XYZ-123"
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'
                }`}
              >
                {isSubmitting ? 'Verifying...' : 'Join Workspace'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <button
              onClick={logout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign out and try another account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}