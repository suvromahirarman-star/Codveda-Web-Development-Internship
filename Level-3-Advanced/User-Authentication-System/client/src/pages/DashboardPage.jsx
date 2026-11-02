import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function DashboardPage({ showToast }) {
  const { user, token, decodedToken, updateProfile, changePassword } = useAuth();

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Admin Route Test State
  const [adminTestLoading, setAdminTestLoading] = useState(false);
  const [adminTestResult, setAdminTestResult] = useState(null);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await updateProfile(profileForm);
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile information has been saved successfully.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Unable to update profile.',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle Password Change (triggers session invalidation)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Please provide both your current and new password.',
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'New passwords do not match.',
      });
      return;
    }

    try {
      setChangingPassword(true);
      const res = await changePassword(currentPassword, newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setPasswordMessage({
        type: 'success',
        text: 'Password updated! Stale sessions invalidated. Fresh token acquired.',
      });
      showToast({
        type: 'success',
        title: 'Password Changed',
        message: 'New password set. All previous authentication tokens have been invalidated.',
      });
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.message || 'Failed to update password.',
      });
      showToast({
        type: 'error',
        title: 'Password Update Failed',
        message: err.message || 'Failed to change password.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Test Admin Route Access
  const handleTestAdminRoute = async () => {
    try {
      setAdminTestLoading(true);
      setAdminTestResult(null);
      const res = await api.getAdminData(token);
      setAdminTestResult({
        success: true,
        status: 200,
        data: res,
      });
    } catch (err) {
      setAdminTestResult({
        success: false,
        status: err.status || 403,
        message: err.message,
        data: err.data,
      });
    } finally {
      setAdminTestLoading(false);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleString();
    } catch {
      return isoStr;
    }
  };

  const formatTimestamp = (epochSeconds) => {
    if (!epochSeconds) return 'N/A';
    return new Date(epochSeconds * 1000).toLocaleString();
  };

  return (
    <div>
      {/* Top Welcome Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Welcome, {user?.name || 'User'}!</h1>
          <p className="dashboard-subtitle">
            Authenticated via JSON Web Tokens (JWT) &amp; persistent MongoDB Atlas storage.
          </p>
        </div>
        <div className="session-status-pill">
          <span className="status-dot" />
          <span>Live Session: Active (Atlas DB)</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Profile & Security Actions */}
        <div className="dashboard-col-left">
          {/* User Profile Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">User Account Overview</h2>
                <p className="card-subtitle">Verified identity record stored in MongoDB Atlas</p>
              </div>
              <span className={`role-tag ${user?.role || 'user'}`}>
                {user?.role}
              </span>
            </div>

            <div className="profile-meta-grid">
              <div className="meta-item">
                <div className="meta-label">Full Name</div>
                <div className="meta-value">{user?.name}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Email Address</div>
                <div className="meta-value">{user?.email}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Assigned Role</div>
                <div className="meta-value" style={{ textTransform: 'capitalize' }}>
                  {user?.role}
                </div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Token Version</div>
                <div className="meta-value">v{user?.tokenVersion ?? 0}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Account Created</div>
                <div className="meta-value">{formatDate(user?.createdAt)}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Last Login</div>
                <div className="meta-value">{formatDate(user?.lastLoginAt)}</div>
              </div>
            </div>
          </div>

          {/* Profile Update (Demonstrating Role Immutability) */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Update Profile</h2>
                <p className="card-subtitle">Test profile modifications and strict role immutability</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="profile-role">Role (Read-Only)</label>
                  <span className="form-hint">Immutable</span>
                </div>
                <input
                  id="profile-role"
                  type="text"
                  className="form-input"
                  value={user?.role || 'user'}
                  disabled
                  readOnly
                />
                <span className="form-hint" style={{ marginTop: '0.25rem', display: 'block' }}>
                  🛡️ Role cannot be modified by user profiles. Backend whitelists only name and email.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                disabled={updatingProfile}
              >
                {updatingProfile ? (
                  <>
                    <span className="spinner spinner-primary" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </form>
          </div>

          {/* Password Change (Demonstrating Session Invalidation) */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Change Password</h2>
                <p className="card-subtitle">Demonstrates tokenVersion session invalidation</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="curr-pass">Current Password</label>
                <input
                  id="curr-pass"
                  type="password"
                  autoComplete="current-password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-pass">New Password</label>
                <input
                  id="new-pass"
                  type="password"
                  autoComplete="new-password"
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="conf-new-pass">Confirm New Password</label>
                <input
                  id="conf-new-pass"
                  type="password"
                  autoComplete="new-password"
                  className="form-input"
                  placeholder="Repeat new password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  required
                />
              </div>

              {passwordMessage && (
                <div
                  className={`admin-tester-result ${passwordMessage.type === 'success' ? 'success' : 'forbidden'}`}
                  style={{ marginBottom: '1rem' }}
                >
                  {passwordMessage.text}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <span className="spinner" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password & Revoke Old Sessions'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: JWT Inspector & Role Authorization Tester */}
        <div className="dashboard-col-right">
          {/* JWT Token Claims Inspector */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Live JWT Claims Inspector</h2>
                <p className="card-subtitle">Decoded from the active in-memory Bearer token</p>
              </div>
            </div>

            <div className="claims-box">
              <span className="claims-comment">// Decoded JWT Payload Claims</span>
              <br />
              {'{'}
              <br />
              &nbsp;&nbsp;<span className="claims-key">"id"</span>: <span className="claims-string">"{decodedToken?.id}"</span>,
              <br />
              &nbsp;&nbsp;<span className="claims-key">"role"</span>: <span className="claims-string">"{decodedToken?.role}"</span>,
              <br />
              &nbsp;&nbsp;<span className="claims-key">"tokenVersion"</span>: <span className="claims-number">{decodedToken?.tokenVersion ?? '0'}</span>,
              <br />
              &nbsp;&nbsp;<span className="claims-key">"iat"</span>: <span className="claims-number">{decodedToken?.iat}</span>, <span className="claims-comment">/* {formatTimestamp(decodedToken?.iat)} */</span>
              <br />
              &nbsp;&nbsp;<span className="claims-key">"exp"</span>: <span className="claims-number">{decodedToken?.exp}</span>  <span className="claims-comment">/* {formatTimestamp(decodedToken?.exp)} */</span>
              <br />
              {'}'}
            </div>

            <div className="claims-pill-group">
              <span className="claims-pill">Algorithm: <strong>HS256</strong></span>
              <span className="claims-pill">Token Type: <strong>Bearer</strong></span>
              <span className="claims-pill">Storage: <strong>In-Memory + Session</strong></span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.875rem' }}>
              💡 <strong>How session invalidation works:</strong> When a user changes their password, the backend increments <code>tokenVersion</code> on their MongoDB document. Any older JWT carrying a previous version is instantly rejected with <code>401 Unauthorized</code> without requiring a centralized token blacklist.
            </p>
          </div>

          {/* Role-Based Access Control (RBAC) Tester */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">RBAC Route Tester</h2>
                <p className="card-subtitle">Test server-side role authorization middleware</p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Click the button below to test the protected endpoint:
              <br />
              <code style={{ background: '#f1f5f9', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                GET /api/auth/admin-only
              </code>
            </p>

            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={handleTestAdminRoute}
              disabled={adminTestLoading}
            >
              {adminTestLoading ? (
                <>
                  <span className="spinner spinner-primary" />
                  Testing Authorization...
                </>
              ) : (
                'Trigger Admin Protected Route'
              )}
            </button>

            {adminTestResult && (
              <div className={`admin-tester-result ${adminTestResult.success ? 'success' : 'forbidden'}`}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                  HTTP {adminTestResult.status} {adminTestResult.success ? 'OK (Authorized)' : 'Forbidden (Access Denied)'}
                </div>
                <div>
                  {adminTestResult.success ? (
                    <span>Admin secret accessed: <em>{adminTestResult.data?.message}</em></span>
                  ) : (
                    <span>
                      {adminTestResult.message || 'Access denied. Only users with the admin role can access this resource.'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

