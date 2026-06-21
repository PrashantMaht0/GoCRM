import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function CompanySettings() {
  const [company, setCompany] = useState<{ id: number; name: string; companyCode: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [waFormData, setWaFormData] = useState({
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    webhookVerifyToken: '',
  });
  const [isSubmittingWA, setIsSubmittingWA] = useState(false);
  const [waSaveStatus, setWaSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { activeCompanyId } = useOutletContext<{ activeCompanyId: string }>();

  useEffect(() => {
    if (!activeCompanyId) {
      setIsLoading(false);
      setCompany(null);
      return;
    }
    const fetchCompanySettings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/companies/${activeCompanyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCompany(data);
        }
      } catch (error) {
        console.error('Failed to fetch company details', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanySettings();
  }, [activeCompanyId]);

  const handleCopyCode = () => {
    if (company) {
      navigator.clipboard.writeText(company.companyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = () => {
    console.log("Company deleted! (Backend implementation pending)");
    setShowDeleteConfirm(false);
  };

  const handleWaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWaFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveWaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWA(true);
    setWaSaveStatus('idle')

    try{
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/v1/whatsapp-config',{
        method: 'POST' ,
        headers: { 
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`},
          body: JSON.stringify(waFormData)
      });

      if(response.ok){
        setWaSaveStatus('success');
        setTimeout(()=>setWaSaveStatus('idle'),3000); 
      }
      else{
        setWaSaveStatus('error');
        console.log("Server rejected the WhatsApp Configuration.");
      }
    }catch (error){
      console.error("Network error while saving WhatsApp config:", error);
      setWaSaveStatus('error');
    }finally {
      setIsSubmittingWA(false);
    }
    
  };

  if (isLoading) return <div className="p-8 text-gray-500">Loading settings...</div>;
  if (!company) return <div className="p-8 text-red-500">No workspace found. Please create one.</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-crm-darkest mb-6">Workspace Settings</h1>

      {/* 1. General Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-crm-darkest">General Information</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p className="font-medium text-gray-900">{company.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Workspace ID</p>
              <p className="font-medium text-gray-900">#{company.id}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Company Join Code</p>
            <div className="flex items-center space-x-3">
              <code className="px-4 py-2 bg-gray-100 rounded-lg text-gray-800 font-mono text-sm border border-gray-200">
                {company.companyCode}
              </code>
              <button 
                onClick={handleCopyCode}
                className="px-4 py-2 bg-crm-light text-crm-darkest rounded-lg text-sm font-medium hover:bg-crm-accent transition-colors border border-crm-accent/50"
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Share this exact code with your Sales Reps so they can join your workspace.</p>
          </div>
        </div>
      </div>

      {/* 2. WhatsApp Integration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-crm-darkest">WhatsApp Business API</h2>
            <p className="text-sm text-gray-500 mt-1">Configure Meta Developer credentials to enable AI chatbot responses.</p>
          </div>
          <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
             <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.115.549 4.183 1.593 6.002L.031 24l6.115-1.603A11.96 11.96 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm3.327 17.387c-.143.402-.828.784-1.156.818-.314.032-.719.066-1.954-.442-1.488-.611-2.433-2.148-2.506-2.247-.074-.099-.597-.798-.597-1.52 0-.722.378-1.077.513-1.229.135-.152.296-.19.395-.19.098 0 .196 0 .283.004.09.004.21-.035.328.249.12.288.409.998.446 1.074.037.076.061.164.013.26-.048.096-.073.156-.146.241-.073.085-.154.187-.22.257-.074.076-.151.16-.065.31.085.148.378.627.812 1.018.558.502 1.035.657 1.183.731.148.074.234.062.32-.036.086-.098.373-.434.472-.582.098-.148.196-.123.332-.073.136.05 859.394 402.433 1.042.482.183.05.305.074.349.115.044.041.044.238-.099.64z"/></svg>
          </div>
        </div>

        <form onSubmit={handleSaveWaConfig} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700">Phone Number ID</label>
              <input type="text" id="phoneNumberId" name="phoneNumberId" value={waFormData.phoneNumberId} onChange={handleWaInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-crm-accent outline-none text-sm" placeholder="e.g., 1043234556778" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="wabaId" className="block text-sm font-medium text-gray-700">WhatsApp Business Account ID</label>
              <input type="text" id="wabaId" name="wabaId" value={waFormData.wabaId} onChange={handleWaInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-crm-accent outline-none text-sm" placeholder="e.g., 11223344556677" required />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">Permanent Access Token</label>
            <input type="password" id="accessToken" name="accessToken" value={waFormData.accessToken} onChange={handleWaInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-crm-accent outline-none text-sm font-mono" placeholder="EAALx..." required />
          </div>
          <div className="space-y-2">
            <label htmlFor="webhookVerifyToken" className="block text-sm font-medium text-gray-700">Webhook Verify Token</label>
            <input type="text" id="webhookVerifyToken" name="webhookVerifyToken" value={waFormData.webhookVerifyToken} onChange={handleWaInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-crm-accent outline-none text-sm" placeholder="Create a custom secret string..." required />
            <p className="text-xs text-gray-400">Paste this exact string into the Meta Developer Dashboard when setting up your webhook.</p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <div className="h-6">
              {waSaveStatus === 'success' && (
                <span className="text-sm text-green-600 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Config saved securely.
                </span>
              )}
            </div>
            <button type="submit" disabled={isSubmittingWA} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${isSubmittingWA ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-crm-darkest text-white hover:bg-crm-dark active:scale-95'}`}>
              {isSubmittingWA ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-100 p-6">
        <h2 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">Deleting this company will permanently remove all associated leads, chat logs, and settings. This cannot be undone.</p>
        
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            Delete Company
          </button>
        ) : (
          <div className="p-4 bg-white border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-4">Are you absolutely sure you want to delete {company.name}?</p>
            <div className="flex space-x-3">
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Yes, Delete Everything</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}