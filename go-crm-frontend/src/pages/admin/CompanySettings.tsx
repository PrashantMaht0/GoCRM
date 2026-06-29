import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import BotTrainingSettings from './BotTrainingSettings';

export default function CompanySettings() {
  const [company, setCompany] = useState<{ id: number; name: string; companyCode: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isEditingWA, setIsEditingWA] = useState(false);

  const [waFormData, setWaFormData] = useState({
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    webhookVerifyToken: '',
  });
  
  const [isSubmittingWA, setIsSubmittingWA] = useState(false);
  const [waSaveStatus, setWaSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { activeCompanyId } = useOutletContext<{ activeCompanyId: string }>();

  const handleCopyCode = () => {
    if (company) {
      navigator.clipboard.writeText(company.companyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!activeCompanyId) {
      setIsLoading(false);
      setCompany(null);
      return;
    }
    const fetchCompanySettings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        const companyResponse = await fetch(`http://localhost:8080/api/v1/companies/${activeCompanyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (companyResponse.ok) {
          const data = await companyResponse.json();
          setCompany(data);
        }

        const waResponse = await fetch(`http://localhost:8080/api/v1/whatsapp-configs/company/${activeCompanyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (waResponse.ok) {
          const text = await waResponse.text();
          if (text) {
            const waData = JSON.parse(text);
            const config = Array.isArray(waData) ? waData[0] : waData;
            if (config) {
              setWaFormData({
                phoneNumberId: config.phoneNumberId || '',
                wabaId: config.wabaId || '',
                accessToken: config.accessToken || '',
                webhookVerifyToken: config.webhookVerifyToken || '',
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanySettings();
  }, [activeCompanyId]);

  const handleWaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWA(true);
    setWaSaveStatus('idle');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/v1/whatsapp-configs/company/${activeCompanyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(waFormData)
      });

      if (response.ok) {
        setWaSaveStatus('success');
        setIsEditingWA(false); 
        setTimeout(() => setWaSaveStatus('idle'), 3000);
      } else {
        setWaSaveStatus('error');
      }
    } catch (error) {
      setWaSaveStatus('error');
    } finally {
      setIsSubmittingWA(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8080/api/v1/companies/${activeCompanyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) window.location.href = '/admin/dashboard';
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-8">Loading workspace details...</div>;
  if (!company) return <div className="p-8">No active workspace selected.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* 1. General Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Workspace Identity</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs">Company Name</span>
            <span className="font-semibold text-gray-900">{company.name}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs mb-1">Internal Tenant ID</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                {company.companyCode}
              </span>
              <button 
                onClick={handleCopyCode}
                className="px-2 py-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded text-xs font-medium transition-colors"
                title="Copy to clipboard"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WhatsApp Meta API Config */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">WhatsApp Cloud API Routing</h2>
            <p className="text-sm text-gray-500">Graph API credentials linking Meta Webhooks to this tenant.</p>
          </div>
          {!isEditingWA ? (
            <button
              onClick={() => setIsEditingWA(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200"
            >
              Edit Credentials
            </button>
          ) : (
            <button
              onClick={() => setIsEditingWA(false)}
              className="px-4 py-2 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-300"
            >
              Cancel
            </button>
          )}
        </div>

        {!isEditingWA ? (
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Phone Number ID</span>
              <span className="font-mono bg-gray-50 p-2 rounded block border border-gray-200 text-gray-800">
                {waFormData.phoneNumberId || 'Not Configured'}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">WhatsApp Business Account (WABA) ID</span>
              <span className="font-mono bg-gray-50 p-2 rounded block border border-gray-200 text-gray-800">
                {waFormData.wabaId || 'Not Configured'}
              </span>
            </div>
            {/* 🚀 ADDED VERIFY TOKEN DISPLAY */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Webhook Verify Token</span>
              <span className="font-mono bg-gray-50 p-2 rounded block border border-gray-200 text-gray-800">
                {waFormData.webhookVerifyToken || 'Not Configured'}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Permanent Access Token</span>
              <span className="font-mono bg-gray-50 p-2 rounded block border border-gray-200 text-gray-600 truncate">
                {waFormData.accessToken ? '••••••••••••••••••••••••••••••••••••••••' : 'Not Configured'}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleWaSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number ID</label>
                <input
                  type="text"
                  required
                  value={waFormData.phoneNumberId}
                  onChange={(e) => setWaFormData({ ...waFormData, phoneNumberId: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-crm-darkest font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">WABA ID</label>
                <input
                  type="text"
                  required
                  value={waFormData.wabaId}
                  onChange={(e) => setWaFormData({ ...waFormData, wabaId: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-crm-darkest font-mono text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* 🚀 ADDED VERIFY TOKEN INPUT */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Webhook Verify Token</label>
                <input
                  type="text"
                  required
                  value={waFormData.webhookVerifyToken}
                  onChange={(e) => setWaFormData({ ...waFormData, webhookVerifyToken: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-crm-darkest font-mono text-xs"
                  placeholder="e.g. secret_token_123"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">System User Access Token</label>
                <input
                  type="password"
                  required
                  value={waFormData.accessToken}
                  onChange={(e) => setWaFormData({ ...waFormData, accessToken: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-crm-darkest font-mono text-xs"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2 items-center">
              {waSaveStatus === 'success' && <span className="text-xs text-green-600 mr-4 font-bold">Saved!</span>}
              <button
                type="submit"
                disabled={isSubmittingWA}
                className="px-6 py-2 bg-crm-darkest text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
              >
                {isSubmittingWA ? 'Saving API Keys...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        )}
      </div>

      <BotTrainingSettings />

      {/* 4. Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-100 p-6">
        <h2 className="text-lg font-bold text-red-900 mb-1">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">Deleting this workspace will purge all associated customer leads, active WebSocket pipelines, and chat summaries.</p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete Workspace
          </button>
        ) : (
          <div className="p-4 bg-white border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">Are you absolutely certain? This is permanent.</span>
            <div className="flex space-x-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 bg-gray-100 rounded text-xs font-semibold text-gray-700">Cancel</button>
              <button onClick={handleDelete} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold">Confirm Deletion</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}