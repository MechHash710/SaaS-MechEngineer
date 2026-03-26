import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('@EngenhariaPro:token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          // Verify if token expired and refresh
          try {
             await authService.refreshToken();
             const newUserData = await authService.getMe();
             setUser(newUserData);
          } catch (e) {
             console.error("Session expired");
             authService.logout();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (data: any) => {
    await authService.login(data);
    const userData = await authService.getMe();
    setUser(userData);
  };

  const register = async (data: any) => {
    await authService.register(data);
    // Auto login after register
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
