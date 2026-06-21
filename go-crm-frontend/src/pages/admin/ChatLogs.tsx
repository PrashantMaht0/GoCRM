import React, { useState } from 'react';

// Mock data reflecting the database conversation_logs table
const MOCK_LOGS = [
  { id: 1, customer: 'Samantha Gil', text: 'I need some customisation as per my demand', status: 'Bot Handled', time: '10 May 2026 12:20 PM' },
  { id: 2, customer: 'Michael Johnson', text: 'Can I grab it from the portal?', status: 'Rep Handled', time: '12 May 2026 10:30 AM' },
  { id: 3, customer: 'Ethan Carter', text: 'Thank you for the quick setup!', status: 'Closed', time: '13 May 2026 04:20 PM' },
  { id: 4, customer: 'David Thompson', text: 'How can I show a message box?', status: 'Rep Handled', time: '15 May 2026 11:25 AM' },
  { id: 5, customer: 'Olivia White', text: 'Keeping an eye on these warning signs...', status: 'Bot Handled', time: '16 May 2026 02:20 PM' },
];

export default function ChatLogs() {
  const [activeFilter, setActiveFilter] = useState('All Conversations');

  return (
    <div className="flex h-full w-full p-6 space-x-6">
      
      {/* Left Sidebar - History Filters */}
      <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-crm-darkest">History</h2>
        </div>
        <div className="p-4 space-y-2 flex-1">
          {[
            { name: 'All Conversations', count: '3.2K', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
            { name: 'Bot Handled', count: '2.8K', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            { name: 'Rep Handled', count: '400', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { name: 'Archived', count: '150', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' }
          ].map(filter => (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.name ? 'bg-crm-light text-crm-darkest' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={filter.icon}></path></svg>
                <span>{filter.name}</span>
              </div>
              <span className="text-xs text-gray-400">{filter.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Table Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-crm-darkest">Conversation Logs</h2>
          <button className="px-4 py-2 bg-crm-darkest text-white rounded-lg text-sm font-medium hover:bg-crm-dark transition-colors">
            + Export Logs
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex space-x-3">
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Import
            </button>
          </div>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search history..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-crm-accent w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Last Message</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date / Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-crm-accent/30 flex items-center justify-center text-crm-darkest font-bold text-xs">
                        {log.customer.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{log.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{log.text}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      log.status === 'Bot Handled' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      log.status === 'Rep Handled' ? 'bg-green-50 text-green-700 border border-green-100' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}