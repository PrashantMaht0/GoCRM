import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function SalesRepPortal() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sales Rep Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between">
        <div>
          <div className="p-4 border-b border-gray-100">
            <h1 className="font-bold text-xl text-gray-900 tracking-tight">GoCRM</h1>
            <p className="text-xs text-green-600 font-medium mt-1">● Online - Receiving Leads</p>
          </div>
          
          <nav className="p-4 space-y-1">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium transition-colors">
              <span>Inbox</span>
              <span className="bg-blue-200 text-blue-800 py-0.5 px-2 rounded-full text-xs">2</span>
            </button>
            <button className="w-full flex items-center text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              Closed Chats
            </button>
          </nav>
        </div>

        {/* User Profile Area */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500">Sales Representative</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full text-center py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Chat/Inbox Area */}
      <main className="flex-1 flex flex-col">
        {/* Placeholder for the actual WebSockets chat interface */}
        <div className="flex-1 flex items-center justify-center bg-gray-50/50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900">Your Inbox is Empty</h2>
            <p className="text-sm text-gray-500 mt-1">Waiting for the AI bot to route new leads to you.</p>
          </div>
        </div>
      </main>
    </div>
  );
}