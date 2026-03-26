import React, { useState, useEffect } from 'react';
import { getNotificationsByUser, markAllNotificationsRead } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TYPE_META = {
  BOOKING:      { icon: '🎟', color: '#1a8f63', bg: '#f0faf6', border: 'rgba(26,143,99,0.2)' },
  PAYMENT:      { icon: '💳', color: '#2563a8', bg: '#f0f5ff', border: 'rgba(37,99,168,0.2)' },
  CANCELLATION: { icon: '❌', color: '#e8305a', bg: '#fff5f7', border: 'rgba(232,48,90,0.2)' },
  REMINDER:     { icon: '⏰', color: '#c97d1a', bg: '#fffbf0', border: 'rgba(201,125,26,0.2)' },
  REVIEW:       { icon: '⭐', color: '#9333ea', bg: '#faf5ff', border: 'rgba(147,51,234,0.2)' },
};

const NotificationsPage = () => {
  const { user }              = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await getNotificationsByUser(user.userId);
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setNotifications(data.sort((a, b) => new Date(b.sentTime) - new Date(a.sentTime)));

        // Mark all as read when page opens
        await markAllNotificationsRead(user.userId).catch(() => {});
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs = ['ALL', 'BOOKING', 'PAYMENT', 'CANCELLATION', 'REMINDER', 'REVIEW'];
  const filtered = activeTab === 'ALL'
    ? notifications
    : notifications.filter((n) => n.notifyType === activeTab);

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '36px', paddingBottom: '48px' }}>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="page-title">Notifications</h1>
            {unreadCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '24px', height: '24px', borderRadius: '99px',
                background: '#e8305a', color: 'white',
                fontSize: '12px', fontWeight: 800, padding: '0 7px',
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="page-subtitle">{notifications.length} total notification{notifications.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="tabs" style={{ marginBottom: '24px', overflowX: 'auto', flexWrap: 'nowrap' }}>
          {tabs.map((t) => {
            const count = t === 'ALL' ? notifications.length
              : notifications.filter((n) => n.notifyType === t).length;
            const meta = TYPE_META[t];
            return (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)} style={{ whiteSpace: 'nowrap' }}>
                {meta ? meta.icon + ' ' : ''}{t}
                {count > 0 && (
                  <span style={{
                    marginLeft: '5px', padding: '1px 7px', borderRadius: '99px', fontSize: '11px',
                    background: activeTab === t ? 'var(--accent-dim)' : 'var(--bg-card)',
                    color: activeTab === t ? 'var(--accent)' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>No Notifications</h3>
            <p style={{ fontSize: '13px' }}>You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((n) => {
              const meta    = TYPE_META[n.notifyType] || TYPE_META['BOOKING'];
              const isUnread = n.read === false;
              return (
                <div key={n.notificationId} style={{
                  background: isUnread ? meta.bg : 'var(--bg-card)',
                  border: `1.5px solid ${isUnread ? meta.border : 'var(--border)'}`,
                  borderLeft: isUnread ? `4px solid ${meta.color}` : '1.5px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  transition: 'var(--transition)',
                }}>
                  {/* Icon */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: isUnread ? 'white' : 'var(--bg-secondary)',
                    border: `1.5px solid ${isUnread ? meta.border : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0,
                  }}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '11px', fontWeight: 700, color: meta.color,
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      {n.notifyType}
                      {isUnread && (
                        <span style={{
                          width: '7px', height: '7px', borderRadius: '50%',
                          background: '#e8305a', display: 'inline-block',
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: '14px', color: 'var(--text-primary)',
                      fontWeight: isUnread ? 600 : 500,
                      lineHeight: 1.5,
                    }}>
                      {n.message}
                    </div>
                  </div>

                  {/* Time */}
                  <div style={{
                    fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500,
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}>
                    {n.sentTime ? formatTime(n.sentTime) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const formatTime = (sentTime) => {
  const date = new Date(sentTime);
  const now  = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default NotificationsPage;