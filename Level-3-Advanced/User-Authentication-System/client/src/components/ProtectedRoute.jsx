import React from 'react';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, requiredRole, fallback = null }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div className="spinner spinner-primary" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-danger)', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          This section requires the <strong>{requiredRole}</strong> role. Your current role is <strong>{user?.role}</strong>.
        </p>
      </div>
    );
  }

  return children;
}

