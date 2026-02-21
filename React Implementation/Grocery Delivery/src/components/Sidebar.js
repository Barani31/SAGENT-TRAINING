import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/',              label: 'Dashboard',    icon: '🏠' },
  { to: '/products',      label: 'Browse',       icon: '🛍️' },
  { to: '/cart',          label: 'My Cart',      icon: '🛒' },
  { to: '/orders',        label: 'My Orders',    icon: '📦' },
  { to: '/payments',      label: 'Payments',     icon: '💳' },
  { to: '/notifications', label: 'Notifications',icon: '🔔' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const s = {
    sidebar: {
      width: 230, minHeight: '100vh', background: '#1c1917',
      display: 'flex', flexDirection: 'column', position: 'fixed',
      left: 0, top: 0, bottom: 0, zIndex: 100,
    },
    brand: { padding: '24px 20px 20px', borderBottom: '1px solid #292524' },
    brandName: { fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#f97316' },
    brandSub: { fontSize: 11, color: '#78716c', marginTop: 2 },
    userBadge: { padding: '14px 20px', borderBottom: '1px solid #292524', marginBottom: 6 },
    userLabel: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f97316', marginBottom: 3 },
    userName: { fontSize: 13, fontWeight: 600, color: '#e7e5e4' },
    userMail: { fontSize: 11, color: '#78716c', marginTop: 1 },
    nav: { flex: 1, padding: '8px 10px' },
    link: (isActive) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 8, marginBottom: 2,
      fontSize: 13, fontWeight: isActive ? 700 : 500,
      color: isActive ? '#f97316' : '#a8a29e',
      background: isActive ? 'rgba(249,115,22,0.12)' : 'transparent',
      textDecoration: 'none', transition: 'all 0.15s',
    }),
    icon: { fontSize: 16, width: 22, textAlign: 'center' },
    logoutBtn: {
      margin: '8px 10px 20px', padding: '10px 14px', borderRadius: 8,
      background: 'rgba(220,38,38,0.1)', border: 'none',
      color: '#fca5a5', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 10, width: 'calc(100% - 20px)',
    },
  };

  return (
    <aside style={s.sidebar}>
      <div style={s.brand}>
        <div style={s.brandName}>🛒 FreshCart</div>
        <div style={s.brandSub}>Grocery Delivery</div>
      </div>
      <div style={s.userBadge}>
        <div style={s.userLabel}>Logged in as</div>
        <div style={s.userName}>{user?.name}</div>
        <div style={s.userMail}>{user?.mail}</div>
      </div>
      <nav style={s.nav}>
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => s.link(isActive)}>
            <span style={s.icon}>{icon}</span>{label}
          </NavLink>
        ))}
      </nav>
      <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
        🚪 Logout
      </button>
    </aside>
  );
}
