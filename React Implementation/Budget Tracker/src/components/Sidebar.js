import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/',              label: 'Dashboard',    icon: '📊' },
  { to: '/income',        label: 'Income',        icon: '💰' },
  { to: '/expenses',      label: 'Expenses',      icon: '🛒' },
  { to: '/budget',        label: 'Budget',        icon: '📋' },
  { to: '/goals',         label: 'Savings Goals', icon: '🎯' },
  { to: '/balance',       label: 'Balance',       icon: '⚖️' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const s = {
    sidebar: {
      width: 224, minHeight: '100vh', background: '#ffffff',
      borderRight: '1.5px solid var(--border)', display: 'flex',
      flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0,
      zIndex: 100, boxShadow: '2px 0 16px rgba(56,161,105,0.07)',
    },
    brand: { padding: '22px 20px 16px', borderBottom: '1.5px solid var(--border)' },
    brandTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--green-600)', lineHeight: 1.25 },
    brandSub: { fontSize: 11, color: 'var(--text-light)', marginTop: 3 },
    userBadge: { padding: '12px 20px', borderBottom: '1.5px solid var(--border)', background: 'var(--green-50)' },
    userLabel: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green-500)', marginBottom: 2 },
    userName: { fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' },
    userEmail: { fontSize: 11, color: 'var(--text-light)', marginTop: 1 },
    nav: { flex: 1, padding: '8px 0' },
    link: (isActive) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 20px', margin: '2px 10px', borderRadius: 8,
      fontSize: 14, fontWeight: isActive ? 600 : 400,
      color: isActive ? 'var(--green-600)' : 'var(--text-mid)',
      background: isActive ? 'var(--green-50)' : 'transparent',
      textDecoration: 'none', transition: 'all 0.15s',
    }),
    logoutBtn: {
      margin: '8px 10px 16px', padding: '10px 14px', borderRadius: 8,
      background: 'transparent', border: '1.5px solid var(--border)',
      color: 'var(--text-mid)', fontSize: 13, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 8,
      width: 'calc(100% - 20px)', cursor: 'pointer', transition: 'all 0.15s',
    },
  };

  return (
    <aside style={s.sidebar}>
      <div style={s.brand}>
        <div style={s.brandTitle}>Budget<br/>Tracker</div>
        <div style={s.brandSub}>Personal Finance Manager</div>
      </div>

      <div style={s.userBadge}>
        <div style={s.userLabel}>Logged in as</div>
        <div style={s.userName}>{user?.name}</div>
        <div style={s.userEmail}>{user?.email}</div>
      </div>

      <nav style={s.nav}>
        {nav.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => s.link(isActive)}>
            <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <button style={s.logoutBtn} onClick={handleLogout}>
        🚪 Logout
      </button>
    </aside>
  );
}