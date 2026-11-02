import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login');
  const [toast, setToast] = useState(null);

  // Auto-switch to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      if (currentView === 'dashboard') {
        setCurrentView('login');
      }
    }
  }, [isAuthenticated]);

  // Toast Notification handler with 4-second auto-dismiss
  const showToast = ({ type = 'info', title, message }) => {
    setToast({ type, title, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner spinner-primary" style={{ width: '40px', height: '40px' }} />
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Verifying security credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="main-content">
        {isAuthenticated ? (
          <DashboardPage showToast={showToast} />
        ) : currentView === 'register' ? (
          <RegisterPage
            onSwitchToLogin={() => setCurrentView('login')}
            showToast={showToast}
          />
        ) : (
          <LoginPage
            onSwitchToRegister={() => setCurrentView('register')}
            showToast={showToast}
          />
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;

