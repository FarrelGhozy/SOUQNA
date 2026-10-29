import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { currentSession } from '../lib/mock-auth.js';

export function RequireAuth({ children }: { children: ReactNode }) {
  return currentSession() ? <>{children}</> : <Navigate to="/login" replace />;
}
export function RequireMerchant({ children }: { children: ReactNode }) {
  const s = currentSession();
  if (!s) return <Navigate to="/login" replace />;
  return s.hasStore || s.role === 'admin' ? <>{children}</> : <Navigate to="/become-merchant" replace />;
}
export function RequireAdmin({ children }: { children: ReactNode }) {
  const s = currentSession();
  return s?.role === 'admin' ? <>{children}</> : <Navigate to="/" replace />;
}
