import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:8080/api';
const safe = (d) => (Array.isArray(d) ? d : []);

export default function MemberDashboard() {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [fines, setFines]     = useState([]);
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/borrow`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/fines`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/notifications`).then(r => r.json()).catch(() => []),
    ]).then(([b, f, n]) => {
      const myBorrows = safe(b).filter(x => x.member?.memId === user.memId);
      const myFines   = safe(f).filter(x => x.borrow?.member?.memId === user.memId);
      const myNotifs  = safe(n).filter(x => x.member?.memId === user.memId);
      setBorrows(myBorrows);
      setFines(myFines);
      setNotifs(myNotifs);
      setLoading(false);
    });
  }, [user]);

  const active      = borrows.filter(b => b.status !== 'RETURNED' && b.status !== 'CANCELLED');
  const overdue     = borrows.filter(b => b.dueDate && new Date(b.dueDate) < new Date() && b.status !== 'RETURNED');
  const unpaidFines = fines.filter(f => f.status === 'UNPAID');
  const totalFine   = unpaidFines.reduce((s, f) => s + (f.fineAmount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user.name}! 👋</h1>
        <p className="page-subtitle">{user.category || 'Member'} · Library ID #{user.memId}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{loading ? '...' : borrows.length}</div>
          <div className="stat-label">Total Borrows</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-value">{loading ? '...' : active.length}</div>
          <div className="stat-label">Active Borrows</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{loading ? '...' : overdue.length}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{loading ? '...' : `₹${totalFine}`}</div>
          <div className="stat-label">Pending Fines</div>
        </div>
      </div>

      {notifs.length > 0 && (
        <div className="card">
          <div className="card-header"><h2 className="card-title">🔔 Notifications</h2></div>
          <div className="notif-list">
            {notifs.slice(0, 3).map(n => (
              <div key={n.notifyId} className="notif-item">
                <span className="notif-icon">📢</span>
                <div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-date">{n.sentDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h2 className="card-title">My Active Borrows</h2></div>
        {loading
          ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
          : active.length === 0
          ? <div className="empty-state"><div className="empty-icon">📭</div><p>No active borrows. Go to Browse Books!</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Book</th><th>Author</th><th>Issue Date</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {active.map(b => {
                  const isOD = b.dueDate && new Date(b.dueDate) < new Date();
                  return (
                    <tr key={b.borrowId}>
                      <td style={{ fontWeight: 600 }}>{b.book?.name}</td>
                      <td>{b.book?.author}</td>
                      <td>{b.issueDate}</td>
                      <td style={{ color: isOD ? 'var(--red)' : 'inherit', fontWeight: isOD ? 700 : 400 }}>
                        {b.dueDate} {isOD && '⚠️'}
                      </td>
                      <td><StatusBadge status={isOD ? 'OVERDUE' : b.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    'ISSUED':'badge-blue','RETURNED':'badge-green','OVERDUE':'badge-red',
    'REQUESTED':'badge-amber','CANCELLED':'badge-gray','PAID':'badge-green',
    'UNPAID':'badge-red','AVAILABLE':'badge-green','NOT_AVAILABLE':'badge-red','DAMAGED':'badge-amber',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status || 'N/A'}</span>;
}
