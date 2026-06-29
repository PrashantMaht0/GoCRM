import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


export default function AdminLayout() {
  const { user, logout , updateUser} = useAuth();
  const location = useLocation();
  const [companies, setCompanies] = useState<any[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('');

  useEffect(() => {
      const fetchFullProfile = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch('http://localhost:8080/api/v1/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (updateUser && data.fullName) {
              updateUser({ fullName: data.fullName });
            }
          }
        } catch (error) {
          console.error("Failed to fetch full user profile", error);
        }
      };
  
      fetchFullProfile();
    }, [updateUser]);
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8080/api/v1/companies/owned', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCompanies(data); 
          if (data.length > 0) {
            setActiveCompanyId(data[0].id.toString());
          }
        }
      } catch (error) {
        console.error("Failed to fetch companies", error);
      }
    };
    fetchCompanies();
  }, []);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setActiveCompanyId(selectedId);
    
    console.log("Switched active workspace to ID:", selectedId);
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/reports', label: 'AI Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/admin/support-tickets', label: 'Support Tickets', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { path: '/admin/chat-logs', label: 'Chat Logs', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { path: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-crm-darkest font-sans">
      {/* Sidebar - Matching SalesRepPortal Theme */}
      <aside className="w-64 bg-crm-darkest text-crm-white flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-crm-dark">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-crm-darkest rounded-lg flex items-center justify-center">
                <svg className="w-10 h-10 text-crm-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41a14.97 14.97 0 00-6.16 12.12c4.75-.12 8.78-3.44 9.63-7.38z" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-crm-white">GoCRM</span>
            </div>
          </div>
          
          <div className="px-4 py-6">
            <p className="text-xs font-semibold text-crm-brown uppercase tracking-wider mb-4 px-2">Menu</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname.includes(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-crm-dark text-crm-accent' 
                        : 'text-gray-400 hover:bg-crm-dark/50 hover:text-crm-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Dynamic Company Dropdown */}
            <div className="mt-8 px-2 border-t border-crm-dark pt-6">
              <span className="text-xs font-semibold text-crm-brown uppercase tracking-wider block mb-2">Your Companies</span>
              {companies.length === 0 ? (
                <div className="text-sm text-gray-500 italic">No Company registered</div>
              ) : (
                <select 
                value={activeCompanyId}
                onChange={handleCompanyChange}
                className="block w-full text-sm bg-crm-dark border-none text-crm-white rounded-md focus:ring-crm-accent focus: outline-none py-2 px-3">
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <Link 
                to="/admin/create-company" 
                className="mt-3 block w-full text-center px-3 py-2 border border-crm-brown border-dashed rounded-lg text-sm font-medium text-crm-accent hover:bg-crm-dark transition-colors"
              >
                + Create New Company
              </Link>
            </div>
          </div>
        </div>

        {/* User Profile Area */}
        <div className="p-4 border-t border-crm-dark flex flex-col space-y-4">
          {/* Profile Info */}
          <div className="flex items-center space-x-3 px-2">
            <div className="h-9 w-9 rounded-full bg-crm-light flex items-center justify-center text-crm-darkest font-bold shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-crm-white truncate">{user?.email}</p>
              <p className="text-xs text-crm-brown truncate">{user?.fullName}</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={logout} 
            className="flex items-center justify-center w-full space-x-2 px-3 py-2 bg-crm-dark/30 hover:bg-red-500/10 text-crm-brown hover:text-red-400 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 flex flex-col relative bg-gray-50 overflow-y-auto">
        <Outlet context={{ activeCompanyId }} />
      </main>
    </div>
  );
}