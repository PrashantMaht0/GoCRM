import React, { useState, useEffect } from 'react';

interface Lead {
  id: number;
  customerName: string | null;
  whatsappId: string;
  pipelineStatus: string;
  botMode: boolean;
  createdAt: string;
  aiSummary?: string; 
}

export default function ChatLogs() {
  const [activeFilter, setActiveFilter] = useState('All Conversations');
  
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null); 
  
  const [logs, setLogs] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'Bot Handled') return log.botMode === true;
    if (activeFilter === 'Rep Handled') return log.botMode === false;
    return true; 
  });

  return (
    <div className="flex h-full w-full p-6 space-x-6">

      {/* Main Content - Table Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-crm-darkest">Conversation Logs</h2>
        </div>

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
                  <th className="px-6 py-4 font-medium text-right">Details</th> 
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      onClick={() => setExpandedRowId(expandedRowId === log.id ? null : log.id)}
                    >
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
                      <td className="px-6 py-4 text-right text-gray-400 group-hover:text-indigo-600 transition-colors">
                         <svg className={`w-5 h-5 inline-block transform transition-transform ${expandedRowId === log.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </td>
                    </tr>
                    
                    {expandedRowId === log.id && (
                      <tr className="bg-indigo-50/30 border-b-2 border-indigo-100">
                        <td colSpan={5} className="px-8 py-6"> 
                          <div className="flex items-start space-x-4">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-indigo-900 mb-1">AI Conversation Summary</h4>
                              {log.aiSummary ? (
                                <p className="text-sm text-indigo-800 whitespace-pre-line leading-relaxed">
                                  {log.aiSummary}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No summary generated for this lead yet.</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}