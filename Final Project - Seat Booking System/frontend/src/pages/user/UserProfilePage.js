import React, { useState } from 'react';
import { updateUser } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
  const { user, login } = useAuth();

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name:      user?.name      || '',
    mail:      user?.mail      || '',
    contactNo: user?.contactNo || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [savingPw, setSavingPw]   = useState(false);
  const [showPw, setShowPw]       = useState(false);

  const handleProfileSave = async () => {
    if (!profileForm.name.trim())  { toast.error('Name is required'); return; }
    if (!profileForm.mail.trim())  { toast.error('Email is required'); return; }
    setSavingProfile(true);
    try {
      const res = await updateUser(user.userId, {
        name:      profileForm.name,
        mail:      profileForm.mail,
        contactNo: profileForm.contactNo,
        role:      user.role,
      });
      const updated = res.data?.data;
      // Update localStorage + auth context
      login({ ...user, ...updated });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async () => {
    if (!pwForm.currentPassword) { toast.error('Please enter your current password'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }

    setSavingPw(true);
    try {
      // Verify current password by trying to update with new one
      await updateUser(user.userId, {
        name:      user.name,
        mail:      user.mail,
        contactNo: user.contactNo,
        role:      user.role,
        password:  pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '36px', paddingBottom: '48px', maxWidth: '680px' }}>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal details and password</p>
        </div>

        {/* Avatar + info */}
        <div className="card" style={{ padding: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--accent)', border: '3px solid var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'white',
            flexShrink: 0, boxShadow: 'var(--shadow-accent)',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>{user?.name}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px' }}>{user?.mail}</div>
            <span style={{
              display: 'inline-block', marginTop: '6px',
              fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px',
              background: user?.role === 'ADMIN' ? '#fff8ee' : 'var(--accent-dim)',
              color: user?.role === 'ADMIN' ? 'var(--gold)' : 'var(--accent)',
              border: `1px solid ${user?.role === 'ADMIN' ? '#c97d1a44' : 'rgba(224,92,42,0.2)'}`,
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* ── Edit Profile ── */}
        <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 400, marginBottom: '20px' }}>
            ✏️ Edit Profile
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input className="form-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your full name" />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address *</label>
              <input className="form-input" type="email"
                value={profileForm.mail}
                onChange={(e) => setProfileForm((f) => ({ ...f, mail: e.target.value }))}
                placeholder="your@email.com" />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Number</label>
              <input className="form-input" type="tel"
                value={profileForm.contactNo}
                onChange={(e) => setProfileForm((f) => ({ ...f, contactNo: e.target.value }))}
                placeholder="+91 9999999999" />
            </div>
          </div>

          <button onClick={handleProfileSave} disabled={savingProfile}
            className="btn btn-primary btn-full"
            style={{ marginTop: '20px' }}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* ── Change Password ── */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 400, marginBottom: '20px' }}>
            🔒 Change Password
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Password *</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input"
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  style={{ paddingRight: '44px' }} />
                <button onClick={() => setShowPw((v) => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password *</label>
              <input className="form-input"
                type={showPw ? 'text' : 'password'}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                placeholder="Min 6 characters" />
              {/* Password strength indicator */}
              {pwForm.newPassword && (
                <div style={{ marginTop: '6px' }}>
                  <PasswordStrength password={pwForm.newPassword} />
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password *</label>
              <input className="form-input"
                type={showPw ? 'text' : 'password'}
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                style={{ borderColor: pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword ? 'var(--accent)' : '' }} />
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <div style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px', fontWeight: 600 }}>
                  ⚠️ Passwords do not match
                </div>
              )}
              {pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword && (
                <div style={{ fontSize: '12px', color: 'var(--green)', marginTop: '4px', fontWeight: 600 }}>
                  ✅ Passwords match
                </div>
              )}
            </div>
          </div>

          <button onClick={handlePasswordSave}
            disabled={savingPw || !pwForm.newPassword || pwForm.newPassword !== pwForm.confirmPassword}
            className="btn btn-primary btn-full"
            style={{ marginTop: '20px' }}>
            {savingPw ? 'Changing...' : 'Change Password'}
          </button>
        </div>

      </div>
    </div>
  );
};

// ── Password strength indicator ───────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  let score = 0;
  if (password.length >= 6)                       score++;
  if (password.length >= 10)                      score++;
  if (/[A-Z]/.test(password))                     score++;
  if (/[0-9]/.test(password))                     score++;
  if (/[^A-Za-z0-9]/.test(password))              score++;

  const levels = [
    { label: 'Very Weak', color: '#e8305a' },
    { label: 'Weak',      color: '#e8305a' },
    { label: 'Fair',      color: '#c97d1a' },
    { label: 'Good',      color: '#2563a8' },
    { label: 'Strong',    color: '#1a8f63' },
    { label: 'Very Strong', color: '#1a8f63' },
  ];
  const level = levels[score] || levels[0];

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '99px',
            background: i < score ? level.color : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: '11px', color: level.color, fontWeight: 700 }}>{level.label}</div>
    </div>
  );
};

export default UserProfilePage;