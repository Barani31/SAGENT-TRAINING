import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './StudentDashboard';

const BASE = 'http://localhost:8080/api';

export default function MyApplications() {
  const { user } = useAuth();
  const [apps, setApps]         = useState([]);
  const [payments, setPayments] = useState([]);
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);

  // Payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedApp, setSelectedApp]   = useState(null);
  const [selectedPay, setSelectedPay]   = useState(null);
  const [payMode, setPayMode]           = useState('Online');
  const [payDeadline, setPayDeadline]   = useState('');
  const [paying, setPaying]             = useState(false);
  const [payError, setPayError]         = useState('');

  const load = () => {
    Promise.all([
      fetch(`${BASE}/applications`).then(r => r.json()),
      fetch(`${BASE}/payments`).then(r => r.json()),
      fetch(`${BASE}/documents`).then(r => r.json()),
    ]).then(([a, p, d]) => {
      setApps(a.filter(x => x.student?.studentId === user.studentId));
      setPayments(p);
      setDocs(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const openPayModal = (app, pay) => {
    setSelectedApp(app);
    setSelectedPay(pay || null);
    setPayMode('Online');
    setPayDeadline('');
    setPayError('');
    setShowPayModal(true);
  };

  const closePayModal = () => {
    setShowPayModal(false);
    setSelectedApp(null);
    setSelectedPay(null);
    setPayError('');
  };

  const confirmPayment = async () => {
    if (!payDeadline) { setPayError('Please select a payment deadline.'); return; }
    setPaying(true); setPayError('');
    try {
      let res;
      if (selectedPay) {
        // Update existing payment record
        res = await fetch(`${BASE}/payments/${selectedPay.paymentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...selectedPay,
            status: 'PAID',
            paymentMode: payMode,
            paymentDate: new Date().toISOString().split('T')[0],
            deadline: payDeadline,
          }),
        });
      } else {
        // Create new payment record
        res = await fetch(`${BASE}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMode: payMode,
            status: 'PAID',
            paymentDate: new Date().toISOString().split('T')[0],
            deadline: payDeadline,
            application: { applicationId: selectedApp.applicationId },
          }),
        });
      }
      if (res.ok) {
        closePayModal();
        load();
      } else {
        setPayError('Payment failed. Please try again.');
      }
    } catch {
      setPayError('Could not connect to server.');
    }
    setPaying(false);
  };

  const cancelApp = async (id) => {
    if (!window.confirm('Cancel this application?')) return;
    const app = apps.find(a => a.applicationId === id);
    await fetch(`${BASE}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...app, status: 'Cancelled' }),
    });
    load();
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">All your submitted college applications</p>
      </div>

      {apps.length === 0
        ? <div className="card"><div className="empty-state"><div className="empty-icon">📭</div><p>No applications yet. Click "Apply Now" to get started!</p></div></div>
        : (
        <div className="app-grid">
          {apps.map(a => {
            const pay = payments.find(p => p.application?.applicationId === a.applicationId);
            const doc = docs.find(d => d.application?.applicationId === a.applicationId);
            const isPaid = pay?.status === 'PAID';
            const canCancel = a.status === 'Pending';

            return (
              <div key={a.applicationId} className="app-card">
                <div className="app-card-header">
                  <div>
                    <div className="app-card-title">{a.course?.name || 'Unknown Course'}</div>
                    <div className="app-card-id">Application #{a.applicationId}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className="app-card-meta">
                  <div className="meta-item">📅 Applied: {a.appliedDate || 'N/A'}</div>
                  <div className="meta-item">💰 Fee: ₹{a.course?.fee?.toLocaleString() || 'N/A'}</div>

                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: 13, color: 'var(--gray-600)' }}>
                    <span>💳 Payment:</span>
                    {isPaid ? (
                      <span className="badge badge-paid">✅ Paid</span>
                    ) : (
                      <>
                        <span className="badge badge-unpaid">⏳ Unpaid</span>
                        <button
                          className="btn btn-gold btn-sm"
                          style={{ padding: '3px 10px', fontSize: 12 }}
                          onClick={() => openPayModal(a, pay)}
                        >
                          💳 Pay Now
                        </button>
                      </>
                    )}
                  </div>

                  {doc && <div className="meta-item">📄 Document: {doc.docType}</div>}
                </div>

                <div className="app-card-actions">
                  {canCancel && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancelApp(a.applicationId)}>
                      Cancel
                    </button>
                  )}
                  {a.status === 'Accepted' && (
                    <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>🎉 Congratulations!</span>
                  )}
                  {a.status === 'Rejected' && (
                    <span style={{ fontSize: 13, color: 'var(--red)' }}>Unfortunately rejected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && selectedApp && (
        <div className="modal-overlay" onClick={closePayModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Complete Payment</h2>
              <button className="modal-close" onClick={closePayModal}>✕</button>
            </div>
            <div className="modal-body">

              {/* Course & Amount summary */}
              <div style={{ background: 'var(--gray-100)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Application #{selectedApp.applicationId}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>{selectedApp.course?.name}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Playfair Display, serif', marginTop: 4 }}>
                  ₹{selectedApp.course?.fee?.toLocaleString()}
                </div>
              </div>

              {payError && <div className="alert alert-error">⚠️ {payError}</div>}

              {/* Payment Mode */}
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select className="form-input" value={payMode} onChange={e => setPayMode(e.target.value)}>
                  <option value="Online">Online</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>

              {/* Payment Deadline */}
              <div className="form-group">
                <label className="form-label">Payment Deadline</label>
                <input
                  className="form-input"
                  type="date"
                  value={payDeadline}
                  onChange={e => setPayDeadline(e.target.value)}
                  required
                />
              </div>

              {/* Mode info */}
              <div style={{ background: 'var(--orange-bg)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--orange)' }}>
                {payMode === 'UPI' && '📱 You will be redirected to your UPI app to complete payment.'}
                {payMode === 'Online' && '🌐 You will complete payment securely online.'}
                {payMode === 'Net Banking' && '🏦 You will be redirected to your bank portal.'}
                {payMode === 'Credit Card' && '💳 Enter your credit card details to complete payment.'}
                {payMode === 'Debit Card' && '💳 Enter your debit card details to complete payment.'}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closePayModal}>Cancel</button>
              <button
                className="btn btn-gold"
                onClick={confirmPayment}
                disabled={paying}
                style={{ minWidth: 120 }}
              >
                {paying ? 'Processing...' : `💳 Pay ₹${selectedApp.course?.fee?.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
