import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  hasPermission: (permission: 'MANAGE_CAMERAS' | 'MANAGE_ZONES' | 'TRIAGE_ALERTS' | 'VERIFY_AUDIT' | 'MANAGE_USERS') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ibvap_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      const savedToken = localStorage.getItem('ibvap_token');
      const savedUserStr = localStorage.getItem('ibvap_user');

      if (savedToken && savedUserStr) {
        setToken(savedToken);
        setUser(JSON.parse(savedUserStr));
      } else {
        // Default demo session as COMMANDER for quick exploration
        const defaultUser: User = {
          id: 1,
          username: 'commander',
          email: 'commander@ssb.gov.in',
          full_name: 'BOP Sector Commander',
          role: 'COMMANDER',
          is_active: true,
          created_at: '2026-08-01T00:00:00Z',
        };
        const mockToken = 'mock_jwt_commander_session';
        localStorage.setItem('ibvap_token', mockToken);
        localStorage.setItem('ibvap_user', JSON.stringify(defaultUser));
        setToken(mockToken);
        setUser(defaultUser);
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      setToken(res.access_token);
      localStorage.setItem('ibvap_token', res.access_token);

      const loggedInUser: User = {
        id: Date.now(),
        username: res.username,
        email: `${res.username.toLowerCase()}@ssb.gov.in`,
        full_name:
          res.role === 'COMMANDER'
            ? 'BOP Sector Commander'
            : res.role === 'OPERATOR'
            ? 'Duty Operator'
            : 'Integrity Auditor',
        role: res.role as UserRole,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      setUser(loggedInUser);
      localStorage.setItem('ibvap_user', JSON.stringify(loggedInUser));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ibvap_token');
    localStorage.removeItem('ibvap_user');
  };

  const switchDemoRole = (role: UserRole) => {
    let name = 'BOP Sector Commander';
    let uname = 'commander';
    if (role === 'OPERATOR') {
      name = 'Duty Officer Verma';
      uname = 'operator_alpha';
    } else if (role === 'AUDITOR') {
      name = 'Inspector Sharma (Vigilance)';
      uname = 'auditor_sharma';
    } else if (role === 'ADMIN') {
      name = 'System Administrator';
      uname = 'sysadmin';
    }

    const newUser: User = {
      id: Date.now(),
      username: uname,
      email: `${uname}@ssb.gov.in`,
      full_name: name,
      role,
      is_active: true,
      created_at: '2026-08-01T00:00:00Z',
    };

    const newToken = `mock_token_${role.toLowerCase()}`;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ibvap_token', newToken);
    localStorage.setItem('ibvap_user', JSON.stringify(newUser));
  };

  const hasPermission = (
    permission: 'MANAGE_CAMERAS' | 'MANAGE_ZONES' | 'TRIAGE_ALERTS' | 'VERIFY_AUDIT' | 'MANAGE_USERS'
  ): boolean => {
    if (!user) return false;
    const r = user.role;
    if (r === 'COMMANDER' || r === 'ADMIN') return true;

    switch (permission) {
      case 'TRIAGE_ALERTS':
        return r === 'OPERATOR';
      case 'MANAGE_ZONES':
        return r === 'OPERATOR';
      case 'VERIFY_AUDIT':
        return r === 'AUDITOR';
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        switchDemoRole,
        hasPermission,
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
