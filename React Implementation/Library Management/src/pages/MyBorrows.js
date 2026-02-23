import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './MemberDashboard';

const BASE = 'http://localhost:8080/api';
const safe = (d) => (Array.isArray(d) ? d : []);

export default function MyBorrows() {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState('');

  const load = () => {
    fetch(`${BASE}/borrow`).then(r => r.json()).then(data => {
      setBorrows(safe(data).filter(b => b.member?.memId === user.memId));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const returnBook = async (borrow) => {
    setMsg('');
    try {
      await fetch(`${BASE}/borrow/return/${borrow.borrowId}`, { method: 'PUT' });
      setMsg(`✅ "${borrow.book?.name}" returned successfully!`);
      load();
    } catch { setMsg('❌ Failed to return. Please try again.'); }
  };

  const isOverdue = (b) => b.dueDate && new Date(b.dueDate) < new Date() && b.status !== 'RETURNED';

  if (loading) return <div style={{ padding: 40, color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Borrows</h1>
        <p className="page-subtitle">All your borrowed books</p>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      {borrows.length === 0
        ? <div className="card"><div className="empty-state"><div className="empty-icon">📭</div><p>No borrows yet. Go to Browse Books!</p></div></div>
        : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Book</th><th>Author</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {borrows.map(b => (
                  <tr key={b.borrowId}>
                    <td style={{ fontWeight: 600, color: 'var(--forest)' }}>#{b.borrowId}</td>
                    <td style={{ fontWeight: 600 }}>{b.book?.name}</td>
                    <td>{b.book?.author}</td>
                    <td>{b.issueDate}</td>
                    <td style={{ color: isOverdue(b) ? 'var(--red)' : 'inherit', fontWeight: isOverdue(b) ? 700 : 400 }}>
                      {b.dueDate} {isOverdue(b) && '⚠️'}
                    </td>
                    <td>{b.returnDate || '—'}</td>
                    <td><StatusBadge status={isOverdue(b) ? 'OVERDUE' : b.status} /></td>
                    <td>
                      {b.status !== 'RETURNED' && b.status !== 'CANCELLED' && (
                        <button className="btn btn-success btn-sm" onClick={() => returnBook(b)}>↩ Return</button>
                      )}
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
