import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('genesis_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('genesis_auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('genesis_auth_token');
      if (savedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('genesis_user', JSON.stringify(res.data.data));
          }
        } catch {
          localStorage.removeItem('genesis_auth_token');
          localStorage.removeItem('genesis_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('genesis_auth_token', receivedToken);
      localStorage.setItem('genesis_user', JSON.stringify(receivedUser));
      return receivedUser;
    } else {
      throw new Error(res.data.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('genesis_auth_token');
    localStorage.removeItem('genesis_user');
    window.location.href = '/login';
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
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
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
