import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface Lead {
  id: number;
  customerName: string;
  whatsappId: string;
  pipelineStatus: string;
  botMode: boolean;
  contractValue: number | null;
  aiSummary?: string;
}

interface ConversationLog {
  id: number;
  direction: 'INBOUND' | 'OUTBOUND';
  messageBody: string;
  createdAt: string;
}

interface SupportTicket {
  id: number;
  leadId: number;
  ticketStatus: string;
  issueDescription: string;
  createdAt: string;
}

export default function Chat() {
  const { user } = useAuth();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ConversationLog[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [activeTickets, setActiveTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 🚀 Fetch Leads and Tickets simultaneously
        const [leadsRes, ticketsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/v1/leads`, { headers }),
          fetch(`http://localhost:8080/api/v1/tickets/active`, { headers })
        ]);

        if (leadsRes.ok && ticketsRes.ok) {
          const leadsData = await leadsRes.json();
          const ticketsData = await ticketsRes.json();

          setActiveTickets(ticketsData);

          // Create a Set of lead IDs that have active tickets for O(1) lookup
          const activeTicketLeadIds = new Set(ticketsData.map((t: SupportTicket) => t.leadId));

          // 🚀 THE FILTER: Apply your exact filtration logic
          const inboxLeads = leadsData.filter((lead: Lead) => {
            if (lead.botMode) return false; // Ignore AI-handled leads
            if (activeTicketLeadIds.has(lead.id)) return true; // ALWAYS show if they have an active ticket
            return lead.pipelineStatus !== 'WON' && lead.pipelineStatus !== 'LOST'; // Hide closed leads
          });

          setLeads(inboxLeads);
          if (inboxLeads.length > 0) setActiveLead(inboxLeads[0]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoadingLeads(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!activeLead) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/chats/${activeLead.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };
    
    fetchMessages();

    const socket = new SockJS('http://localhost:8080/ws-crm');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/chat/${activeLead.id}`, (message) => {
          const newMsg: ConversationLog = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, newMsg]);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [activeLead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeLead) return;

    const tempMessage = newMessage;
    setNewMessage(''); 

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`http://localhost:8080/api/v1/chats/${activeLead.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: tempMessage })
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleCloseTicket = async (ticketId: number, leadId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/v1/tickets/${ticketId}/close`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        setActiveTickets(prev => prev.filter(t => t.id !== ticketId));
        
        // Find the lead to check its pipeline status
        const leadToCheck = leads.find(l => l.id === leadId);
        
        // If the lead is WON/LOST and the ticket closes, remove them from the inbox
        if (leadToCheck && (leadToCheck.pipelineStatus === 'WON' || leadToCheck.pipelineStatus === 'LOST')) {
           setLeads(prev => prev.filter(l => l.id !== leadId));
           if (activeLead?.id === leadId) {
              setActiveLead(null);
              setMessages([]);
           }
        }
      }
    } catch (error) {
      console.error("Failed to close ticket", error);
    }
  };

  return (
    <div className="flex h-full w-full bg-white">
      
      {/* 1. Contacts List (Left Pane) */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-crm-darkest">Inbox</h2>
        </div>
        
        <div className="flex flex-col p-2 border-b border-gray-100 bg-red-50/30">
          <h3 className="text-xs font-bold text-red-600 mb-2 px-2 uppercase tracking-wider">Needs Attention</h3>
          
          {activeTickets.length === 0 ? (
             <div className="text-xs text-gray-500 px-2 pb-2">No active support tickets.</div>
          ) : (
            activeTickets.map(ticket => {
              const matchingLead = leads.find(l => l.id === ticket.leadId);
              
              return (
                <div key={ticket.id} className="bg-white p-3 rounded-lg shadow-sm border border-red-100 mb-2 text-sm flex justify-between items-center">
                  <div className="overflow-hidden pr-2">
                    <span className="font-semibold text-gray-800 truncate block">
                      {matchingLead?.customerName || `Lead #${ticket.leadId}`}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 truncate" title={ticket.issueDescription}>
                      {ticket.issueDescription}
                    </p>
                  </div>
                  <button 
                     onClick={() => handleCloseTicket(ticket.id, ticket.leadId)}
                     className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition whitespace-nowrap"
                  >
                    Close
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingLeads ? (
            <div className="p-4 text-center text-sm text-gray-400">Loading conversations...</div>
          ) : leads.length === 0 ? (
             <div className="p-4 text-center text-sm text-gray-400">No human handovers yet.</div>
          ) : (
            leads.map(lead => (
              <div 
                key={lead.id} 
                onClick={() => setActiveLead(lead)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${activeLead?.id === lead.id ? 'bg-crm-light/30 border-l-4 border-crm-accent' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm ${activeLead?.id === lead.id ? 'font-semibold' : 'font-medium'} text-crm-darkest truncate`}>
                    {lead.customerName || lead.whatsappId}
                  </h3>
                  <span className="text-xs text-gray-400">Active</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{lead.pipelineStatus.replace('_', ' ')}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Active Chat (Middle Pane) */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {activeLead ? (
          <>
            <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-semibold text-crm-darkest">{activeLead.customerName || 'Unknown Customer'}</h2>
              <span className="text-xs font-mono text-gray-400">{activeLead.whatsappId}</span>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start max-w-lg ${msg.direction === 'OUTBOUND' ? 'self-end justify-end' : 'self-start'}`}>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.direction === 'OUTBOUND' 
                      ? 'bg-indigo-50 border border-indigo-100 rounded-tr-none' 
                      : 'bg-white border border-gray-100 rounded-tl-none'
                  }`}>
                    <p className={`text-sm ${msg.direction === 'OUTBOUND' ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {msg.messageBody}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex flex-col space-y-3">
              <form onSubmit={handleSendMessage} className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                <input 
                  type="text" 
                  placeholder="Type your message" 
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="p-2 ml-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <svg className="w-4 h-4 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            </div>
            
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>

      {/* 3. Details (Right Pane) */}
      {activeLead && (
        <div className="w-80 border-l border-gray-100 bg-white overflow-y-auto hidden xl:block">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-crm-darkest mb-6">Lead Details</h3>
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {activeLead.customerName ? activeLead.customerName.charAt(0).toUpperCase() : '#'}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-crm-darkest truncate w-40">{activeLead.customerName || 'Unknown'}</h4>
                <p className="text-xs text-gray-500">WhatsApp Lead</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="font-medium text-crm-darkest">{activeLead.whatsappId}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Value</span><span className="font-medium text-crm-darkest">${activeLead.contractValue || '0.00'}</span></div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-semibold text-crm-darkest mb-4">Pipeline Status</h4>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
                    {activeLead.pipelineStatus.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">AI Bot</span>
                  <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium border border-red-200">
                    Disengaged
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <h4 className="text-sm font-semibold text-indigo-900">AI Context Summary</h4>
                </div>
                {activeLead.aiSummary ? (
                  <p className="text-xs text-indigo-800 whitespace-pre-line leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-50">
                    {activeLead.aiSummary}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-lg border border-gray-100">
                    No previous context available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}