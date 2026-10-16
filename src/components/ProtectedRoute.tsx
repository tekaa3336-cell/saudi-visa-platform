import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedEmails?: string[];
}

export function ProtectedRoute({ children, allowedEmails }: ProtectedRouteProps) {
  const { state } = useApp();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedEmails && state.currentUser?.email) {
    const isAllowed = allowedEmails.includes(state.currentUser.email.toLowerCase());
    if (!isAllowed) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
