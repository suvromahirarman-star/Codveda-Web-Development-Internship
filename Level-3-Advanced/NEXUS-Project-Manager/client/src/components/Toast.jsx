import React, { useEffect } from 'react';

/**
 * Toast Component
 * Displays temporary feedback banner for successful mutations or error alerts.
 */
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div
      className={`nexus-toast ${isError ? 'toast-error' : 'toast-success'}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon-wrap" aria-hidden="true">
        {isError ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      <div className="toast-content">
        <p className="toast-title">{isError ? 'Action Failed' : 'Success'}</p>
        <p className="toast-message">{toast.message}</p>
      </div>

      <button
        type="button"
        className="toast-close-btn"
        onClick={onClose}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
}

