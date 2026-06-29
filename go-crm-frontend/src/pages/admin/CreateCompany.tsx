import React, { useState } from 'react';

export default function CreateCompany() {
  const [companyName, setCompanyName] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [adminGuardrails, setAdminGuardrails] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/v1/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Passing the initial AI configuration alongside company creation
        body: JSON.stringify({ 
          name: companyName,
          knowledgeBase: knowledgeBase.trim() || 'No company knowledge provided yet.',
          adminGuardrails: adminGuardrails.trim() || 'Standard corporate tone.'
        })
      });

      if (response.ok) {
        setStatus('success');
        setCompanyName('');
        setKnowledgeBase('');
        setAdminGuardrails('');
        setTimeout(() => window.location.href = '/admin/dashboard', 1500);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Company Workspace</h1>
        <p className="text-sm text-gray-500">
          Initialize a new tenant workspace and define its autonomous AI assistant parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Company Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Acme Corp Ireland"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-crm-darkest outline-none text-sm transition-all"
          />
        </div>

        <hr className="border-gray-100 my-4" />

        {/* AI Knowledge Base */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Company Knowledge Base
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Provide core facts, opening hours, pricing, and FAQs. The AI will strictly answer customer queries using this text.
          </p>
          <textarea
            rows={4}
            placeholder="e.g. We are open Mon-Fri 9am to 5pm. Our standard consultation fee is €50. We are located in Athlone..."
            value={knowledgeBase}
            onChange={(e) => setKnowledgeBase(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-crm-darkest outline-none text-sm transition-all"
          />
        </div>

        {/* AI Guardrails */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Administrative Guardrails
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Strict behavioral rules for this specific company bot (e.g. refund policies, escalation triggers).
          </p>
          <textarea
            rows={3}
            placeholder="e.g. Never promise discounts. Always escalate to a human if the user mentions legal action or cancellation."
            value={adminGuardrails}
            onChange={(e) => setAdminGuardrails(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-crm-darkest outline-none text-sm transition-all"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {status === 'success' && (
              <span className="text-sm text-green-600 font-medium flex items-center">
                Workspace & AI Bot initialized successfully! Redirecting...
              </span>
            )}
            {status === 'error' && (
              <span className="text-sm text-red-600 font-medium">
                Failed to create workspace. Please verify backend connectivity.
              </span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !companyName.trim()}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all shadow-sm ${
              isSubmitting || !companyName.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-crm-darkest hover:bg-gray-800 active:scale-95'
            }`}
          >
            {isSubmitting ? 'Creating Workspace...' : 'Create Company Workspace'}
          </button>
        </div>
      </form>
    </div>
  );
}