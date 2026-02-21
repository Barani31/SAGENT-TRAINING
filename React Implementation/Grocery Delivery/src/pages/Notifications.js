import React, { useEffect, useState } from 'react';
import { notificationApi, orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([notificationApi.getAll(), orderApi.getAll()])
      .then(([n, o]) => {
        const myOrderIds = o.filter(x => x.customer?.customerId === user?.id).map(x => x.orderId);
        const mine = n.filter(x => myOrderIds.includes(x.order?.orderId));
        setNotifs(mine.reverse());
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const del = async (id) => { await notificationApi.delete(id); load(); };

  const msgIcon = (msg = '') => {
    if (msg.toLowerCase().includes('cancel'))   return { icon: '❌', color: '#dc2626' };
    if (msg.toLowerCase().includes('delivered')) return { icon: '✅', color: '#16a34a' };
    if (msg.toLowerCase().includes('delivery'))  return { icon: '🚚', color: '#8b5cf6' };
    if (msg.toLowerCase().includes('confirm'))   return { icon: '✔️', color: '#3b82f6' };
    if (msg.toLowerCase().includes('payment'))   return { icon: '💳', color: '#f97316' };
    return { icon: '🔔', color: '#f97316' };
  };

  const formatTime = (t) => {
    if (!t) return '';
    try { return new Date(t).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return t; }
  };

  const s = {
    heading: { fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 4 },
    sub: { color: '#a8a29e', fontSize: 14, marginBottom: 28 },
    card: (color) => ({
      background: '#fff', borderRadius: 12, padding: '16px 20px',
      marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      border: '1px solid #e7e5e4', borderLeftWidth: 4, borderLeftColor: color,
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }),
    iconBox: (color) => ({
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: color + '15', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 20,
    }),
    msg: { fontSize: 14, fontWeight: 600, color: '#1c1917', marginBottom: 4 },
    time: { fontSize: 12, color: '#a8a29e' },
    orderId: { fontSize: 11, color: '#f97316', fontWeight: 700, marginTop: 3 },
    delBtn: { background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 },
    empty: { textAlign: 'center', padding: 60, color: '#a8a29e' },
    clearAll: { background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20 },
  };

  if (loading) return <div style={{ color: '#a8a29e', padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div style={s.heading}>Notifications 🔔</div>
      <div style={s.sub}>Order updates and alerts</div>

      {notifs.length > 0 && (
        <button style={s.clearAll} onClick={async () => {
          if (!window.confirm('Clear all notifications?')) return;
          await Promise.all(notifs.map(n => notificationApi.delete(n.notifyId)));
          load();
        }}>🗑 Clear All</button>
      )}

      {notifs.length === 0
        ? <div style={s.empty}><div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>No notifications yet.</div>
        : notifs.map(n => {
          const { icon, color } = msgIcon(n.message);
          return (
            <div key={n.notifyId} style={s.card(color)}>
              <div style={s.iconBox(color)}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={s.msg}>{n.message}</div>
                <div style={s.time}>{formatTime(n.sentTime)}</div>
                {n.order?.orderId && <div style={s.orderId}>Order #{n.order.orderId}</div>}
              </div>
              <button style={s.delBtn} onClick={() => del(n.notifyId)}>✕</button>
            </div>
          );
        })}
    </div>
  );
}
