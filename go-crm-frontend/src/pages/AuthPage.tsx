import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google'; // 1. Import the hook

export default function AuthPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('SALES_REP');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Standard Email/Password login (from our previous step)
  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        login(data.accessToken, data.user);
      } else {
        setLoginError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      setLoginError('Unable to connect to the server.');
    }
  };

  // 2. The Google SSO Login Implementation
  const handleGoogleSubmit = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoginError('');
      try {
        // We send Google's secure token to YOUR Spring Boot backend
        const response = await fetch('http://localhost:8080/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            token: tokenResponse.access_token,
            role: selectedRole // Pass the role so the backend knows what type of user to create if they are new!
          })
        });

        if (response.ok) {
          const data = await response.json();
          login(data.accessToken, data.user);
        } else {
          setLoginError('Google authentication failed on the server.');
        }
      } catch (error) {
        setLoginError('Network error during Google login.');
      }
    },
    onError: () => {
      setLoginError('Google login popup was closed or failed.');
    }
  });

  return (
    <div className="min-h-screen bg-crm-light flex items-center justify-center p-4">
      <div className="bg-crm-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-crm-accent/20">
        
        <div className="flex justify-center items-center space-x-3 mb-6">
          <svg className="w-10 h-10 text-crm-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41a14.97 14.97 0 00-6.16 12.12c4.75-.12 8.78-3.44 9.63-7.38z" />
          </svg>
          <h1 className="text-3xl font-semibold text-crm-darkest tracking-tight">GoCRM</h1>
        </div>

        <h2 className="text-xl font-medium text-crm-dark mb-1">Welcome back</h2>
        <p className="text-crm-brown mb-6 text-sm">Select your workspace access role below.</p>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex relative w-64 border border-gray-200/50">
            <button
              type="button"
              onClick={() => setSelectedRole('SALES_REP')}
              className={`flex-1 py-2 text-sm font-medium rounded-md z-10 transition-colors duration-200 ${
                selectedRole === 'SALES_REP' ? 'text-crm-darkest' : 'text-gray-400 hover:text-crm-dark'
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('ADMIN')}
              className={`flex-1 py-2 text-sm font-medium rounded-md z-10 transition-colors duration-200 ${
                selectedRole === 'ADMIN' ? 'text-crm-darkest' : 'text-gray-400 hover:text-crm-dark'
              }`}
            >
              Administrator
            </button>
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-crm-white rounded-md shadow-sm transition-transform duration-300 ease-in-out ${
                selectedRole === 'ADMIN' ? 'translate-x-[100%]' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Display Error Messages Here */}
        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 text-left flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {loginError}
          </div>
        )}

        <form onSubmit={handleStandardSubmit} className="space-y-4 mb-6 text-left">
           {/* ... your existing email/password inputs ... */}
           <div>
            <label className="block text-sm font-medium text-crm-dark mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-crm-accent focus:border-crm-accent outline-none transition-colors"
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-crm-dark mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-crm-accent focus:border-crm-accent outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-crm-darkest hover:bg-crm-dark text-crm-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-md mt-2"
          >
            Sign In to Workspace
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative px-4 bg-crm-white text-xs text-gray-400 uppercase tracking-widest">Or continue with</span>
        </div>

        <button
          type="button"
          onClick={() => handleGoogleSubmit()}
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-crm-darkest font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-3 transition-colors shadow-sm"
        >
          {/* Google SVG Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.3 1.56-1.18 2.89-2.5 3.78v3.15h4.05c2.37-2.17 3.74-5.39 3.74-8.78z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.05-3.15c-1.12.75-2.56 1.21-3.91 1.21-3.01 0-5.56-2.03-6.46-4.77H1.31v3.26C3.29 21.63 7.39 24 12 24z"/>
            <path fill="#FBBC05" d="M5.54 14.38a7.21 7.21 0 010-4.76V6.36H1.31a11.99 11.99 0 000 11.28l4.23-3.26z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.39 0 3.29 2.37 1.31 6.36l4.23 3.26c.9-2.74 3.45-4.77 6.46-4.77z"/>
          </svg>
          <span>Google SSO</span>
        </button>
      </div>
    </div>
  );
}