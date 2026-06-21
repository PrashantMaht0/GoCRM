import  { createContext, useContext, useState, useEffect } from 'react';
import type {ReactNode} from 'react' ;

export type Role = 'ADMIN' | 'SALES_REP';

interface UserContextType {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  companyId: string | null;
}

interface AuthContextType {
  user: UserContextType | null;
  loading: boolean;
  login: (token: string, userData: UserContextType) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContextType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken'); 
    const savedUser = localStorage.getItem('gocrm_user');
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: UserContextType) => {
    localStorage.setItem('accessToken', token); 
    localStorage.setItem('gocrm_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken'); 
    localStorage.removeItem('gocrm_user');
    setUser(null);
  };  

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}