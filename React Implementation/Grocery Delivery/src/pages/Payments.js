import React, { useEffect, useState } from 'react';
import { paymentApi, orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([paymentApi.getAll(), orderApi.getAll()])
      .then(([p, o]) => {
        const myOrderIds = o.filter(x => x.customer?.customerId === user?.id).map(x => x.orderId);
        setPayments(p.filter(x => myOrderIds.includes(x.order?.orderId)));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [user]);

  const modeIcon = (m) => ({ UPI:'📱', Card:'💳', Wallet:'👛', COD:'💵' }[m] || '💳');
  const modeColor = (m) => ({ UPI:'#8b5cf6', Card:'#3b82f6', Wallet:'#f97316', COD:'#16a34a' }[m] || '#78716c');

  const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const s = {
    heading: { fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 4 },
    sub: { color: '#a8a29e', fontSize: 14, marginBottom: 28 },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 },
    summCard: (color) => ({ background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4', borderLeftColor: color, borderLeftWidth: 4 }),
    summNum: (color) => ({ fontSize: 28, fontWeight: 700, color, marginBottom: 4 }),
    summLbl: { fontSize: 13, color: '#78716c' },
    table: { background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4' },
    th: { padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', background: '#fafaf9', borderBottom: '1px solid #e7e5e4' },
    td: { padding: '14px 18px', fontSize: 14, color: '#57534e', borderBottom: '1px solid #f5f5f4' },
    badge: (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '18', color }),
    modePill: (color) => ({ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: color + '15', color }),
    empty: { textAlign: 'center', padding: 60, color: '#a8a29e' },
  };

  if (loading) return <div style={{ color: '#a8a29e', padding: 40 }}>Loading payments...</div>;

  return (
    <div>
      <div style={s.heading}>Payments 💳</div>
      <div style={s.sub}>Your payment history and receipts</div>

      <div style={s.summaryGrid}>
        <div style={s.summCard('#f97316')}>
          <div style={s.summNum('#f97316')}>₹{total.toLocaleString()}</div>
          <div style={s.summLbl}>Total Paid</div>
        </div>
        <div style={s.summCard('#16a34a')}>
          <div style={s.summNum('#16a34a')}>{payments.length}</div>
          <div style={s.summLbl}>Transactions</div>
        </div>
        <div style={s.summCard('#3b82f6')}>
          <div style={s.summNum('#3b82f6')}>{payments.filter(p => p.status === 'PAID').length}</div>
          <div style={s.summLbl}>Successful</div>
        </div>
      </div>

      <div style={s.table}>
        {payments.length === 0
          ? <div style={s.empty}><div style={{ fontSize: 40, marginBottom: 10 }}>💳</div>No payments yet.</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Payment ID','Order ID','Mode','Amount','Status'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p.paymentId} style={{ background: i % 2 === 0 ? '#fff' : '#fafaf9' }}>
                    <td style={s.td}>#{p.paymentId}</td>
                    <td style={s.td}>Order #{p.order?.orderId}</td>
                    <td style={s.td}>
                      <span style={s.modePill(modeColor(p.mode))}>
                        {modeIcon(p.mode)} {p.mode}
                      </span>
                    </td>
                    <td style={{ ...s.td, fontWeight: 700, color: '#1c1917' }}>₹{p.amount?.toLocaleString()}</td>
                    <td style={s.td}>
                      <span style={s.badge('#16a34a')}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
