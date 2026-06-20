import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import AdminLayout from './layouts/AdminLayout';
import JoinCompany from './pages/JoinCompany';
import SalesRepPortal from './layouts/SalesRepPortal';

// Import your page components here
import Dashboard from './pages/Dashboard';
import CompanySettings from './pages/CompanySettings';
import CreateCompany from './pages/CreateCompany'; // <-- Uncommented this line!

export default function App() {
  const { user } = useAuth();

  if (!user) return <AuthPage />;

  return (
    <Router>
      <Routes>
        {user.role === 'ADMIN' && (
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<CompanySettings />} />
            
            {/* <-- Replaced the inline div with the actual component --> */}
            <Route path="create-company" element={<CreateCompany />} />
            
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        )}

        {user.role === 'USER' && (
          <>
            {!user.companyId ? (
              <Route path="*" element={<JoinCompany />} />
            ) : (
              <Route path="/user/*" element={<SalesRepPortal />} />
            )}
          </>
        )}

        <Route path="*" element={<Navigate to={user.role === 'ADMIN' ? "/admin/dashboard" : "/user"} replace />} />
      </Routes>
    </Router>
  );
}