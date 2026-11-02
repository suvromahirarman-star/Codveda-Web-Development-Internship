import React from 'react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'info', title, message } = toast;

  return (
    <div className="toast-container" aria-live="polite">
      <div className={`toast toast-${type}`} role={type === 'error' ? 'alert' : 'status'}>
        <div className="toast-content">
          {title && <div className="toast-title">{title}</div>}
          <div className="toast-message">{message}</div>
        </div>
        <button
          type="button"
          className="toast-close-btn"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}

