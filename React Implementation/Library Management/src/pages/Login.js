import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:8080/api';

export default function Login() {
  const { login } = useAuth();
  const [tab, setTab]             = useState('login');
  const [loginType, setLoginType] = useState('member');
  const [category, setCategory]   = useState('Student');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm]     = useState({ name: '', email: '', password: '', confirmPassword: '', address: '', phNo: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${BASE}/members`);
      const data = await res.json();
      const arr  = Array.isArray(data) ? data : [];

      const found = arr.find(m => m.email === loginForm.email && m.password === loginForm.password);
      if (!found) { setError('Invalid email or password.'); setLoading(false); return; }

      const isLibrarian = found.role?.toLowerCase() === 'librarian';

      if (loginType === 'librarian' && !isLibrarian) {
        setError('You are not registered as a Librarian.'); setLoading(false); return;
      }
      if (loginType === 'member' && isLibrarian) {
        setError('You are a Librarian. Please select Librarian to login.'); setLoading(false); return;
      }

      login({ ...found, role: isLibrarian ? 'librarian' : 'member' });
    } catch {
      setError('Cannot connect to server. Is the backend running on port 8080?');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!regForm.name || !regForm.email || !regForm.password) { setError('Please fill all required fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.name, email: regForm.email, password: regForm.password,
          address: regForm.address, phNo: regForm.phNo, category: category,
        }),
      });
      const data = await res.json();
      login({ ...data, role: 'member' });
    } catch {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 16, padding: 40, boxShadow: '0 4px 24px rgba(30,58,47,0.10)', border: '1px solid #e0d8d0' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📚</div>
          <div style={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 700, color: '#1e3a2f' }}>Library System</div>
          <div style={{ fontSize: 13, color: '#9a8f85', marginTop: 4 }}>
            {tab === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f2ede8', borderRadius: 8, padding: 4, marginBottom: 20 }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                background: tab === t ? 'white' : 'none',
                color: tab === t ? '#1e3a2f' : '#9a8f85',
                boxShadow: tab === t ? '0 1px 4px rgba(30,58,47,0.08)' : 'none',
                transition: 'all 0.15s' }}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Login type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[['member','🎓','Member','Student or Staff'], ['librarian','📋','Librarian','Manage inventory']].map(([type, icon, name, desc]) => (
            <div key={type} onClick={() => { setLoginType(type); setError(''); }}
              style={{ border: `2px solid ${loginType === type ? '#1e3a2f' : '#e0d8d0'}`,
                borderRadius: 10, padding: 14, cursor: 'pointer', textAlign: 'center',
                background: loginType === type ? '#eef5f0' : 'white', transition: 'all 0.15s' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a2f' }}>{name}</div>
              <div style={{ fontSize: 11, color: '#9a8f85', marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* SIGN IN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input autoComplete="off" className="form-input" type="email" placeholder="you@example.com"
                value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input autoComplete="off" className="form-input" type="password" placeholder="••••••••"
                value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
              {loading ? 'Signing in...' : `Sign In as ${loginType === 'librarian' ? 'Librarian' : 'Member'}`}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            {loginType === 'librarian'
              ? <div className="alert alert-amber">Librarians are already registered. Please Sign In instead.</div>
              : (
              <>
                <div className="form-group">
                  <label className="form-label">I am a *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[['Student','🎓'], ['Staff','👔']].map(([cat, icon]) => (
                      <div key={cat} onClick={() => setCategory(cat)}
                        style={{ border: `2px solid ${category === cat ? '#c8832a' : '#e0d8d0'}`,
                          borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: category === cat ? '#fdf3e3' : 'white', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: 18 }}>{icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input autoComplete="off" className="form-input" placeholder="Your full name"
                    value={regForm.name} onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input autoComplete="off" className="form-input" type="email" placeholder="you@example.com"
                    value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input autoComplete="off" className="form-input" placeholder="10-digit phone"
                    value={regForm.phNo} onChange={e => setRegForm(p => ({ ...p, phNo: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input autoComplete="off" className="form-input" placeholder="Your address"
                    value={regForm.address} onChange={e => setRegForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Password *</label>
                    <input autoComplete="off" className="form-input" type="password" placeholder="••••••••"
                      value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Confirm Password *</label>
                    <input autoComplete="off" className="form-input" type="password" placeholder="••••••••"
                      value={regForm.confirmPassword} onChange={e => setRegForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
                  </div>
                </div>
                <button className="btn btn-amber" type="submit" disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 4 }}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
