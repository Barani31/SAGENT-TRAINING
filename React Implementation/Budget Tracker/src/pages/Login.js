import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BASE = 'http://localhost:8080/api';

export default function Login() {
  const { login } = useAuth();
  const [tab, setTab]         = useState('register');
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clear     = () => { setError(''); setSuccess(''); };
  const emptyForm = () => setForm({ name: '', email: '', password: '', confirmPassword: '' });

  const handleRegister = async () => {
    clear();
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password !== form.confirmPassword)       { setError('Passwords do not match.'); return; }
    if (form.password.length < 4)                    { setError('Password must be at least 4 characters.'); return; }

    setLoading(true);
    try {
      await axios.post(`${BASE}/users`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess('Account created! You can now sign in.');
      emptyForm();
      setTimeout(() => { setTab('login'); setSuccess(''); }, 1600);
    } catch {
      setError('Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    clear();
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE}/auth/login`, {
        email: form.email,
        password: form.password,
      });
      login(res.data);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #edf7f0 0%, #f4f7f6 60%, #c6e8d0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    card: {
      background: '#ffffff', borderRadius: 18, padding: '44px 40px',
      width: 440, maxWidth: '94vw',
      boxShadow: '0 8px 40px rgba(56,161,105,0.14)',
      border: '1px solid #c6e8d0',
    },
    brand: {
      fontFamily: "'DM Serif Display', serif", fontSize: 28,
      color: '#276749', textAlign: 'center', marginBottom: 4,
    },
    brandSub: { textAlign: 'center', color: '#a0aec0', fontSize: 13, marginBottom: 28 },
    tabs: {
      display: 'flex', borderRadius: 10, background: '#edf7f0',
      border: '1.5px solid #c6e8d0', marginBottom: 28, overflow: 'hidden',
    },
    tabBtn: (active) => ({
      flex: 1, padding: '11px', border: 'none', fontSize: 13, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.15s',
      background: active ? '#38a169' : 'transparent',
      color: active ? 'white' : '#718096',
    }),
    label: {
      display: 'block', fontSize: 11, fontWeight: 700, color: '#718096',
      marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
    },
    input: {
      width: '100%', padding: '11px 14px',
      border: '1.5px solid #c6e8d0', borderRadius: 8,
      fontSize: 14, background: '#f7fdf9', color: '#2d3748',
      marginBottom: 14, boxSizing: 'border-box',
    },
    btn: {
      width: '100%', padding: '13px', background: '#38a169',
      color: 'white', border: 'none', borderRadius: 9,
      fontSize: 14, fontWeight: 700, marginTop: 4, cursor: 'pointer',
      boxShadow: '0 3px 12px rgba(56,161,105,0.3)',
      opacity: loading ? 0.7 : 1,
    },
    error: {
      background: '#fff5f5', color: '#c53030',
      border: '1px solid #fed7d7', borderRadius: 8,
      padding: '10px 14px', fontSize: 13, marginBottom: 14, textAlign: 'center',
    },
    success: {
      background: '#edf7f0', color: '#276749',
      border: '1px solid #c6e8d0', borderRadius: 8,
      padding: '10px 14px', fontSize: 13, marginBottom: 14, textAlign: 'center',
    },
    switchText: {
      textAlign: 'center', color: '#a0aec0',
      fontSize: 13, marginTop: 20, paddingTop: 18,
      borderTop: '1px solid #c6e8d0',
    },
    switchLink: {
      color: '#38a169', fontWeight: 600, cursor: 'pointer',
      textDecoration: 'underline', marginLeft: 4,
    },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.brand}>💰 Budget Tracker</div>
        <div style={s.brandSub}>Personal Finance Manager</div>

        {/* Create Account / Sign In tabs */}
        <div style={s.tabs}>
          <button style={s.tabBtn(tab === 'register')}
            onClick={() => { setTab('register'); clear(); emptyForm(); }}>
            Create Account
          </button>
          <button style={s.tabBtn(tab === 'login')}
            onClick={() => { setTab('login'); clear(); emptyForm(); }}>
            Sign In
          </button>
        </div>

        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>✅ {success}</div>}

        {/* ── REGISTER ── */}
        {tab === 'register' && (
          <>
            <label style={s.label}>Full Name</label>
            <input
              style={s.input} type="text"
              placeholder="Enter your full name"
              autoComplete="off"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <label style={s.label}>Email</label>
            <input
              style={s.input} type="email"
              placeholder="Enter your email"
              autoComplete="off"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <label style={s.label}>Password</label>
            <input
              style={s.input} type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />

            <label style={s.label}>Confirm Password</label>
            <input
              style={s.input} type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />

            <button style={s.btn} onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div style={s.switchText}>
              Already have an account?
              <span style={s.switchLink} onClick={() => { setTab('login'); clear(); emptyForm(); }}>
                Sign In
              </span>
            </div>
          </>
        )}

        {/* ── LOGIN ── */}
        {tab === 'login' && (
          <>
            <label style={s.label}>Email</label>
            <input
              style={s.input} type="email"
              placeholder="Enter your email"
              autoComplete="off"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <label style={s.label}>Password</label>
            <input
              style={s.input} type="password"
              placeholder="Enter your password"
              autoComplete="off"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />

            <button style={s.btn} onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div style={s.switchText}>
              New here?
              <span style={s.switchLink} onClick={() => { setTab('register'); clear(); emptyForm(); }}>
                Create an account
              </span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}