import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

// TypeScript interfaces matching our Spring Boot DTOs
interface BotFieldResponse {
  templateId: number;
  fieldKey: string;
  fieldLabel: string;
  expectedType: string;
  currentValue: string;
}

const BotTrainingSettings: React.FC = () => {
  const { activeCompanyId } = useOutletContext<{ activeCompanyId: string }>();
  const [fields, setFields] = useState<BotFieldResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Fetch the dynamic fields when the component loads
  useEffect(() => {
    if (!activeCompanyId) return;

    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/bot-settings/${activeCompanyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFields(data);
        }
      } catch (error) {
        console.error('Failed to fetch bot settings', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [activeCompanyId]);

  // Update specific field value in state
  const handleFieldChange = (templateId: number, newValue: string) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.templateId === templateId ? { ...field, currentValue: newValue } : field
      )
    );
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setSaveStatus('idle');

    // Transform state into the payload our backend expects
    const payload = {
      companyId: parseInt(activeCompanyId, 10),
      fields: fields.map(f => ({
        templateId: f.templateId,
        value: f.currentValue
      }))
    };

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/v1/bot-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save bot config:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500">Loading AI settings...</div>;

  return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-crm-darkest mb-2">AI Bot Training & Guardrails</h2>
        <p className="text-sm text-gray-500 mb-6">Define how the AI represents your business.</p>

        {fields.length === 0 ? (
          <p className="text-red-500">No template fields configured in the database.</p>
        ) : (
          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.templateId} className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 capitalize">
                  {field.fieldLabel}
                </label>
                <textarea 
                  className="w-full border border-gray-200 rounded-lg p-3 h-32 focus:ring-2 focus:ring-crm-accent outline-none"
                  placeholder={`Enter ${field.fieldLabel}...`}
                  value={field.currentValue || ''}
                  onChange={(e) => handleFieldChange(field.templateId, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="h-6">
            {saveStatus === 'success' && (
              <span className="text-sm text-green-600 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                AI settings saved securely.
              </span>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${isSaving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-crm-darkest text-white hover:bg-crm-dark active:scale-95'}`}
          >
            {isSaving ? 'Saving...' : 'Save AI Configuration'}
          </button>
        </div>
      </div>
    
  );
};

export default BotTrainingSettings;