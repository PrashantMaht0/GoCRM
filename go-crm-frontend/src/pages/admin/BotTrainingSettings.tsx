import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

interface BotSettings {
  companyId: number;
  knowledgeBase: string;
  adminGuardrails: string;
}

export default function BotTrainingSettings() {
  const { activeCompanyId } = useOutletContext<{ activeCompanyId: string }>();
  
  const [settings, setSettings] = useState<BotSettings>({ companyId: 0, knowledgeBase: '', adminGuardrails: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!activeCompanyId) return;

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/bot-settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch bot settings', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [activeCompanyId]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/v1/bot-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const updated = await response.json();
        setSettings(updated);
        setSaveStatus('success');
        setIsEditing(false); 
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400 text-sm">Loading AI Bot configurations...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">AI Bot Training & Knowledge</h2>
          <p className="text-sm text-gray-500">Manage the core intelligence and safety instructions injected into your WhatsApp AI assistant.</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-crm-dark text-crm-accent hover:bg-crm-darkest rounded-lg text-sm font-medium transition-colors border border-gray-200"
          >
            Edit Settings
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-crm-dark text-crm-accent hover:bg-crm-darkest rounded-lg text-sm font-medium transition-colors border border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-crm-dark text-crm-accent hover:bg-crm-darkest rounded-lg text-sm font-medium shadow-sm transition-all"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE */}
      {!isEditing ? (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Company Knowledge Base</span>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {settings.knowledgeBase || <span className="italic text-gray-400">No knowledge base configured.</span>}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Admin Guardrails</span>
            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/60 text-sm text-amber-950 whitespace-pre-wrap leading-relaxed">
              {settings.adminGuardrails || <span className="italic text-gray-400">No custom guardrails applied.</span>}
            </div>
          </div>
        </div>
      ) : (
        /* EDIT MODE (Reuses Form Inputs) */
        <div className="space-y-6 animate-fadeIn">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Company Knowledge Base</label>
            <p className="text-xs text-gray-500 mb-2">All product data, company policies, and facts go here.</p>
            <textarea
              rows={6}
              value={settings.knowledgeBase}
              onChange={(e) => setSettings({ ...settings, knowledgeBase: e.target.value })}
              className="w-full p-3.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-crm-darkest outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Administrative Guardrails</label>
            <p className="text-xs text-gray-500 mb-2">Rules that restrict the bot from taking unauthorized actions.</p>
            <textarea
              rows={4}
              value={settings.adminGuardrails}
              onChange={(e) => setSettings({ ...settings, adminGuardrails: e.target.value })}
              className="w-full p-3.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-crm-darkest outline-none leading-relaxed font-mono text-xs"
            />
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <p className="text-xs text-red-600 mt-4 font-semibold">Failed to update settings. Please check server logs.</p>
      )}
    </div>
  );
}