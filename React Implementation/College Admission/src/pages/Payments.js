import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:8080/api';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState(null); // paymentId being processed

  const load = () => {
    Promise.all([
      fetch(`${BASE}/payments`).then(r => r.json()),
      fetch(`${BASE}/applications`).then(r => r.json()),
    ]).then(([p, a]) => {
      const filtered = user.role === 'officer'
        ? p
        : p.filter(pay => {
            const app = a.find(ap => ap.applicationId === pay.application?.applicationId);
            return app?.student?.studentId === user.studentId;
          });
      setPayments(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const handlePayNow = async (payment) => {
    setPaying(payment.paymentId);
    try {
      const res = await fetch(`${BASE}/payments/${payment.paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payment,
          status: 'PAID',
          paymentMode: 'Online',
          paymentDate: new Date().toISOString().split('T')[0],
        }),
      });
      if (res.ok) {
        load();
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch {
      alert('Could not connect to server.');
    }
    setPaying(null);
  };

  const total = payments.reduce((sum, p) => sum + (p.application?.course?.fee || 0), 0);
  const paid  = payments.filter(p => p.status === 'PAID').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">{user.role === 'officer' ? 'All application payments' : 'Your payment history'}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-value">{loading ? '—' : payments.length}</div>
          <div className="stat-label">Total Payments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{loading ? '—' : paid}</div>
          <div className="stat-label">Paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value" style={{ fontSize: 20 }}>₹{loading ? '—' : total.toLocaleString()}</div>
          <div className="stat-label">Total Amount</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Payment History</h2>
        </div>
        {loading ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
          : payments.length === 0
          ? <div className="empty-state"><div className="empty-icon">💳</div><p>No payment records found.</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Application</th>
                  {user.role === 'officer' && <th>Student</th>}
                  <th>Course</th>
                  <th>Mode</th>
                  <th>Date</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  {user.role === 'student' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.paymentId}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>#{p.paymentId}</td>
                    <td>#{p.application?.applicationId || 'N/A'}</td>
                    {user.role === 'officer' && <td>{p.application?.student?.name || 'N/A'}</td>}
                    <td>{p.application?.course?.name || 'N/A'}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {p.paymentMode === 'Online' ? '🌐' : p.paymentMode === 'UPI' ? '📱' : '💳'}
                        {p.paymentMode || 'N/A'}
                      </span>
                    </td>
                    <td>{p.paymentDate || 'N/A'}</td>
                    <td>{p.deadline || 'N/A'}</td>
                    <td>
                      <span className={`badge ${p.status === 'PAID' ? 'badge-paid' : 'badge-unpaid'}`}>
                        {p.status === 'PAID' ? '✅ Paid' : '⏳ Unpaid'}
                      </span>
                    </td>
                    {user.role === 'student' && (
                      <td>
                        {p.status === 'PAID' ? (
                          <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>—</span>
                        ) : (
                          <button
                            className="btn btn-gold btn-sm"
                            onClick={() => handlePayNow(p)}
                            disabled={paying === p.paymentId}
                          >
                            {paying === p.paymentId ? 'Processing...' : '💳 Pay Now'}
                          </button>
                        )}
                      </td>
                    )}
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
