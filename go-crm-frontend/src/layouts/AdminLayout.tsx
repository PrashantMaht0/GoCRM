import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();
  const [companies] = useState<string[]>([]); 

  return (
    <div className="flex h-screen bg-crm-white">
      <aside className="w-64 border-r border-gray-100 flex flex-col justify-between p-4 bg-white">
        <div>
          <div className="flex items-center space-x-2 px-2 mb-8 mt-2">
             <span className="font-bold text-xl text-crm-darkest">GoCRM</span>
          </div>
          <nav className="space-y-1">
            <Link to="/admin/dashboard" className="block px-3 py-2 rounded-lg text-sm font-medium text-crm-dark hover:bg-crm-light hover:text-crm-darkest transition-colors">1. Dashboard</Link>
            <div className="px-3 py-2">
              <span className="text-xs font-semibold text-crm-brown uppercase tracking-wider">Your Companies</span>
              {companies.length === 0 ? (
                <div className="text-sm text-crm-brown italic mt-2">No Company registered</div>
              ) : (
                <select className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:ring-crm-accent bg-transparent">
                  {companies.map(c => <option key={c}>{c}</option>)}
                </select>
              )}
            </div>
            <Link to="/admin/create-company" className="block px-3 py-2 rounded-lg text-sm font-medium text-crm-dark hover:bg-crm-light transition-colors">3. Create New Company</Link>
          </nav>
        </div>
        <div className="p-3 mt-4 border-t border-gray-100 flex items-center justify-between hover:bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-crm-accent flex items-center justify-center text-crm-darkest font-bold">PM</div>
            <div>
              <p className="text-sm font-medium text-crm-darkest">Prashant Mahto</p>
              <p className="text-xs text-crm-brown">Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="text-xs text-red-500 hover:underline">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50/30">
        <Outlet />
      </main>
    </div>
  );
}