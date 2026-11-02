import React from 'react';

/**
 * Sidebar Component
 * Provides primary navigation between Dashboard, Projects, Tasks, and Analytics.
 * Serves as fixed sidebar on desktop and sliding drawer on mobile devices.
 */
export default function Sidebar({ activeTab, onTabChange, isMobileOpen, onCloseMobile }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    }
  ];

  const handleSelectTab = (tabId) => {
    onTabChange(tabId);
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          role="presentation"
        />
      )}

      <aside className={`nexus-sidebar ${isMobileOpen ? 'is-mobile-open' : ''}`} aria-label="Main sidebar navigation">
        <div className="sidebar-nav-container">
          <p className="sidebar-section-title">Navigation</p>
          <nav className="sidebar-nav-list">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Database Persistence Status Badge */}
        <div className="sidebar-footer-card">
          <div className="db-status-pill">
            <span className="db-dot" aria-hidden="true"></span>
            <span className="db-text">MongoDB Mongoose</span>
          </div>
          <p className="db-description">
            Strict Persistent Storage &bull; Express REST API Engine
          </p>
        </div>
      </aside>
    </>
  );
}

