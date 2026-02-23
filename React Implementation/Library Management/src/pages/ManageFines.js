import React, { useEffect, useState } from 'react';
import { StatusBadge } from './MemberDashboard';

const BASE = 'http://localhost:8080/api';
const safe = (d) => (Array.isArray(d) ? d : []);

export default function ManageFines() {
  const [fines, setFines]               = useState([]);
  const [borrows, setBorrows]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [msg, setMsg]                   = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [fineAmount, setFineAmount]     = useState('');

  const load = () => {
    Promise.all([
      fetch(`${BASE}/fines`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/borrow`).then(r => r.json()).catch(() => []),
    ]).then(([f, b]) => {
      const safeFines   = safe(f);
      const safeBorrows = safe(b);
      setFines(safeFines);
      const fineIds = safeFines.map(x => x.borrow?.borrowId);
      // Show all active borrows (not returned) for librarian to manage
      const active = safeBorrows.filter(br => br.status !== 'RETURNED' && br.status !== 'CANCELLED');
      setBorrows(active);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const isOverdue = (b) => b.dueDate && new Date(b.dueDate) < new Date();
  const hasFine   = (borrowId) => fines.some(f => f.borrow?.borrowId === borrowId);

  const openIssueFine = (borrow) => {
    const days = Math.max(1, Math.floor((new Date() - new Date(borrow.dueDate)) / 86400000));
    setFineAmount(days * 10);
    setSelectedBorrow(borrow);
    setShowModal(true);
  };

  const issueFine = async () => {
    try {
      await fetch(`${BASE}/fines`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrow: { borrowId: selectedBorrow.borrowId },
          fineAmount: parseFloat(fineAmount),
          fineDate: new Date().toISOString().split('T')[0],
          status: 'UNPAID',
        }),
      });
      setMsg('✅ Fine issued successfully!');
      setShowModal(false); load();
    } catch { setMsg('❌ Failed to issue fine.'); }
  };

  const markPaid = async (fine) => {
  try {
    const res = await fetch(`${BASE}/fines/${fine.fineId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fineId:     fine.fineId,
        fineAmount: fine.fineAmount,
        fineDate:   fine.fineDate,
        status:     'PAID',
        borrow:     fine.borrow,
      }),
    });
    if (!res.ok) throw new Error('Failed');
    setMsg('✅ Fine marked as paid!');
    load();
  } catch {
    setMsg('❌ Failed to update fine.');
  }
};

  const returnBook = async (borrow) => {
    try {
      await fetch(`${BASE}/borrow/return/${borrow.borrowId}`, { method: 'PUT' });
      setMsg(`✅ "${borrow.book?.name}" marked as returned!`);
      load();
    } catch { setMsg('❌ Failed to return book.'); }
  };

  const overdueWithoutFine = borrows.filter(b => isOverdue(b) && !hasFine(b.borrowId));
  const totalUnpaid = fines.filter(f => f.status === 'UNPAID').reduce((s, f) => s + (f.fineAmount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Fines</h1>
        <p className="page-subtitle">Issue and track overdue fines (₹10/day)</p>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card"><div className="stat-icon">📖</div><div className="stat-value">{borrows.length}</div><div className="stat-label">Active Borrows</div></div>
        <div className="stat-card"><div className="stat-icon">⚠️</div><div className="stat-value">{overdueWithoutFine.length}</div><div className="stat-label">Need Fine</div></div>
        <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">{fines.length}</div><div className="stat-label">Total Fines</div></div>
        <div className="stat-card"><div className="stat-icon">🔴</div><div className="stat-value">₹{totalUnpaid}</div><div className="stat-label">Total Unpaid</div></div>
      </div>

      {/* ALL ACTIVE BORROWS — librarian can return or issue fine */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📖 Active Borrows</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Librarian can return or issue fine</span>
        </div>
        {loading ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
          : borrows.length === 0
          ? <div className="empty-state"><div className="empty-icon">✅</div><p>No active borrows!</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Book</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Days Late</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrows.map(b => {
                  const overdue = isOverdue(b);
                  const days    = overdue ? Math.floor((new Date() - new Date(b.dueDate)) / 86400000) : 0;
                  const fined   = hasFine(b.borrowId);
                  return (
                    <tr key={b.borrowId}>
                      <td>{b.member?.name}</td>
                      <td style={{ fontWeight: 600 }}>{b.book?.name}</td>
                      <td>{b.issueDate}</td>
                      <td style={{ color: overdue ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                        {b.dueDate} {overdue ? '⚠️' : '✅'}
                      </td>
                      <td>
                        {overdue
                          ? <span className="badge badge-red">{days}d late</span>
                          : <span className="badge badge-green">On time</span>}
                      </td>
                      <td><StatusBadge status={overdue ? 'OVERDUE' : b.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button className="btn btn-success btn-sm" onClick={() => returnBook(b)}>
                            ↩ Return
                          </button>
                          {overdue && !fined && (
                            <button className="btn btn-amber btn-sm" onClick={() => openIssueFine(b)}>
                              💰 Fine
                            </button>
                          )}
                          {fined && (
                            <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>Fine issued</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ALL FINES */}
      <div className="card">
        <div className="card-header"><h2 className="card-title">💰 All Fines</h2></div>
        {fines.length === 0
          ? <div className="empty-state"><div className="empty-icon">🎉</div><p>No fines issued yet.</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Fine ID</th><th>Member</th><th>Book</th><th>Due Date</th><th>Amount</th><th>Fine Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {fines.map(f => (
                  <tr key={f.fineId}>
                    <td style={{ fontWeight: 600, color: 'var(--forest)' }}>#{f.fineId}</td>
                    <td>{f.borrow?.member?.name}</td>
                    <td>{f.borrow?.book?.name}</td>
                    <td style={{ color: 'var(--red)', fontWeight: 600 }}>{f.borrow?.dueDate}</td>
                    <td style={{ fontWeight: 700, color: f.status === 'UNPAID' ? 'var(--red)' : 'var(--green)' }}>
                      ₹{f.fineAmount}
                    </td>
                    <td>{f.fineDate}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>
                      {f.status === 'UNPAID' && (
                        <button className="btn btn-success btn-sm" onClick={() => markPaid(f)}>
                          ✅ Mark Paid
                        </button>
                      )}
                      {f.status === 'PAID' && (
                        <span style={{ fontSize: 13, color: 'var(--green)' }}>✅ Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Fine Modal */}
      {showModal && selectedBorrow && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Issue Fine</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--gray-100)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Member: <strong>{selectedBorrow.member?.name}</strong></div>
                <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Book: <strong>{selectedBorrow.book?.name}</strong></div>
                <div style={{ fontSize: 13, color: 'var(--red)' }}>Due Date: <strong>{selectedBorrow.dueDate}</strong></div>
                <div style={{ fontSize: 13, color: 'var(--red)' }}>
                  Days Late: <strong>{Math.max(1, Math.floor((new Date() - new Date(selectedBorrow.dueDate)) / 86400000))} days</strong>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fine Amount (₹) — ₹10/day</label>
                <input className="form-input" type="number"
                  value={fineAmount} onChange={e => setFineAmount(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-amber" onClick={issueFine}>Issue Fine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}