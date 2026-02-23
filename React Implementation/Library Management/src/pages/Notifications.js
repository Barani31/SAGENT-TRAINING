import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:8080/api';
const safe = (d) => (Array.isArray(d) ? d : []);

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/notifications`).then(r => r.json()).then(data => {
      const all  = safe(data);
      const mine = user.role === 'librarian' ? all : all.filter(n => n.member?.memId === user.memId);
      setNotifs([...mine].reverse());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Your library reminders and alerts</p>
      </div>

      {loading ? <p style={{ color: 'var(--gray-400)' }}>Loading...</p>
        : notifs.length === 0
        ? <div className="card"><div className="empty-state"><div className="empty-icon">🔔</div><p>No notifications yet.</p></div></div>
        : (
        <div className="notif-list">
          {notifs.map(n => (
            <div key={n.notifyId} className="notif-item">
              <span className="notif-icon">📢</span>
              <div>
                {user.role === 'librarian' && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', marginBottom: 2, textTransform: 'uppercase' }}>
                    To: {n.member?.name}
                  </div>
                )}
                <div className="notif-msg">{n.message}</div>
                <div className="notif-date">📅 {n.sentDate}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
