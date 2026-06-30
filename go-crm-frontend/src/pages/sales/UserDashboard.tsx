import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartDataPoint {
  day: string;
  revenue: number;
  cumulativeRevenue: number;
  goalTrack: number;
}

interface DashboardMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  activeLeads: number;
  newLeadsThisMonth: number;
  totalWon: number;
  totalResolved: number;
  chartData: ChartDataPoint[];
}

export default function UserDashboard() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const years = Array.from(new Array(5), (val, index) => currentDate.getFullYear() - index);
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/user-dashboard/rep?month=${selectedMonth}&year=${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  if (isLoading || !metrics) {
    return <div className="p-8 text-crm-brown flex items-center justify-center h-full">Loading your performance metrics...</div>;
  }

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50/50 overflow-y-auto">
      
      {/* Header & Filters */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-crm-darkest">Performance Dashboard</h1>
          <p className="text-sm text-crm-brown mt-1">Track your sales goals and pipeline velocity.</p>
        </div>
        
        <div className="flex space-x-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 text-crm-darkest text-sm rounded-md focus:ring-crm-accent focus:border-crm-accent outline-none block p-2"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 text-crm-darkest text-sm rounded-md focus:ring-crm-accent focus:border-crm-accent outline-none block p-2"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* 6 Core KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 flex-shrink-0">
        {[
          { label: 'Revenue (Month)', count: `$${metrics.monthlyRevenue.toLocaleString()}`, color: 'text-green-700', bg: 'bg-green-50/50' },
          { label: 'Revenue (All Time)', count: `$${metrics.totalRevenue.toLocaleString()}`, color: 'text-crm-darkest', bg: 'bg-white' },
          { label: 'New Leads (Month)', count: metrics.newLeadsThisMonth, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Active Pipeline', count: metrics.activeLeads, color: 'text-amber-600', bg: 'bg-amber-50/50' },
          { label: 'Deals Won (All Time)', count: metrics.totalWon, color: 'text-green-600', bg: 'bg-green-50/50' },
          { label: 'Issues Resolved', count: metrics.totalResolved, color: 'text-purple-600', bg: 'bg-purple-50/50' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-xl border border-gray-200 shadow-sm ${stat.bg} transition-transform hover:-translate-y-1 duration-200`}>
            <span className="block text-xs font-bold uppercase tracking-wider text-crm-brown mb-2">{stat.label}</span>
            <span className={`text-2xl font-extrabold ${stat.color}`}>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Goal Tracking Chart Area */}
      <div className="flex-1 min-h-[400px] bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-crm-darkest">Monthly Sales Trajectory</h2>
          <p className="text-xs text-crm-brown">Daily revenue vs. cumulative goal track.</p>
        </div>
        
        <div className="flex-1 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={metrics.chartData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
              
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: '#676050' }} 
                axisLine={false} 
                tickLine={false}
                tickMargin={10}
              />
              
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 12, fill: '#676050' }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12, fill: '#676050' }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: any, name: any) => {
                  const safeValue = Number(value) || 0;
                  return [`$${safeValue.toLocaleString()}`, name];
                }}
                labelStyle={{ fontWeight: 'bold', color: '#2d2a24', marginBottom: '4px' }}
              />
              
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              <Bar 
                yAxisId="left" 
                dataKey="revenue" 
                name="Daily Revenue" 
                barSize={20} 
                fill="#d3f0ad" 
                radius={[4, 4, 0, 0]}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="goalTrack" 
                name="Target Goal" 
                stroke="#676050" 
                strokeWidth={2}
                strokeDasharray="5 5" 
                dot={false}
                activeDot={false}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="cumulativeRevenue" 
                name="Cumulative Earnings" 
                stroke="#2d2a24" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#eaf8d8', stroke: '#2d2a24', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}