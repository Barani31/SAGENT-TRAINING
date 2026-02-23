import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './MemberDashboard';

const BASE = 'http://localhost:8080/api';
const safe = (d) => (Array.isArray(d) ? d : []);

export default function MyFines() {
  const { user } = useAuth();
  const [fines, setFines]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState('');

  const load = () => {
    fetch(`${BASE}/fines`).then(r => r.json()).then(data => {
      setFines(safe(data).filter(f => f.borrow?.member?.memId === user.memId));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const payFine = async (fine) => {
    setMsg('');
    try {
      await fetch(`${BASE}/fines/${fine.fineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fine, status: 'PAID' }),
      });
      setMsg('✅ Fine paid successfully!');
      load();
    } catch { setMsg('❌ Payment failed. Please try again.'); }
  };

  const unpaid   = fines.filter(f => f.status === 'UNPAID');
  const totalDue = unpaid.reduce((s, f) => s + (f.fineAmount || 0), 0);

  if (loading) return <div style={{ padding: 40, color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Fines</h1>
        <p className="page-subtitle">Track and pay your library fines</p>
      </div>

      {totalDue > 0 && (
        <div className="alert alert-amber" style={{ fontSize: 14, marginBottom: 20 }}>
          ⚠️ You have <strong>₹{totalDue}</strong> in unpaid fines. Pay to continue borrowing.
        </div>
      )}

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{fines.length}</div>
          <div className="stat-label">Total Fines</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">₹{totalDue}</div>
          <div className="stat-label">Amount Due</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{fines.filter(f => f.status === 'PAID').length}</div>
          <div className="stat-label">Paid</div>
        </div>
      </div>

      {fines.length === 0
        ? <div className="card"><div className="empty-state"><div className="empty-icon">🎉</div><p>No fines! You're all clear.</p></div></div>
        : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Fine ID</th><th>Book</th><th>Amount</th><th>Fine Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {fines.map(f => (
                  <tr key={f.fineId}>
                    <td style={{ fontWeight: 600, color: 'var(--forest)' }}>#{f.fineId}</td>
                    <td>{f.borrow?.book?.name || 'N/A'}</td>
                    <td style={{ fontWeight: 700, color: f.status === 'UNPAID' ? 'var(--red)' : 'var(--green)' }}>₹{f.fineAmount}</td>
                    <td>{f.fineDate}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>
                      {f.status === 'UNPAID'
                        ? <button className="btn btn-amber btn-sm" onClick={() => payFine(f)}>💳 Pay Now</button>
                        : <span style={{ fontSize: 13, color: 'var(--green)' }}>✅ Paid</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
