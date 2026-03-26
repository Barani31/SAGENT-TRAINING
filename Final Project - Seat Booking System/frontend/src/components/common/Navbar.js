import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadNotificationCount } from '../../api/api';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname.startsWith(path);
  const exact    = (path) => location.pathname === path;

  const fetchUnread = useCallback(async () => {
    if (!user || isAdmin) return;
    try {
      const res = await getUnreadNotificationCount(user.userId);
      setUnreadCount(res.data?.data?.unreadCount || 0);
    } catch { /* silent */ }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (location.pathname === '/notifications') setUnreadCount(0);
  }, [location.pathname]);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(250,249,247,0.94)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1.5px solid var(--border)',
      height: '68px',
      boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>

        {/* Logo */}
        <Link to={isAdmin ? '/admin' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 38, height: 38, background: 'var(--accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(224,92,42,0.3)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#fff', lineHeight: 1 }}>S</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>ShowSpot</span>
        </Link>

        {/* Nav links */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {!isAdmin ? (
              <>
                <NavLink to="/"            label="Browse"      active={exact('/')} />
                <NavLink to="/my-bookings" label="My Bookings" active={isActive('/my-bookings')} />

                {/* Notifications with badge */}
                <Link to="/notifications" style={{
                  position: 'relative', padding: '7px 14px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: isActive('/notifications') ? 700 : 500,
                  color: isActive('/notifications') ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive('/notifications') ? 'var(--accent-dim)' : 'transparent',
                  transition: 'var(--transition)', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                }}
                  onMouseEnter={(e) => { if (!isActive('/notifications')) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}}
                  onMouseLeave={(e) => { if (!isActive('/notifications')) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}}
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: '18px', height: '18px', borderRadius: '99px',
                      background: '#e8305a', color: 'white',
                      fontSize: '10px', fontWeight: 800, padding: '0 5px', lineHeight: 1,
                      animation: 'pulse 2s infinite',
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <NavLink to="/admin"          label="Dashboard" active={exact('/admin')} />
                <NavLink to="/admin/events"   label="Events"    active={isActive('/admin/events')} />
                <NavLink to="/admin/slots"    label="Slots"     active={isActive('/admin/slots')} />
                <NavLink to="/admin/seats"    label="Seats"     active={isActive('/admin/seats')} />
                <NavLink to="/admin/bookings" label="Bookings"  active={isActive('/admin/bookings')} />
                <NavLink to="/admin/payments" label="Payments"  active={isActive('/admin/payments')} />
                <NavLink to="/admin/reviews"  label="Reviews ⭐" active={isActive('/admin/reviews')} />
              </>
            )}
          </div>
        )}

        {/* Right side — avatar + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* Clickable avatar → profile page (user only) */}
              <Link
                to={!isAdmin ? '/profile' : '/admin'}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                title={!isAdmin ? 'View Profile' : ''}
              >
                <div style={{
                  width: 36, height: 36,
                  background: isAdmin ? 'var(--gold-dim)' : 'var(--accent-dim)',
                  border: `2px solid ${isAdmin ? 'rgba(201,125,26,0.3)' : 'rgba(224,92,42,0.25)'}`,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700,
                  color: isAdmin ? 'var(--gold)' : 'var(--accent)',
                  transition: 'var(--transition)',
                  cursor: !isAdmin ? 'pointer' : 'default',
                }}
                  onMouseEnter={(e) => { if (!isAdmin) e.currentTarget.style.boxShadow = 'var(--shadow-accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: isAdmin ? 'var(--gold)' : 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isAdmin ? user.role : '✏️ Edit Profile'}
                  </div>
                </div>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </nav>
  );
};

const NavLink = ({ to, label, active }) => (
  <Link to={to} style={{
    padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
    fontWeight: active ? 700 : 500,
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    background: active ? 'var(--accent-dim)' : 'transparent',
    transition: 'var(--transition)', textDecoration: 'none',
  }}
    onMouseEnter={(e) => { if (!active) { e.target.style.color = 'var(--text-primary)'; e.target.style.background = 'var(--bg-secondary)'; }}}
    onMouseLeave={(e) => { if (!active) { e.target.style.color = 'var(--text-secondary)'; e.target.style.background = 'transparent'; }}}
  >{label}</Link>
);

export default Navbar;