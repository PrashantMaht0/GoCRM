import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function UserSettings() {
  const { user, logout } = useAuth();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleLeaveCompany = () => {
    // API call to set user.company_id to null
    console.log("Leaving company...");
    logout(); // Log them out so they hit the Join Company page next time
  };

  const handleDeleteAccount = () => {
    // API call to DELETE /users/{id}
    console.log("Deleting account...");
    logout();
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-crm-darkest mb-8">Personal Settings</h1>

      {/* Profile Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-crm-darkest">Profile Information</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-crm-accent flex items-center justify-center text-crm-darkest text-2xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium text-crm-darkest">{user?.fullName || 'Sales Representative'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
             <p className="text-sm text-gray-500">Role</p>
             <p className="font-medium text-crm-darkest capitalize">{user?.role.replace('_', ' ').toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Workspace Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-lg font-medium text-crm-darkest mb-2">Workspace Actions</h2>
          <p className="text-sm text-gray-500 mb-4">Leaving the workspace will revoke your access to all leads, chats, and deals.</p>
          
          {!showLeaveConfirm ? (
             <button onClick={() => setShowLeaveConfirm(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
               Leave Current Workspace
             </button>
          ) : (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-800 mb-3">Are you sure you want to disconnect from this company?</p>
              <div className="flex space-x-3">
                <button onClick={handleLeaveCompany} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Yes, Leave Workspace</button>
                <button onClick={() => setShowLeaveConfirm(false)} className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-100 p-6">
        <h2 className="text-lg font-medium text-red-800 mb-2">Delete Account</h2>
        <p className="text-sm text-red-600 mb-4">Permanently delete your account and remove all personal data from the system.</p>
        <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          Delete My Account
        </button>
      </div>
    </div>
  );
}