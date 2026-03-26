import React from 'react';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-primary-600">Carregando...</div>;
  }

  if (!isAuthenticated) {
    // handled by AppContent routes, but fallback in case:
    return null;
  }

  return <>{children}</>;
};
