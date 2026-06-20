import React, { useState } from 'react';

export default function CreateCompany() {
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/v1/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: companyName })
      });

      if (response.ok) {
        setStatus('success');
        setCompanyName('');
        // Reload so the layout detects the user now has a company
        setTimeout(() => window.location.href = '/admin/dashboard', 1500);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Company</h1>
        <p className="text-sm text-gray-500">
          Register a new workspace. Once created, you will be able to configure its specific WhatsApp Bot integration and generate invite codes for your Sales Reps.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder="e.g., Acme Corporation"
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="h-6">
              {status === 'success' && (
                <span className="text-sm text-green-600 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Workspace created successfully!
                </span>
              )}
              {status === 'error' && (
                <span className="text-sm text-red-600 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Failed to create workspace. Check your connection or login again.
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !companyName.trim()}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all shadow-sm ${
                isSubmitting || !companyName.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 hover:bg-gray-800 active:transform active:scale-95'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}