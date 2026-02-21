import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BASE = 'http://localhost:8080/api';

export default function Login() {
  const { login } = useAuth();
  const [tab, setTab]         = useState('register');
  const [form, setForm]       = useState({ name: '', mail: '', password: '', confirmPassword: '', phnNo: '', address: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clear     = () => { setError(''); setSuccess(''); };
  const emptyForm = () => setForm({ name: '', mail: '', password: '', confirmPassword: '', phnNo: '', address: '' });

  const handleRegister = async () => {
    clear();
    if (!form.name || !form.mail || !form.password) { setError('Name, email and password are required.'); return; }
    if (form.password !== form.confirmPassword)      { setError('Passwords do not match.'); return; }
    if (form.password.length < 4)                   { setError('Password must be at least 4 characters.'); return; }
    setLoading(true);
    try {
      await axios.post(`${BASE}/customers`, {
        name: form.name, mail: form.mail,
        password: form.password, phnNo: form.phnNo, address: form.address,
      });
      setSuccess('Account created! You can now sign in.');
      emptyForm();
      setTimeout(() => { setTab('login'); setSuccess(''); }, 1600);
    } catch { setError('Registration failed. Email may already be in use.'); }
    finally { setLoading(false); }
  };

  const handleLogin = async () => {
    clear();
    if (!form.mail || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE}/auth/login`, { mail: form.mail, password: form.password });
      login(res.data);
    } catch { setError('Invalid email or password.'); }
    finally { setLoading(false); }
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff7ed 0%, #fafaf9 60%, #fed7aa 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    },
    card: {
      background: '#ffffff', borderRadius: 18, padding: '48px 44px',
      width: 460, maxWidth: '94vw',
      boxShadow: '0 8px 40px rgba(249,115,22,0.13)',
      border: '1px solid #fed7aa',
    },
    logo: { fontSize: 32, textAlign: 'center', marginBottom: 6 },
    title: { fontFamily: "'Playfair Display', serif", fontSize: 26, color: '#1c1917', textAlign: 'center', marginBottom: 4 },
    titleSub: { textAlign: 'center', color: '#a8a29e', fontSize: 13, marginBottom: 28 },
    tabs: {
      display: 'flex', borderRadius: 10, background: '#fafaf9',
      border: '1.5px solid #e7e5e4', marginBottom: 24, overflow: 'hidden',
    },
    tabBtn: (active) => ({
      flex: 1, padding: '11px', border: 'none', fontSize: 13, fontWeight: 700,
      cursor: 'pointer', transition: 'all 0.15s',
      background: active ? '#f97316' : 'transparent',
      color: active ? 'white' : '#78716c',
    }),
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#78716c', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #e7e5e4', borderRadius: 8, fontSize: 14, background: '#fafaf9', color: '#1c1917', marginBottom: 14, boxSizing: 'border-box', outline: 'none' },
    row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
    btn: {
      width: '100%', padding: '13px', background: '#f97316',
      color: 'white', border: 'none', borderRadius: 9,
      fontSize: 14, fontWeight: 700, marginTop: 4, cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
      opacity: loading ? 0.7 : 1,
    },
    error:   { background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14, textAlign: 'center' },
    success: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14, textAlign: 'center' },
    switchText: { textAlign: 'center', color: '#a8a29e', fontSize: 13, marginTop: 18, paddingTop: 16, borderTop: '1px solid #e7e5e4' },
    switchLink: { color: '#f97316', fontWeight: 700, cursor: 'pointer', marginLeft: 4 },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.logo}>🛒</div>
        <div style={s.title}>Grocery Delivery</div>
        <div style={s.titleSub}>Fresh groceries delivered to your door</div>

        <div style={s.tabs}>
          <button style={s.tabBtn(tab === 'register')} onClick={() => { setTab('register'); clear(); emptyForm(); }}>Create Account</button>
          <button style={s.tabBtn(tab === 'login')}    onClick={() => { setTab('login');    clear(); emptyForm(); }}>Sign In</button>
        </div>

        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>✅ {success}</div>}

        {tab === 'register' && (
          <>
            <label style={s.label}>Full Name</label>
            <input style={s.input} autoComplete="off" placeholder="Your full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />

            <label style={s.label}>Email</label>
            <input style={s.input} autoComplete="off" type="email" placeholder="your@email.com" value={form.mail} onChange={e => setForm({...form, mail: e.target.value})} />

            <div style={s.row2}>
              <div>
                <label style={s.label}>Password</label>
                <input style={s.input} type="password" autoComplete="new-password" placeholder="Min 4 chars" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div>
                <label style={s.label}>Confirm</label>
                <input style={s.input} type="password" autoComplete="new-password" placeholder="Re-enter" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
              </div>
            </div>

            <label style={s.label}>Phone Number</label>
            <input style={s.input} autoComplete="off" placeholder="e.g. 9876543210" value={form.phnNo} onChange={e => setForm({...form, phnNo: e.target.value})} />

            <label style={s.label}>Delivery Address</label>
            <input style={s.input} autoComplete="off" placeholder="Your address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />

            <button style={s.btn} onClick={handleRegister} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
            <div style={s.switchText}>Already have an account?<span style={s.switchLink} onClick={() => { setTab('login'); clear(); emptyForm(); }}>Sign In</span></div>
          </>
        )}

        {tab === 'login' && (
          <>
            <label style={s.label}>Email</label>
            <input style={s.input} autoComplete="off" type="email" placeholder="your@email.com" value={form.mail} onChange={e => setForm({...form, mail: e.target.value})} />

            <label style={s.label}>Password</label>
            <input style={s.input} type="password" autoComplete="off" placeholder="Your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleLogin()} />

            <button style={s.btn} onClick={handleLogin} disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
            <div style={s.switchText}>New here?<span style={s.switchLink} onClick={() => { setTab('register'); clear(); emptyForm(); }}>Create an account</span></div>
          </>
        )}

      </div>
    </div>
  );
}