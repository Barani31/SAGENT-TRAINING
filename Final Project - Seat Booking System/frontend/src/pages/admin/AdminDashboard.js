import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEventsByOrganiser, getReservationsByOrganiser, getTransactionsByOrganiser } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ events: 0, bookings: 0, collections: 0, cancellations: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, bkRes, txRes] = await Promise.all([
          getEventsByOrganiser(user.userId),
          getReservationsByOrganiser(user.userId),
          getTransactionsByOrganiser(user.userId),
        ]);
        const events   = evRes.data?.data  || [];
        const bookings = bkRes.data?.data  || [];
        const txns     = txRes.data?.data  || [];

        // Collections = only SUCCESS transactions (money actually received)
        const collections = txns
          .filter((t) => t.status === 'SUCCESS')
          .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

        const cancellations = bookings.filter((b) => b.status === 'CANCELLED').length;
        setStats({ events: events.length, bookings: bookings.length, collections, cancellations });
        setRecentBookings([...bookings].reverse().slice(0, 5));
      } catch (e) {
        console.error('Dashboard error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.userId]);

  const STAT_CARDS = [
    { label: 'My Events',      value: stats.events,                              icon: '🎭', color: 'var(--blue)',   path: '/admin/events'   },
    { label: 'Total Bookings', value: stats.bookings,                            icon: '🎟', color: 'var(--green)',  path: '/admin/bookings' },
    { label: 'Collections',    value: `₹${stats.collections.toFixed(0)}`,        icon: '💰', color: 'var(--accent)', path: '/admin/payments' },
    { label: 'Cancellations',  value: stats.cancellations,                       icon: '❌', color: 'var(--gold)',   path: '/admin/bookings' },
  ];

  const QUICK_LINKS = [
    { label: 'Create Event',  icon: '➕', desc: 'Add a new event',      path: '/admin/events'   },
    { label: 'Add Show Slot', icon: '📅', desc: 'Schedule a show',      path: '/admin/slots'    },
    { label: 'Manage Seats',  icon: '💺', desc: 'Setup seat layout',    path: '/admin/seats'    },
    { label: 'View Payments', icon: '💳', desc: 'Full payment history', path: '/admin/payments' },
  ];

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,#fff8f5 0%,#fef2ea 100%)', borderBottom: '1.5px solid var(--border)', padding: '32px 0' }}>
        <div className="container">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user.name} · Organiser Panel</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '28px', paddingBottom: '48px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '16px', marginBottom: '32px' }}>
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="stat-card"
              onClick={() => navigate(s.path)}
              style={{ cursor: 'pointer', borderLeft: `4px solid ${s.color}`, transition: 'var(--transition)' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{loading ? '...' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Quick Actions */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {QUICK_LINKS.map((l) => (
                <div key={l.label} onClick={() => navigate(l.path)} className="card"
                  style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#fff8f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.background = 'var(--bg-card)'; }}
                >
                  <span style={{ fontSize: '22px' }}>{l.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{l.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '16px' }}>→</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>Recent Bookings</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {loading ? (
                <div className="loading-center" style={{ padding: '40px' }}><div className="spinner" /></div>
              ) : recentBookings.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <div className="empty-state-icon">🎟</div>
                  <p style={{ fontSize: '13px' }}>No bookings yet</p>
                </div>
              ) : recentBookings.map((r, i) => (
                <div key={r.reservationId} style={{
                  padding: '12px 18px',
                  borderBottom: i < recentBookings.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{r.slot?.event?.name || 'Event'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{r.refCode}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                      ₹{parseFloat(r.amount || 0).toFixed(0)}
                    </div>
                    <span className={`badge ${r.status === 'CONFIRMED' ? 'badge-success' : r.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}
                      style={{ fontSize: '10px' }}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;