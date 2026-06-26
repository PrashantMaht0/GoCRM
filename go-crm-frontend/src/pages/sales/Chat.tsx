import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// 1. Define our TypeScript interfaces based on your Spring Boot Entities
interface Lead {
  id: number;
  customerName: string;
  whatsappId: string;
  pipelineStatus: string;
  botMode: boolean;
  contractValue: number | null;
}

interface ConversationLog {
  id: number;
  direction: 'INBOUND' | 'OUTBOUND';
  messageBody: string;
  createdAt: string;
}

export default function Chat() {
  const { user } = useAuth();
  
  // 2. State Management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ConversationLog[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  // 3. Fetch Leads when the component loads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        // We will build this backend endpoint next!
        const response = await fetch(`http://localhost:8080/api/v1/leads`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Filter to only show leads where the human has taken over (botMode = false)
          const humanLeads = data.filter((lead: Lead) => !lead.botMode);
          setLeads(humanLeads);
          if (humanLeads.length > 0) setActiveLead(humanLeads[0]);
        }
      } catch (error) {
        console.error("Failed to fetch leads", error);
      } finally {
        setIsLoadingLeads(false);
      }
    };
    fetchLeads();
  }, []);

// 4. Fetch Messages and Establish WebSocket Connection
  useEffect(() => {
    if (!activeLead) return;

    // A. Fetch the historical messages via standard HTTP
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

    // B. Setup the WebSocket for live updates
    const socket = new SockJS('http://localhost:8080/ws-crm');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket for Lead:', activeLead.id);
        
        stompClient.subscribe(`/topic/chat/${activeLead.id}`, (message) => {
          const newMsg: ConversationLog = JSON.parse(message.body);
          
          setMessages((prevMessages) => [...prevMessages, newMsg]);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    stompClient.activate();

    return () => {
      console.log('Disconnecting WebSocket for Lead:', activeLead.id);
      stompClient.deactivate();
    };
    
  }, [activeLead]);

  // 5. Handle Sending a Manual Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeLead) return;

    const tempMessage = newMessage;
    setNewMessage(''); // Clear input instantly for snappy UI

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
      // The polling interval will pick up the new message shortly, 
      // or we could manually append it to the `messages` array here for instant feedback.
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="flex h-full w-full bg-white">
      
      {/* 1. Contacts List (Left Pane) */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-crm-darkest">Inbox</h2>
        </div>
        <div className="flex p-2 space-x-1 border-b border-gray-100 bg-gray-50">
          <button className="flex-1 py-1.5 bg-white shadow-sm rounded-md text-sm font-medium text-crm-darkest">Needs Attention</button>
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
                <p className="text-xs text-gray-500 truncate">{lead.pipelineStatus}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Active Chat (Middle Pane) */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {activeLead ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-semibold text-crm-darkest">{activeLead.customerName || 'Unknown Customer'}</h2>
              <span className="text-xs font-mono text-gray-400">{activeLead.whatsappId}</span>
            </div>
            
            {/* Chat Messages */}
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

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
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
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
                    {activeLead.pipelineStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">AI Bot</span>
                  <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium border border-red-200">
                    Disengaged
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}