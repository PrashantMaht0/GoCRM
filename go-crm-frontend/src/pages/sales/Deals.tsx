import React, { useState, useEffect } from 'react';

interface Lead {
  id: number;
  customerName: string;
  pipelineStatus: string;
  contractValue: number | null;
}

const STAGES = ['NEW', 'DISCOVERY', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'];

export default function Deals() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/v1/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data.filter((l: Lead) => STAGES.includes(l.pipelineStatus)));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  // Compute Generalized Summary Metrics
  const metrics = {
    total: leads.length,
    new: leads.filter(l => l.pipelineStatus === 'NEW').length,
    discovery: leads.filter(l => l.pipelineStatus === 'DISCOVERY').length,
    proposal: leads.filter(l => l.pipelineStatus === 'PROPOSAL_SENT').length,
    negotiation: leads.filter(l => l.pipelineStatus === 'NEGOTIATION').length,
    won: leads.filter(l => l.pipelineStatus === 'WON').length,
  };

  if (isLoading) return <div className="p-8 text-crm-brown">Loading Pipeline...</div>;

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50/50 overflow-hidden">
      
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-crm-darkest">Deals Pipeline</h1>
        <p className="text-sm text-crm-brown mt-1">Visualize your active deals and sales funnel.</p>
      </div>

      {/* Generalized Summary Tiles - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 flex-shrink-0">
        {[
          { label: 'Total Leads', count: metrics.total, color: 'text-crm-darkest', bg: 'bg-white' },
          { label: 'New', count: metrics.new, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'In Discovery', count: metrics.discovery, color: 'text-amber-600', bg: 'bg-amber-50/50' },
          { label: 'Proposals Sent', count: metrics.proposal, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'In Negotiation', count: metrics.negotiation, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Won Deals', count: metrics.won, color: 'text-green-600', bg: 'bg-green-50/50' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-xl border border-gray-200 shadow-sm ${stat.bg}`}>
            <span className="block text-xs font-bold uppercase tracking-wider text-crm-brown mb-1">{stat.label}</span>
            <span className={`text-2xl font-extrabold ${stat.color}`}>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Kanban Board Outer Container - 🚀 FIX: min-w-0 and min-h-0 enforce boundaries */}
      <div className="flex-1 min-w-0 min-h-0 overflow-x-auto overflow-y-hidden custom-scrollbar">
        {/* Kanban Board Inner Container - w-max allows the content to expand beyond the viewport naturally */}
        <div className="flex h-full gap-6 pb-4 w-max pr-8 items-stretch">
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.pipelineStatus === stage);
            const stageTotal = stageLeads.reduce((sum, l) => sum + (l.contractValue || 0), 0);

            return (
              <div key={stage} className="w-80 flex-shrink-0 flex flex-col bg-gray-100/60 rounded-xl p-4 border border-gray-200 h-full">
                
                {/* Column Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 flex-shrink-0">
                  <h3 className="font-semibold text-crm-darkest capitalize flex items-center">
                    {stage.replace('_', ' ').toLowerCase()}
                    <span className="ml-2 text-xs bg-crm-light text-crm-darkest px-2 py-0.5 rounded-full font-bold">
                      {stageLeads.length}
                    </span>
                  </h3>
                  <span className="text-xs font-bold text-crm-brown">${stageTotal.toLocaleString()}</span>
                </div>

                {/* Column Cards - Vertical Scroll Enabled */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-0">
                  {stageLeads.map(lead => (
                    <div key={lead.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-crm-darkest text-sm mb-1 truncate">{lead.customerName || 'Unknown Deal'}</h4>
                      <p className="text-xs text-crm-brown font-medium">
                        Est. Value: <span className="text-green-700">${(lead.contractValue || 0).toLocaleString()}</span>
                      </p>
                    </div>
                  ))}
                  
                  {stageLeads.length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg text-xs text-crm-brown/60 mt-2">
                      No deals in this stage
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}