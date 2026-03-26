import React, { useState, useEffect } from 'react';
import { getTransactionsByOrganiser } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = { SUCCESS: 'badge-success', FAILED: 'badge-danger', REFUNDED: 'badge-warning', PENDING: 'badge-muted', REJECTED: 'badge-danger', CREDITED: 'badge-success' };
const METHOD_ICONS  = { UPI: '📱', CARD: '💳', NETBANKING: '🏦', WALLET: '👛' };

const AdminPaymentsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTransactionsByOrganiser(user.userId);
        setTransactions(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch { toast.error('Failed to load transactions'); }
      finally { setLoading(false); }
    };
    load();
  }, [user.userId]);

  const q = search.toLowerCase();
  const filtered = transactions.filter((t) => {
    const matchStatus = filter === 'ALL' || t.status === filter;
    const matchSearch = !q || t.transactionRef?.toLowerCase().includes(q) ||
      t.reservation?.refCode?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── Financial summary ─────────────────────────────────────────────────
  const collections  = transactions.filter((t) => t.status === 'SUCCESS').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const refundsIssued = transactions.filter((t) => t.status === 'REFUNDED' || t.status === 'CREDITED').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const netEarnings  = collections - refundsIssued;

  return (
    <div className="container page-content" style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingLeft: '28px', paddingRight: '28px' }}>
      <div className="page-header">
        <h1 className="page-title">PAYMENT HISTORY</h1>
        <p className="page-subtitle">All transactions for your events</p>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <SummaryCard label="Collections"    value={`₹${collections.toFixed(2)}`}    color="var(--green)"  icon="💰" hint="Total money received" />
        <SummaryCard label="Transactions"   value={transactions.length}              color="var(--blue)"   icon="🧾" hint="All transactions" />
        <SummaryCard label="Successful"     value={transactions.filter((t) => t.status === 'SUCCESS').length} color="var(--green)" icon="✅" hint="Successful payments" />
        <SummaryCard label="Refunds Issued" value={`₹${refundsIssued.toFixed(2)}`}  color="var(--gold)"   icon="↩️" hint="Money sent back" />
        <SummaryCard label="Net Earnings"   value={`₹${netEarnings.toFixed(2)}`}    color="var(--accent)" icon="📊" hint="Collections minus refunds" />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {['ALL','SUCCESS','REFUNDED','CREDITED','FAILED','PENDING'].map((s) => (
            <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
        <input className="form-input" placeholder="Search txn ref or booking ref..." value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ width: '260px', marginLeft: 'auto' }} />
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">💳</div><h3>No Transactions Found</h3></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Txn Ref</th><th>Booking Ref</th><th>User</th><th>Event</th><th>Method</th><th>Amount</th><th>Discount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.transactionId}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--blue)' }}>{t.transactionRef}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)' }}>{t.reservation?.refCode}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{t.reservation?.user?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.reservation?.user?.mail}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{t.reservation?.slot?.event?.name}</td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>{METHOD_ICONS[t.paymentMethod] || '💳'} {t.paymentMethod}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>₹{parseFloat(t.amount || 0).toFixed(2)}</td>
                  <td style={{ color: 'var(--gold)' }}>{t.discountAmount > 0 ? `−₹${parseFloat(t.discountAmount).toFixed(2)}` : '—'}</td>
                  <td><span className={`badge ${STATUS_COLORS[t.status] || 'badge-muted'}`}>{t.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {t.date ? new Date(t.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, color, icon, hint }) => (
  <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
    <div className="stat-value" style={{ color, fontSize: '1.6rem' }}>{value}</div>
    <div className="stat-label">{label}</div>
    {hint && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 400 }}>{hint}</div>}
  </div>
);

export default AdminPaymentsPage;