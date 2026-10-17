import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../store';
import { isAdminUser } from '../config/admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Only admins (confirmed approved email, or role 'admin') can open the page */
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { state, t } = useApp();

  // Wait for the saved session to be restored, otherwise a page refresh on /admin would bounce to /login
  if (!state.authReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          {t('جارٍ التحقق من الحساب...', 'Checking your account...')}
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdminUser(state.currentUser)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
