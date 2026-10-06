import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSummary, LoginRequest, RegisterRequest } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLibrarian: boolean;
  isMember: boolean;
  loading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  quickLogin: (role: 'admin' | 'librarian' | 'member') => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('libraai_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const storedToken = localStorage.getItem('libraai_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (req: LoginRequest) => {
    const res = await api.login(req);
    if (res.success && res.data) {
      localStorage.setItem('libraai_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const quickLogin = async (role: 'admin' | 'librarian' | 'member') => {
    await login({ username: role, password: 'password123' });
  };

  const register = async (req: RegisterRequest) => {
    const res = await api.register(req);
    if (res.success && res.data) {
      localStorage.setItem('libraai_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('libraai_token');
    setToken(null);
    setUser(null);
  };

  const roles = user?.roles || [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isLibrarian = roles.includes('ROLE_LIBRARIAN') || isAdmin;
  const isMember = roles.includes('ROLE_MEMBER') || isLibrarian;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        isLibrarian,
        isMember,
        loading,
        login,
        quickLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
