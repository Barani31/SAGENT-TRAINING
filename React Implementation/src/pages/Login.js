import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const s = {
  page: {
    minHeight: '100vh', background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    background: 'var(--white)', borderRadius: 16, padding: '44px 40px',
    boxShadow: '0 4px 32px rgba(33,150,243,0.13)', width: 400,
  },
  brand: {
    fontFamily: "'DM Serif Display', serif", fontSize: 26,
    color: 'var(--blue-600)', marginBottom: 4, textAlign: 'center',
  },
  sub: { textAlign: 'center', color: 'var(--text-light)', fontSize: 13, marginBottom: 32 },
  tabs: { display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--border)', marginBottom: 28 },
  tab: (active) => ({
    flex: 1, padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    background: active ? 'var(--blue-500)' : 'var(--white)',
    color: active ? 'white' : 'var(--text-mid)',
  }),
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: {
    width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)',
    borderRadius: 8, fontSize: 14, outline: 'none', background: 'var(--bg)',
    color: 'var(--text-dark)', marginBottom: 16,
  },
  btn: {
    width: '100%', padding: '12px', background: 'var(--blue-500)', color: 'white',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  error: { color: '#e53e3e', fontSize: 13, textAlign: 'center', marginBottom: 12 },
};

export default function Login() {
  const { login } = useAuth();
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      const data = role === 'patient'
        ? await authApi.patientLogin(form)
        : await authApi.doctorLogin(form);
      login(data);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>Patient Monitor</div>
        <div style={s.sub}>Health Management System — Sign In</div>

        <div style={s.tabs}>
          <button style={s.tab(role === 'patient')} onClick={() => setRole('patient')}>Patient</button>
          <button style={s.tab(role === 'doctor')} onClick={() => setRole('doctor')}>Doctor</button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <label style={s.label}>Email</label>
        <input style={s.input} type="email" placeholder="Enter your email"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

        <label style={s.label}>Password</label>
        <input style={s.input} type="password" placeholder="Enter your password"
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : `Sign in as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
        </button>
      </div>
    </div>
  );
}