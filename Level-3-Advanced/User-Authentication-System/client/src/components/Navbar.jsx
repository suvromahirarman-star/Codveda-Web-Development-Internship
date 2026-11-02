import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ currentView, setCurrentView }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div className="brand-title">AUTHGUARD</div>
          </div>
          <span className="brand-badge">MongoDB Atlas</span>
        </div>

        <nav className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-profile-badge">
                <div className="user-avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name-text">{user?.name}</span>
                <span className={`role-tag ${user?.role || 'user'}`}>
                  {user?.role}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Sign out of current session"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </>
          ) : (
            <>
              {currentView === 'login' ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setCurrentView('register')}
                >
                  Create Account
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentView('login')}
                >
                  Sign In
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

