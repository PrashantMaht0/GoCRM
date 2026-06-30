import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Reports() {
  const { activeCompanyId } = useOutletContext<{ activeCompanyId: string }>();
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!activeCompanyId) return;
    setIsGenerating(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/v1/ai-reports/executive?companyId=${activeCompanyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      } else {
        console.error("Failed to generate report");
      }
    } catch (error) {
      console.error("Error calling AI service", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen overflow-y-auto">
      
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-crm-darkest flex items-center">
          <svg className="w-6 h-6 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Executive AI Insights
        </h1>
        <p className="text-sm text-crm-brown mt-1">Generate dynamic, context-aware performance reviews based on real-time workspace data.</p>
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Action Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
          </div>
          <h2 className="text-lg font-bold text-crm-darkest mb-2">Monthly Executive Briefing</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">
            Our AI will analyze your total revenue, highlight your top performing representative, and evaluate your support ticket backlog to write a comprehensive performance review.
          </p>
          
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center mx-auto space-x-2 ${
              isGenerating 
                ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed' 
                : 'bg-crm-darkest text-crm-white hover:bg-crm-dark'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Analyzing Workspace Data...</span>
              </>
            ) : (
              <span>Generate Report</span>
            )}
          </button>
        </div>

        {/* Results Card */}
        {report && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-indigo-100 relative overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-6">AI Generated Insight</h3>
            
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              {/* This splits the AI's paragraphs by newlines and renders them beautifully */}
              {report.split('\n').filter(paragraph => paragraph.trim() !== '').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}