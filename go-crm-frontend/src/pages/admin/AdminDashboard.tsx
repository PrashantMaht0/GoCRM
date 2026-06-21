import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeCompany, setActiveCompany] = useState<{ id: number; name: string; companyCode: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { activeCompanyId } = useOutletContext<{ activeCompanyId: string }>();

  useEffect(() => {
    if (!activeCompanyId) {
      setIsLoading(false);
      setActiveCompany(null);
      return;
    }
    const fetchMyCompany = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/companies/${activeCompanyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setActiveCompany(data);
        }
      } catch (error) {
        console.error('Failed to fetch company details', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyCompany();
  }, [activeCompanyId]);

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (!activeCompany) return <div className="p-8">No workspace found. Please create one.</div>;

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{activeCompany.name}</h1>
          <p className="text-sm text-gray-500">Dashboard Overview</p>
        </div>
        
        <div className="flex space-x-4 relative">
          {/* Note: Switch company button simplified since 1 Admin = 1 Company for MVP */}
          <button 
            onClick={() => navigate('/admin/settings')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Dashboard Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Leads</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Active Chats</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
}