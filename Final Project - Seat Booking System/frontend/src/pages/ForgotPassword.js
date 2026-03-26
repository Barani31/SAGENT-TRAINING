import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword, resetPassword } from '../api/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep]               = useState(1);
  const [mail, setMail]               = useState('');
  const [otp, setOtp]                 = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mail.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await forgotPassword(mail.trim());
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email not found');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await resetPassword(mail.trim(), otp.trim(), newPassword);
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('otp')) setStep(2);
    } finally { setLoading(false); }
  };

  const STEPS = ['Email', 'Verify OTP', 'New Password'];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-secondary)', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 44, height: 44, background: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(224,92,42,0.3)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: '#fff' }}>S</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text-primary)' }}>ShowSpot</span>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
          {STEPS.map((label, i) => {
            const stepNum  = i + 1;
            const isDone   = step > stepNum;
            const isActive = step === stepNum;
            return (
              <React.Fragment key={label}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, transition: 'var(--transition)',
                    background: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--bg-card)',
                    color: isDone || isActive ? '#fff' : 'var(--text-muted)',
                    border: `2px solid ${isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: isActive ? 'var(--accent)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: '48px', height: '2px', margin: '0 4px', marginBottom: '20px', transition: 'var(--transition)', background: step > i + 1 ? 'var(--green)' : 'var(--border)' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '36px' }}>

          {/* STEP 1 — Email */}
          {step === 1 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📧</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, marginBottom: '6px' }}>Forgot Password?</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Enter your registered email and we'll send you an OTP.</p>
              </div>
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="you@example.com"
                    value={mail} onChange={(e) => setMail(e.target.value)} required autoFocus />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
                  {loading ? 'Sending OTP...' : 'Send OTP →'}
                </button>
              </form>
            </>
          )}

          {/* STEP 2 — OTP */}
          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, marginBottom: '6px' }}>Check Your Email</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  We sent a 6-digit OTP to{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{mail}</strong>
                </p>
              </div>
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <input type="text" className="form-input"
                    placeholder="_ _ _ _ _ _"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    style={{ textAlign: 'center', fontSize: '28px', fontFamily: 'var(--font-mono)', letterSpacing: '10px', fontWeight: 700 }}
                    required autoFocus
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Valid for 10 minutes</span>
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '8px' }}>
                  Verify OTP →
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: '14px' }}>
                <button onClick={handleSendOtp} disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Sending...' : '🔄 Resend OTP'}
                </button>
              </div>
            </>
          )}

          {/* STEP 3 — New Password */}
          {step === 3 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 400, marginBottom: '6px' }}>Set New Password</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Choose a strong new password for your account.</p>
              </div>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="Min. 6 characters"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-input" placeholder="Repeat your password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  {confirmPassword && (
                    <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 600, color: newPassword === confirmPassword ? 'var(--green)' : 'var(--red)' }}>
                      {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  )}
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
                  {loading ? 'Resetting...' : 'Reset Password ✓'}
                </button>
              </form>
            </>
          )}

          {/* Back to login */}
          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <Link to="/login" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;