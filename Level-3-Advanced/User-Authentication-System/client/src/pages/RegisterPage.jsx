import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export function RegisterPage({ onSwitchToLogin, showToast }) {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Password strength evaluation
  const strength = useMemo(() => {
    const pwd = formData.password;
    const checks = {
      length: pwd.length >= 8,
      lower: /[a-z]/.test(pwd),
      upper: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      symbol: /[^A-Za-z0-9]/.test(pwd),
    };

    let score = 0;
    if (checks.length) score += 1;
    if (checks.lower) score += 1;
    if (checks.upper) score += 1;
    if (checks.number) score += 1;
    if (checks.symbol) score += 1;

    let label = 'Too Weak';
    let color = 'var(--color-danger)';
    let percent = (score / 5) * 100;

    if (score >= 4) {
      label = 'Strong';
      color = 'var(--color-success)';
    } else if (score >= 3) {
      label = 'Good';
      color = '#3b82f6';
    } else if (score >= 2) {
      label = 'Fair';
      color = 'var(--color-warning)';
    }

    return { checks, score, label, color, percent };
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register(name.trim(), email.trim(), password);
      if (!res?.user) {
        throw new Error(res?.message || 'Registration failed. No user details returned.');
      }
      showToast({
        type: 'success',
        title: 'Account Created',
        message: `Welcome, ${res.user.name}! You are registered with role: ${res.user.role}.`,
      });
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-header-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join AUTHGUARD with industry-standard bcrypt encryption.</p>
        </div>

        {/* Security Role Safeguard Banner */}
        <div className="security-notice">
          <span className="security-notice-icon">🛡️</span>
          <div>
            <strong>Zero Role Escalation Guarantee:</strong>
            <div>All public registrations are assigned the safe default role <code>user</code> on the server. Client-provided roles are ignored.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              name="name"
              autoComplete="name"
              className="form-input"
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              name="email"
              autoComplete="email"
              className="form-input"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <div className="form-input-wrapper">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                className="form-input"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            {/* Dynamic Password Strength Meter */}
            {formData.password && (
              <div className="password-meter">
                <div className="meter-track">
                  <div
                    className="meter-bar"
                    style={{
                      width: `${strength.percent}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <div className="meter-labels">
                  <span style={{ color: strength.color }}>Strength: {strength.label}</span>
                  <span>{strength.score}/5 checks</span>
                </div>
                <div className="strength-criteria">
                  <div className={`criteria-item ${strength.checks.length ? 'met' : ''}`}>
                    <span className="criteria-icon">{strength.checks.length ? '✓' : '•'}</span> 8+ characters
                  </div>
                  <div className={`criteria-item ${strength.checks.upper ? 'met' : ''}`}>
                    <span className="criteria-icon">{strength.checks.upper ? '✓' : '•'}</span> Uppercase letter
                  </div>
                  <div className={`criteria-item ${strength.checks.lower ? 'met' : ''}`}>
                    <span className="criteria-icon">{strength.checks.lower ? '✓' : '•'}</span> Lowercase letter
                  </div>
                  <div className={`criteria-item ${strength.checks.number ? 'met' : ''}`}>
                    <span className="criteria-icon">{strength.checks.number ? '✓' : '•'}</span> Number (0-9)
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">
              Confirm Password
            </label>
            <input
              id="reg-confirm"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              className="form-input"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="form-error" role="alert" style={{ marginBottom: '1rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
          >
            Sign in here
          </a>
        </div>
      </div>
    </div>
  );
}

