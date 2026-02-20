import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import axios from 'axios';

const BASE = 'http://localhost:8080/api';

export default function Login() {
  const { login } = useAuth();
  const [tab, setTab]     = useState('register');
  const [role, setRole]   = useState('patient');
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirmPassword: '', age: '', gender: '', phnNo: '', address: '', specialization: '', contactNo: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clear    = () => { setError(''); setSuccess(''); };
  const emptyForm = () => setForm({ name: '', email: '', password: '', confirmPassword: '', age: '', gender: '', phnNo: '', address: '', specialization: '', contactNo: '' });

  const handleRegister = async () => {
    clear();
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); return; }
    if (form.password !== form.confirmPassword)       { setError('Passwords do not match.'); return; }
    if (form.password.length < 4)                    { setError('Password must be at least 4 characters.'); return; }

    setLoading(true);
    try {
      if (role === 'patient') {
        await axios.post(`${BASE}/patients`, {
          name: form.name,
          mail: form.email,
          password: form.password,
          age: form.age ? parseInt(form.age) : null,
          gender: form.gender,
          phnNo: form.phnNo,
          address: form.address,
        });
      } else {
        await axios.post(`${BASE}/doctors`, {
          name: form.name,
          email: form.email,
          password: form.password,
          specialization: form.specialization,
          contactNo: form.contactNo,
        });
      }
      setSuccess(`${role === 'patient' ? 'Patient' : 'Doctor'} account created! You can now sign in.`);
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
      const data = role === 'patient'
        ? await authApi.patientLogin({ email: form.email, password: form.password })
        : await authApi.doctorLogin({ email: form.email, password: form.password });
      login(data);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f4fd 0%, #f4f8ff 60%, #c8e6f9 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    card: {
      background: '#ffffff', borderRadius: 18, padding: '40px 38px',
      width: 480, maxWidth: '94vw',
      boxShadow: '0 8px 40px rgba(33,150,243,0.13)',
      border: '1px solid #e3f0fb',
    },
    brand: {
      fontFamily: "'DM Serif Display', serif", fontSize: 26,
      color: '#1565c0', textAlign: 'center', marginBottom: 4,
    },
    brandSub: { textAlign: 'center', color: '#90a4ae', fontSize: 13, marginBottom: 24 },
    tabs: {
      display: 'flex', borderRadius: 10, background: '#f0f7ff',
      border: '1.5px solid #c8e0f8', marginBottom: 20, overflow: 'hidden',
    },
    tabBtn: (active) => ({
      flex: 1, padding: '10px', border: 'none', fontSize: 13, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.15s',
      background: active ? '#1976d2' : 'transparent',
      color: active ? 'white' : '#546e7a',
    }),
    roleRow: { display: 'flex', gap: 10, marginBottom: 20 },
    roleBtn: (active) => ({
      flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.15s',
      border: active ? '2px solid #1976d2' : '2px solid #e0e0e0',
      background: active ? '#e3f2fd' : '#fafafa',
      color: active ? '#1565c0' : '#78909c',
    }),
    label: {
      display: 'block', fontSize: 11, fontWeight: 700, color: '#78909c',
      marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
    },
    input: {
      width: '100%', padding: '10px 13px',
      border: '1.5px solid #d0e8f8', borderRadius: 8,
      fontSize: 14, background: '#f7fbff', color: '#263238',
      marginBottom: 13, boxSizing: 'border-box',
    },
    row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    btn: {
      width: '100%', padding: '13px', background: '#1976d2',
      color: 'white', border: 'none', borderRadius: 9,
      fontSize: 14, fontWeight: 700, marginTop: 4, cursor: 'pointer',
      boxShadow: '0 3px 12px rgba(25,118,210,0.25)',
      opacity: loading ? 0.7 : 1,
    },
    error: {
      background: '#fff5f5', color: '#c53030',
      border: '1px solid #fed7d7', borderRadius: 8,
      padding: '10px 14px', fontSize: 13, marginBottom: 14, textAlign: 'center',
    },
    success: {
      background: '#e8f5e9', color: '#2e7d32',
      border: '1px solid #c8e6c9', borderRadius: 8,
      padding: '10px 14px', fontSize: 13, marginBottom: 14, textAlign: 'center',
    },
    switchText: {
      textAlign: 'center', color: '#90a4ae',
      fontSize: 13, marginTop: 18, paddingTop: 16,
      borderTop: '1px solid #e3f0fb',
    },
    switchLink: {
      color: '#1976d2', fontWeight: 600, cursor: 'pointer',
      textDecoration: 'underline', marginLeft: 4,
    },
  };

  // Reusable input builder — autoComplete="off" on all
  const field = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label style={s.label}>{label}</label>
      <input
        style={s.input}
        type={type}
        placeholder={placeholder}
        autoComplete="off"
        value={form[key] || ''}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.brand}>🏥 Patient Monitor</div>
        <div style={s.brandSub}>Health Management System</div>

        {/* Create Account / Sign In tabs */}
        <div style={s.tabs}>
          <button style={s.tabBtn(tab === 'register')} onClick={() => { setTab('register'); clear(); emptyForm(); }}>
            Create Account
          </button>
          <button style={s.tabBtn(tab === 'login')} onClick={() => { setTab('login'); clear(); emptyForm(); }}>
            Sign In
          </button>
        </div>

        {/* Patient / Doctor role */}
        <div style={s.roleRow}>
          <button style={s.roleBtn(role === 'patient')} onClick={() => { setRole('patient'); clear(); }}>
            🧑‍⚕️ Patient
          </button>
          <button style={s.roleBtn(role === 'doctor')} onClick={() => { setRole('doctor'); clear(); }}>
            👨‍⚕️ Doctor
          </button>
        </div>

        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>✅ {success}</div>}

        {/* ── REGISTER ── */}
        {tab === 'register' && (
          <>
            {field('Full Name', 'name', 'text', 'Enter your full name')}
            {field('Email', 'email', 'email', 'Enter your email')}

            <div style={s.row2}>
              <div>
                <label style={s.label}>Password</label>
                <input
                  style={s.input} type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <label style={s.label}>Confirm Password</label>
                <input
                  style={s.input} type="password"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            {/* Patient-only extra fields */}
            {role === 'patient' && (
              <>
                <div style={s.row2}>
                  <div>
                    <label style={s.label}>Age</label>
                    <input
                      style={s.input} type="number"
                      placeholder="e.g. 28"
                      autoComplete="off"
                      value={form.age}
                      onChange={e => setForm({ ...form, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Gender</label>
                    <select style={s.input} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                {field('Phone Number', 'phnNo', 'tel', 'e.g. 9876543210')}
                {field('Address', 'address', 'text', 'Your address')}
              </>
            )}

            {/* Doctor-only extra fields */}
            {role === 'doctor' && (
              <>
                {field('Specialization', 'specialization', 'text', 'e.g. Cardiologist')}
                {field('Contact Number', 'contactNo', 'tel', 'e.g. 9876543210')}
              </>
            )}

            <button style={s.btn} onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating Account...' : `Register as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
            </button>

            <div style={s.switchText}>
              Already have an account?
              <span style={s.switchLink} onClick={() => { setTab('login'); clear(); emptyForm(); }}>Sign In</span>
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
              {loading ? 'Signing In...' : `Sign In as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
            </button>

            <div style={s.switchText}>
              New here?
              <span style={s.switchLink} onClick={() => { setTab('register'); clear(); emptyForm(); }}>Create an account</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}