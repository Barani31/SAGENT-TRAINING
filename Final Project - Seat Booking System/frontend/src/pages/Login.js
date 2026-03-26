import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm]       = useState({ mail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res      = await loginUser(form);
      const userData = res.data?.data;
      if (!userData || !userData.userId) throw new Error('Invalid response from server');
      login(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(userData.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-secondary)', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: 48, height: 48, background: 'var(--accent)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(224,92,42,0.35)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: '#fff' }}>S</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>ShowSpot</span>
          </div>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎭</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Movies, concerts &amp; live events</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '36px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="mail" type="email" className="form-input"
                placeholder="you@example.com"
                value={form.mail} onChange={handle}
                required autoFocus
              />
            </div>

            <div className="form-group">
              {/* Label row with Forgot Password link */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                name="password" type="password" className="form-input"
                placeholder="Enter your password"
                value={form.password} onChange={handle}
                required
              />
            </div>

            <button
              type="submit" className="btn btn-primary btn-full btn-lg"
              disabled={loading} style={{ marginTop: '8px' }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>Create one free</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;