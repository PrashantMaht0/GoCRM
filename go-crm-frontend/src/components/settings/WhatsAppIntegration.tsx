import React, { useState } from 'react';

export default function WhatsAppIntegration() {
  const [formData, setFormData] = useState({
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    webhookVerifyToken: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveStatus('idle');

    console.log("Payload to send to Spring Boot:", formData);

    setTimeout(() => {
      setIsSubmitting(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">WhatsApp Business API</h1>
        <p className="text-sm text-gray-500">
          Configure your Meta Developer credentials to enable AI chatbot responses for this workspace.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-medium text-gray-800">Connection Settings</h2>
        </div>

        <form onSubmit={handleSaveConfiguration} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number ID */}
            <div className="space-y-2">
              <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700">
                Phone Number ID
              </label>
              <input
                type="text"
                id="phoneNumberId"
                name="phoneNumberId"
                value={formData.phoneNumberId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-sm"
                placeholder="e.g., 1043234556778"
                required
              />
            </div>

            {/* WABA ID */}
            <div className="space-y-2">
              <label htmlFor="wabaId" className="block text-sm font-medium text-gray-700">
                WhatsApp Business Account ID
              </label>
              <input
                type="text"
                id="wabaId"
                name="wabaId"
                value={formData.wabaId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-sm"
                placeholder="e.g., 11223344556677"
                required
              />
            </div>
          </div>

          {/* Access Token */}
          <div className="space-y-2">
            <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
              Permanent Access Token
            </label>
            <input
              type="password"
              id="accessToken"
              name="accessToken"
              value={formData.accessToken}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-sm font-mono"
              placeholder="EAALx..."
              required
            />
            <p className="text-xs text-gray-400">Never share this token. It grants full access to send messages on behalf of your number.</p>
          </div>

          {/* Webhook Verify Token */}
          <div className="space-y-2">
            <label htmlFor="webhookVerifyToken" className="block text-sm font-medium text-gray-700">
              Webhook Verify Token
            </label>
            <input
              type="text"
              id="webhookVerifyToken"
              name="webhookVerifyToken"
              value={formData.webhookVerifyToken}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder="Create a custom secret string..."
              required
            />
            <p className="text-xs text-gray-400">You will need to paste this exact string into the Meta Developer Dashboard when setting up your webhook.</p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <div className="text-sm">
              {saveStatus === 'success' && (
                <span className="text-green-600 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Configuration saved securely.
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all shadow-sm ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-900 hover:bg-gray-800 active:transform active:scale-95'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}