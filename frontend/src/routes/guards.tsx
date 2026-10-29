import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { currentSession } from '../lib/mock-auth.js';

// Guard baca sesi via mock-auth (/me mock), bukan localStorage mentah di komponen.
export function RequireAuth({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return currentSession()
    ? <>{children}</>
    : <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
}

export function RequireMerchant({ children }: { children: ReactNode }) {
  const s = currentSession();
  if (!s) return <Navigate to="/login" replace state={{ from: '/merchant' }} />;
  // Tanpa toko → tolak, termasuk admin tanpa toko (sesuai acceptance M2).
  return s.hasStore ? <>{children}</> : <Navigate to="/become-merchant" replace />;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const s = currentSession();
  return s?.role === 'admin' ? <>{children}</> : <Navigate to="/" replace />;
}
