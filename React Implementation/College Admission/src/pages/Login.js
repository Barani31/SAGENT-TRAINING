import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:8080/api';

export default function Login() {
  const { login } = useAuth();
  const [tab, setTab]     = useState('login');   // login | register
  const [role, setRole]   = useState('student'); // student | officer
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phnNo: '', dob: '', gender: '', address: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const endpoint = role === 'student' ? `${BASE}/students` : `${BASE}/officers`;
      const res  = await fetch(endpoint);
      if (!res.ok) { setError('Could not connect to server.'); setLoading(false); return; }
      const data = await res.json();
      // FIXED
      const found = data.find(u =>
        (u.email === loginForm.email || u.mail === loginForm.email) && u.password === loginForm.password
      );
      if (found) {
        login({ ...found, role });
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      const endpoint = role === 'student' ? `${BASE}/students` : `${BASE}/officers`;
      const body = role === 'student'
        ? {
            name: regForm.name,
            email: regForm.email,
            password: regForm.password,
            phnNo: regForm.phnNo,
            dob: regForm.dob,
            gender: regForm.gender,
            address: regForm.address,
          }
        : {
            name: regForm.name,
            mail: regForm.email,
            password: regForm.password,
            phnNo: regForm.phnNo,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        setError(`Registration failed: ${errText || res.statusText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      login({ ...data, role });
    } catch (err) {
      setError('Could not connect to server. Is the backend running?');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
      padding: '40px 16px',
    }}>
      <div className="auth-box">
        <h1 className="auth-heading">
          {tab === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="auth-sub">
          {tab === 'login' ? 'Sign in to your account' : 'Join EduApply today'}
        </p>

        {/* Login / Register tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          <div
            className={`role-card ${role === 'student' ? 'selected' : ''}`}
            onClick={() => setRole('student')}
          >
            <div className="role-icon">🎓</div>
            <div className="role-name">Student</div>
            <div className="role-desc">Apply for courses</div>
          </div>
          <div
            className={`role-card ${role === 'officer' ? 'selected' : ''}`}
            onClick={() => setRole('officer')}
          >
            <div className="role-icon">🏛️</div>
            <div className="role-name">Officer</div>
            <div className="role-desc">Manage applications</div>
          </div>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                autoComplete="off"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                autoComplete="off"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : `Sign In as ${role === 'student' ? 'Student' : 'Officer'}`}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                autoComplete="off"
                className="form-input"
                placeholder="Your full name"
                value={regForm.name}
                onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                autoComplete="off"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={regForm.email}
                onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                autoComplete="off"
                className="form-input"
                placeholder="10-digit phone number"
                value={regForm.phnNo}
                onChange={e => setRegForm(p => ({ ...p, phnNo: e.target.value }))}
                required
              />
            </div>
            {role === 'student' && (
              <>
                <div className="form-row">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date of Birth</label>
                    <input
                      autoComplete="off"
                      className="form-input"
                      type="date"
                      value={regForm.dob}
                      onChange={e => setRegForm(p => ({ ...p, dob: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Gender</label>
                    <select
                      className="form-input"
                      value={regForm.gender}
                      onChange={e => setRegForm(p => ({ ...p, gender: e.target.value }))}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    autoComplete="off"
                    className="form-input"
                    placeholder="Your address"
                    value={regForm.address}
                    onChange={e => setRegForm(p => ({ ...p, address: e.target.value }))}
                    required
                  />
                </div>
              </>
            )}
            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password</label>
                <input
                  autoComplete="off"
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={regForm.password}
                  onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirm Password</label>
                <input
                  autoComplete="off"
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={regForm.confirmPassword}
                  onChange={e => setRegForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            </div>
            <button
              className="btn btn-gold"
              type="submit"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
