import React, { useState, useEffect } from 'react';

// Interfaces
interface Lead {
  id: number;
  customerName: string;
  whatsappId: string;
  pipelineStatus: string;
  botMode: boolean;
  contractValue: number | null;
  aiSummary?: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Forms
  const [newLeadForm, setNewLeadForm] = useState({ customerName: '', whatsappId: '' });
  const [editForm, setEditForm] = useState({ pipelineStatus: 'NEW', contractValue: 0, requirements: '' });

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/v1/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8080/api/v1/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newLeadForm)
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewLeadForm({ customerName: '', whatsappId: '' });
        fetchLeads();
      }
    } catch (error) { console.error(error); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8080/api/v1/leads/${activeLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchLeads();
      }
    } catch (error) { console.error(error); }
  };

  const openEditModal = (lead: Lead) => {
    setActiveLead(lead);
    setEditForm({ 
        pipelineStatus: lead.pipelineStatus, 
        contractValue: lead.contractValue || 0, 
        requirements: lead.aiSummary || '' 
    });
    setIsEditModalOpen(true);
  };

  // Compute Summary Metrics
  const metrics = {
    total: leads.length,
    new: leads.filter(l => l.pipelineStatus === 'NEW').length,
    discovery: leads.filter(l => l.pipelineStatus === 'DISCOVERY').length,
    proposal: leads.filter(l => l.pipelineStatus === 'PROPOSAL_SENT').length,
    negotiation: leads.filter(l => l.pipelineStatus === 'NEGOTIATION').length,
    won: leads.filter(l => l.pipelineStatus === 'WON').length,
  };

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50/50 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-crm-darkest">Lead Directory</h1>
          <p className="text-sm text-crm-brown mt-1">Manage all your assigned contacts and prospective deals.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-crm-darkest text-crm-white rounded-lg text-sm font-medium hover:bg-crm-dark transition-colors shadow-sm"
        >
          + New Lead
        </button>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 flex-shrink-0 mb-8">
        {[
          { label: 'Total Leads', count: metrics.total, color: 'text-crm-darkest', bg: 'bg-white' },
          { label: 'New', count: metrics.new, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'In Discovery', count: metrics.discovery, color: 'text-amber-600', bg: 'bg-amber-50/50' },
          { label: 'Proposals Sent', count: metrics.proposal, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Negotiation', count: metrics.negotiation, color: 'text-yellow-600', bg: 'bg-yellow-50/50' },
          { label: 'Won Deals', count: metrics.won, color: 'text-green-600', bg: 'bg-green-50/50' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-xl border border-gray-200 shadow-sm ${stat.bg}`}>
            <span className="block text-xs font-bold uppercase tracking-wider text-crm-brown mb-1">{stat.label}</span>
            <span className={`text-2xl font-extrabold ${stat.color}`}>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-crm-dark">
            <thead className="bg-gray-50/80 text-xs uppercase text-crm-brown border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Contact (WhatsApp)</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Est. Value</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-crm-brown">Loading leads...</td></tr>
              ) : leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-crm-darkest">{lead.customerName || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{lead.whatsappId}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-crm-light text-crm-darkest rounded border border-crm-accent font-semibold text-xs">
                      {lead.pipelineStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-green-700">${(lead.contractValue || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(lead)} 
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-crm-darkest rounded text-xs font-semibold transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-crm-darkest/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-crm-darkest mb-4">Create Manual Lead</h2>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-crm-darkest mb-1">Customer Name</label>
                <input required type="text" value={newLeadForm.customerName} onChange={e => setNewLeadForm({...newLeadForm, customerName: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-crm-accent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-crm-darkest mb-1">WhatsApp Phone Number</label>
                <input required type="text" placeholder="e.g., +353891234567" value={newLeadForm.whatsappId} onChange={e => setNewLeadForm({...newLeadForm, whatsappId: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-crm-accent" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-crm-brown bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-crm-darkest text-crm-white rounded-lg text-sm font-semibold hover:bg-crm-dark">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && activeLead && (
        <div className="fixed inset-0 bg-crm-darkest/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-crm-darkest mb-4">Edit Deal: {activeLead.customerName}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-crm-darkest mb-1">Pipeline Stage</label>
                  <select value={editForm.pipelineStatus} onChange={e => setEditForm({...editForm, pipelineStatus: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-crm-accent bg-white">
                    <option value="NEW">New</option>
                    <option value="DISCOVERY">Discovery</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-crm-darkest mb-1">Contract Value ($)</label>
                  <input type="number" value={editForm.contractValue} onChange={e => setEditForm({...editForm, contractValue: parseFloat(e.target.value)})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-crm-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-crm-darkest mb-1">Requirements & Notes (JSON/Text)</label>
                <textarea rows={5} value={editForm.requirements} onChange={e => setEditForm({...editForm, requirements: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-crm-accent font-mono text-sm" placeholder="Enter custom requirements..." />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-crm-brown bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-crm-darkest text-crm-white rounded-lg text-sm font-semibold hover:bg-crm-dark">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}