import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

// Define the interface based on your backend SupportTicket entity
interface SupportTicket {
  id: number;
  leadId: number;
  assignedUserId: number | null;
  ticketStatus: string;
  issueDescription: string;
  createdAt: string;
}

export default function SupportTicketDashboard() {
  const [activeFilter, setActiveFilter] = useState('All Tickets');
  const { activeCompanyId } = useOutletContext<{ activeCompanyId: string }>();  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        // Note: We will add this generic /api/v1/tickets GET endpoint to the backend next!
        const response = await fetch(`http://localhost:8080/api/v1/tickets?companyId=${activeCompanyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        }
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [activeCompanyId]);

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'Open') return ticket.ticketStatus === 'OPEN';
    if (activeFilter === 'Closed') return ticket.ticketStatus === 'CLOSED';
    return true; 
  });

  return (
    <div className="flex h-full w-full p-6 space-x-6 bg-gray-50/50">
      
      {/* Left Sidebar - Filters */}
      <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-crm-darkest">Support Hub</h2>
        </div>
        <div className="p-4 space-y-2 flex-1">
          {[
            { name: 'All Tickets', count: tickets.length, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { name: 'Open', count: tickets.filter(t => t.ticketStatus === 'OPEN').length, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
            { name: 'Closed', count: tickets.filter(t => t.ticketStatus === 'CLOSED').length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map(filter => (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.name ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'
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
          <h2 className="text-xl font-bold text-crm-darkest">Ticket Queue</h2>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
             <div className="p-8 text-center text-gray-500">Loading support tickets...</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket ID</th>
                  <th className="px-6 py-4 font-medium">Issue Description</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date Raised</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#TKT-{ticket.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium truncate max-w-md" title={ticket.issueDescription}>
                        {ticket.issueDescription}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        ticket.ticketStatus === 'OPEN' 
                          ? 'bg-red-50 text-red-700 border border-red-100' 
                          : 'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {ticket.ticketStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No tickets found for this filter.
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