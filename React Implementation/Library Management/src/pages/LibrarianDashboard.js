import React, { useEffect, useState } from 'react';
import { StatusBadge } from './MemberDashboard';

const BASE = 'http://localhost:8080/api';
const safe = (d) => (Array.isArray(d) ? d : []);

export default function LibrarianDashboard() {
  const [books, setBooks]     = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [members, setMembers] = useState([]);
  const [fines, setFines]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/books`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/borrow`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/members`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/fines`).then(r => r.json()).catch(() => []),
    ]).then(([b, br, m, f]) => {
      setBooks(safe(b)); setBorrows(safe(br)); setMembers(safe(m)); setFines(safe(f));
      setLoading(false);
    });
  }, []);

  const active  = borrows.filter(b => b.status !== 'RETURNED' && b.status !== 'CANCELLED');
  const overdue = borrows.filter(b => b.dueDate && new Date(b.dueDate) < new Date() && b.status !== 'RETURNED');
  const unpaid  = fines.filter(f => f.status === 'UNPAID');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Librarian Dashboard 📋</h1>
        <p className="page-subtitle">Overview of the library system</p>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-icon">📚</div><div className="stat-value">{loading ? '...' : books.length}</div><div className="stat-label">Total Books</div></div>
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{loading ? '...' : members.length}</div><div className="stat-label">Members</div></div>
        <div className="stat-card"><div className="stat-icon">📖</div><div className="stat-value">{loading ? '...' : active.length}</div><div className="stat-label">Active Borrows</div></div>
        <div className="stat-card"><div className="stat-icon">⚠️</div><div className="stat-value">{loading ? '...' : overdue.length}</div><div className="stat-label">Overdue</div></div>
        <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">{loading ? '...' : unpaid.length}</div><div className="stat-label">Unpaid Fines</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">⚠️ Overdue Borrows</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{overdue.length} overdue</span>
        </div>
        {overdue.length === 0
          ? <div className="empty-state"><div className="empty-icon">✅</div><p>No overdue borrows!</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Book</th><th>Due Date</th><th>Days Overdue</th><th>Status</th></tr></thead>
              <tbody>
                {overdue.map(b => {
                  const days = Math.floor((new Date() - new Date(b.dueDate)) / 86400000);
                  return (
                    <tr key={b.borrowId}>
                      <td>{b.member?.name}</td>
                      <td style={{ fontWeight: 600 }}>{b.book?.name}</td>
                      <td style={{ color: 'var(--red)', fontWeight: 600 }}>{b.dueDate}</td>
                      <td><span className="badge badge-red">{days} days</span></td>
                      <td><StatusBadge status="OVERDUE" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><h2 className="card-title">Recent Borrows</h2></div>
        {borrows.length === 0
          ? <div className="empty-state"><div className="empty-icon">📭</div><p>No borrows yet.</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Book</th><th>Issue Date</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {[...borrows].reverse().slice(0, 8).map(b => (
                  <tr key={b.borrowId}>
                    <td>{b.member?.name}</td>
                    <td style={{ fontWeight: 600 }}>{b.book?.name}</td>
                    <td>{b.issueDate}</td>
                    <td>{b.dueDate}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
