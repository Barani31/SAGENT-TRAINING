import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../api/api';

const Register = () => {
  const [form, setForm] = useState({
    name: '', mail: '', contactNo: '', password: '', confirmPassword: '', role: 'USER',
  });
  const [loading, setLoading]       = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'mail') setEmailError(''); // clear error when user edits email
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await registerUser(payload);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg    = err.response?.data?.message || '';
      const status = err.response?.status;

      if (status === 409 || msg.toLowerCase().includes('already')) {
        setEmailError('This email is already registered.');
        toast.error('Email already registered — please sign in.');
      } else {
        toast.error(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-secondary)', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: 40, height: 40, background: 'var(--accent)', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(224,92,42,0.3)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#fff' }}>S</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              ShowSpot
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--text-primary)', marginTop: '8px' }}>
            Create your account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Join thousands of event-goers today
          </p>
        </div>

        <div className="card" style={{ padding: '36px' }}>
          <form onSubmit={submit}>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" className="form-input" placeholder="John Doe"
                value={form.name} onChange={handle} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="mail" type="email" className="form-input"
                placeholder="you@example.com"
                value={form.mail} onChange={handle} required
                style={{ borderColor: emailError ? 'var(--accent)' : '' }}
              />
              {emailError && (
                <div style={{
                  marginTop: '8px', padding: '10px 14px',
                  background: '#fff8f5', border: '1.5px solid rgba(224,92,42,0.3)',
                  borderRadius: '8px', fontSize: '13px', color: 'var(--accent)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>⚠️ {emailError}</span>
                  <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '12px' }}>
                    Sign in →
                  </Link>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input name="contactNo" className="form-input" placeholder="9876543210"
                value={form.contactNo} onChange={handle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" type="password" className="form-input"
                  placeholder="Min. 6 chars"
                  value={form.password} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input name="confirmPassword" type="password" className="form-input"
                  placeholder="Repeat password"
                  value={form.confirmPassword} onChange={handle} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select name="role" className="form-input" value={form.role} onChange={handle}>
                <option value="USER">User — Browse &amp; book events</option>
                <option value="ADMIN">Admin — Organise &amp; manage events</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg"
              disabled={loading || !!emailError} style={{ marginTop: '8px' }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;