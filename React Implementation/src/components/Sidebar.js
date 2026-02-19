import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const patientNav = [
    { to: '/', label: 'Dashboard', icon: '⬛' },
    { to: '/appointments', label: 'My Appointments', icon: '📅' },
    { to: '/health-data', label: 'My Health Data', icon: '❤️' },
    { to: '/readings', label: 'Daily Readings', icon: '📊' },
    { to: '/consultations', label: 'My Consultations', icon: '💬' },
    { to: '/messages', label: 'Messages', icon: '✉️' },
    { to: '/reports', label: 'My Reports', icon: '📋' },
  ];

  const doctorNav = [
    { to: '/', label: 'Dashboard', icon: '⬛' },
    { to: '/patients', label: 'All Patients', icon: '👤' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
    { to: '/health-data', label: 'Health Data', icon: '❤️' },
    { to: '/readings', label: 'Daily Readings', icon: '📊' },
    { to: '/consultations', label: 'Consultations', icon: '💬' },
    { to: '/messages', label: 'Messages', icon: '✉️' },
    { to: '/reports', label: 'Reports', icon: '📋' },
  ];

  const navItems = user?.role === 'doctor' ? doctorNav : patientNav;

  const s = {
    sidebar: {
      width: 220, minHeight: '100vh', background: 'var(--white)',
      borderRight: '1.5px solid var(--border)', padding: '24px 0',
      display: 'flex', flexDirection: 'column', position: 'fixed',
      left: 0, top: 0, bottom: 0, zIndex: 100,
      boxShadow: '2px 0 12px rgba(33,150,243,0.06)',
    },
    brand: { padding: '0 20px 16px', borderBottom: '1.5px solid var(--border)', marginBottom: 8 },
    brandTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'var(--blue-600)', lineHeight: 1.2 },
    brandSub: { fontSize: 11, color: 'var(--text-light)', marginTop: 2 },
    userBadge: { padding: '10px 20px 10px', borderBottom: '1.5px solid var(--border)', marginBottom: 8 },
    userRole: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--blue-400)', marginBottom: 2 },
    userName: { fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' },
    link: (isActive) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 20px', margin: '1px 10px', borderRadius: 8,
      fontSize: 14, fontWeight: isActive ? 600 : 400,
      color: isActive ? 'var(--blue-600)' : 'var(--text-mid)',
      background: isActive ? 'var(--blue-50)' : 'transparent',
      transition: 'all 0.15s', textDecoration: 'none',
    }),
    logoutBtn: {
      margin: 'auto 10px 16px', padding: '10px 14px', borderRadius: 8,
      background: 'var(--blue-50)', border: '1.5px solid var(--border)',
      color: 'var(--blue-600)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
    },
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={s.sidebar}>
      <div style={s.brand}>
        <div style={s.brandTitle}>Patient<br/>Monitor</div>
        <div style={s.brandSub}>Health Management System</div>
      </div>
      <div style={s.userBadge}>
        <div style={s.userRole}>{user?.role}</div>
        <div style={s.userName}>{user?.name}</div>
      </div>
      <nav style={{ flex: 1 }}>
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => s.link(isActive)}>
            <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <button style={s.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
    </aside>
  );
}