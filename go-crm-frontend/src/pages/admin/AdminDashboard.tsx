import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface LeaderboardEntry {
  name: string;
  revenue: number;
}

interface AdminMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  activeLeads: number;
  openTickets: number;
  totalWon: number;
  leaderboard: LeaderboardEntry[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { activeCompanyId } = useOutletContext<{ activeCompanyId: string }>();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [activeCompany, setActiveCompany] = useState<{ id: number; name: string; companyCode: string } | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const years = Array.from(new Array(5), (_, index) => currentDate.getFullYear() - index);
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  useEffect(() => {
    if (!activeCompanyId) {
      setIsLoading(false);
      setActiveCompany(null);
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Company Details & Admin Metrics Simultaneously
        const [companyRes, metricsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/v1/companies/${activeCompanyId}`, { headers }),
          fetch(`http://localhost:8080/api/v1/dashboard/admin?companyId=${activeCompanyId}&month=${selectedMonth}&year=${selectedYear}`, { headers })
        ]);
        
        if (companyRes.ok) setActiveCompany(await companyRes.json());
        if (metricsRes.ok) setMetrics(await metricsRes.json());

      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeCompanyId, selectedMonth, selectedYear]);

  if (isLoading || !metrics) {
    return <div className="p-8 text-crm-brown flex items-center justify-center h-full min-h-screen">Loading workspace metrics...</div>;
  }

  if (!activeCompany) {
    return <div className="p-8 text-crm-darkest flex items-center justify-center h-full min-h-screen">No workspace found. Please create or join one.</div>;
  }

  return (
    <div className="flex-1 p-8 bg-gray-50/50 min-h-screen overflow-y-auto">
      
      {/* Top Header & Filters */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-crm-darkest">{activeCompany.name} <span className="text-sm font-normal text-gray-400 ml-2">({activeCompany.companyCode})</span></h1>
          <p className="text-sm text-crm-brown mt-1">God Mode Overview</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-crm-darkest text-sm outline-none cursor-pointer pl-2"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <div className="w-px bg-gray-200 mx-1"></div>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-crm-darkest text-sm outline-none cursor-pointer pr-2"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          <button 
            onClick={() => navigate('/admin/settings')}
            className="px-4 py-2 bg-crm-darkest text-crm-white rounded-lg text-sm font-medium hover:bg-crm-dark transition-colors shadow-sm"
          >
            Workspace Settings
          </button>
        </div>
      </div>

      {/* KPI Tiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Company Revenue (Month)', value: `$${metrics.monthlyRevenue.toLocaleString()}`, color: 'text-green-700', bg: 'bg-green-50/50' },
          { label: 'Company Revenue (All Time)', value: `$${metrics.totalRevenue.toLocaleString()}`, color: 'text-crm-darkest', bg: 'bg-white' },
          { label: 'Active Pipeline (Leads)', value: metrics.activeLeads, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Total Deals Won', value: metrics.totalWon, color: 'text-green-600', bg: 'bg-green-50/50' },
          { label: 'Support Backlog (Open)', value: metrics.openTickets, color: 'text-red-600', bg: 'bg-red-50/50' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-xl border border-gray-200 shadow-sm ${stat.bg} transition-transform hover:-translate-y-1 duration-200`}>
            <span className="block text-xs font-bold uppercase tracking-wider text-crm-brown mb-2">{stat.label}</span>
            <span className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Leaderboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[400px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-crm-darkest">Revenue Leaderboard</h2>
            <p className="text-xs text-crm-brown">Top performing sales representatives this month.</p>
          </div>
          <div className="flex-1 w-full">
            {metrics.leaderboard.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 italic">No closed deals this month.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.leaderboard} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#676050' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#2d2a24', fontWeight: 600 }} width={100} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: any) => {
                      const safeValue = Number(value) || 0;
                      return [`$${safeValue.toLocaleString()}`, 'Revenue Generated'];
                    }}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={32}>
                    {metrics.leaderboard.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#d3f0ad' : '#eaf8d8'} /> /* Highlight top seller */
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Performers List (Text View) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-crm-darkest">Team Rankings</h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {metrics.leaderboard.length === 0 ? (
              <div className="text-center text-sm text-gray-400 italic mt-10">No data available.</div>
            ) : (
              metrics.leaderboard.map((rep, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-crm-light/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400' : 
                      index === 1 ? 'bg-gray-200 text-gray-700' : 
                      index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-white text-crm-darkest border border-gray-200'
                    }`}>
                      #{index + 1}
                    </div>
                    <span className="font-semibold text-sm text-crm-darkest truncate w-24">{rep.name}</span>
                  </div>
                  <span className="font-bold text-green-700 text-sm">${rep.revenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}