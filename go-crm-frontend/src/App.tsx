import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import AdminLayout from './layouts/AdminLayout';
import JoinCompany from './pages/sales/JoinCompany';
import SalesRepLayout from './layouts/SalesRepLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanySettings from './pages/admin/CompanySettings';
import CreateCompany from './pages/admin/CreateCompany';
import Chat from './pages/sales/Chat';
import Deals from './pages/sales/Deals';
import UserSettings from './pages/sales/UserSettings';
import Reports from './pages/admin/Reports';
import ChatLogs from './pages/admin/ChatLogs';
import SupportTicketDashboard from './pages/admin/SupportTicket';
import Leads from './pages/sales/Leads';
import UserDashboard from './pages/sales/UserDashboard';

export default function App() {
  const { user } = useAuth();

  if (!user) return <AuthPage />;

  return (
    <Router>
      <Routes>
        {/* ADMIN ROUTES */}
        {user.role === 'ADMIN' && (
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="support-tickets" element={<SupportTicketDashboard />} />
            <Route path="chat-logs" element={<ChatLogs />} />
            <Route path="settings" element={<CompanySettings />} />
            <Route path="create-company" element={<CreateCompany />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        )}

        {/* SALES REP ROUTES */}
        {user.role === 'SALES_REP' && (
          <>
            {!user.companyId ? (
              <Route path="/join-company" element={<JoinCompany />} />
            ) : (
              <Route path="/user/*" element={<SalesRepLayout />} >
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="inbox" element={<Chat />} />
                <Route path="deals" element={<Deals />} />
                <Route path="leads" element={<Leads />} />
                <Route path="settings" element={<UserSettings />} />
                <Route path="*" element={<Navigate to = "dashboard" replace/>}/>
              </Route>
            )}
          </>
        )}

        {/* CATCH-ALL REDIRECT */}
        <Route path="*" element={
          <Navigate to={
            user.role === 'ADMIN' ? "/admin/dashboard" : 
            (user.companyId ? "/user/dashboard" : "/join-company")
          } replace />
        } />
      </Routes>

      
    </Router>
  );
}