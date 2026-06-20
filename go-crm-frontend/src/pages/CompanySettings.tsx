import React, { useState } from 'react';

export default function CompanySettings() {
  // We will pull this from context/backend later
  const company = { name: 'GoCRM Default Workspace', employees: 1, code: 'GOCRM-XYZ-123' };
  
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(company.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    // Add real backend delete call here
    console.log("Company deleted!");
    setShowDeleteConfirm(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">General Information</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p className="font-medium text-gray-900">{company.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of Employees</p>
              <p className="font-medium text-gray-900">{company.employees} Active Rep(s)</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Company Join Code</p>
            <div className="flex items-center space-x-3">
              <code className="px-4 py-2 bg-gray-100 rounded-lg text-gray-800 font-mono text-sm border border-gray-200">
                {company.code}
              </code>
              <button 
                onClick={handleCopyCode}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Share this code with your Sales Reps so they can join your workspace during registration.</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-100 p-6">
        <h2 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">Deleting this company will permanently remove all associated leads, chat logs, and settings. This cannot be undone.</p>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Delete Company
          </button>
        ) : (
          <div className="p-4 bg-white border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-4">Are you absolutely sure you want to delete {company.name}?</p>
            <div className="flex space-x-3">
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Yes, Delete Everything
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}