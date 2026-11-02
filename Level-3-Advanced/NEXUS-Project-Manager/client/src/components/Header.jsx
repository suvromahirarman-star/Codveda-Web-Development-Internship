import React from 'react';

/**
 * Header Component
 * Top navigation bar featuring NEXUS branding, workspace context, quick actions, and user profile.
 */
export default function Header({ onToggleMobileMenu, onOpenProjectModal, onOpenTaskModal, searchQuery, onSearchChange }) {
  return (
    <header className="nexus-header" role="banner">
      <div className="header-left">
        {/* Mobile menu toggle */}
        <button
          type="button"
          className="btn-mobile-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Brand identity */}
        <div className="header-brand">
          <div className="brand-badge-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="brand-name">
            NEXUS<span className="brand-dot">.</span>
          </span>
        </div>

        {/* Workspace pill */}
        <div className="workspace-pill">
          <span className="workspace-dot" aria-hidden="true"></span>
          <span className="workspace-title">Codveda Workspace</span>
          <span className="workspace-badge">MongoDB Live</span>
        </div>
      </div>

      <div className="header-center">
        <div className="header-search-wrap">
          <svg className="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="header-search-input"
            placeholder="Quick search projects or tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search projects and tasks"
          />
        </div>
      </div>

      <div className="header-right">
        {/* Quick action buttons */}
        <button
          type="button"
          className="btn btn-primary btn-sm header-action-btn"
          onClick={onOpenTaskModal}
          title="Create a new task in MongoDB"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Task</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm header-action-btn"
          onClick={onOpenProjectModal}
          title="Create a new project in MongoDB"
        >
          <span>New Project</span>
        </button>

        {/* User profile avatar */}
        <div className="user-profile-cluster">
          <div className="user-avatar" title="Suvro Mahir Arman">
            <span>MA</span>
          </div>
          <div className="user-meta">
            <span className="user-name">Mahir Arman</span>
            <span className="user-role">Full-Stack Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
}

