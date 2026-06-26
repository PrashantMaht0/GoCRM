import React, { useState, useEffect } from 'react';

// Define the interface based on your backend Lead entity
interface Lead {
  id: number;
  customerName: string | null;
  whatsappId: string;
  pipelineStatus: string;
  botMode: boolean;
  createdAt: string;
}

export default function ChatLogs() {
  const [activeFilter, setActiveFilter] = useState('All Conversations');
  const [logs, setLogs] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from your Spring Boot Backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/leads`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch conversation logs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logic based on the sidebar selection
  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'Bot Handled') return log.botMode === true;
    if (activeFilter === 'Rep Handled') return log.botMode === false;
    return true; 
  });

  return (
    <div className="flex h-full w-full p-6 space-x-6">
      
      {/* Left Sidebar - History Filters */}
      <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-crm-darkest">History</h2>
        </div>
        <div className="p-4 space-y-2 flex-1">
          {[
            { name: 'All Conversations', count: logs.length, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
            { name: 'Bot Handled', count: logs.filter(l => l.botMode).length, icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            { name: 'Rep Handled', count: logs.filter(l => !l.botMode).length, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
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
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
             <div className="p-8 text-center text-gray-500">Loading conversation data...</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact ID</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-crm-accent/30 flex items-center justify-center text-crm-darkest font-bold text-xs">
                          {log.customerName ? log.customerName.charAt(0).toUpperCase() : '#'}
                        </div>
                        <span className="font-medium text-gray-900">
                          {log.customerName || 'Unknown User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{log.whatsappId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        log.botMode 
                          ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                          : 'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {log.botMode ? 'Bot Handled' : 'Rep Handled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No conversations found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}