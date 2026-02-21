import React, { useEffect, useState } from 'react';
import { orderApi, paymentApi, notificationApi, deliveryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders]     = useState([]);
  const [delivery, setDelivery] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [payModal, setPayModal] = useState(null); // order to pay for
  const [payForm, setPayForm]   = useState({ mode: 'UPI', amount: '' });
  const [paying, setPaying]     = useState(false);
  const [payments, setPayments] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([orderApi.getAll(), paymentApi.getAll(), deliveryApi.getAll()])
      .then(([o, p, d]) => {
        setOrders(o.filter(x => x.customer?.customerId === user?.id));
        setPayments(p);
        setDelivery(d);
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const cancelOrder = async (order) => {
    if (!window.confirm('Cancel this order?')) return;
    await orderApi.update(order.orderId, { ...order, status: 'CANCELLED', customer: { customerId: user.id } });
    // send notification
    await notificationApi.create({ message: `Order #${order.orderId} has been cancelled.`, order: { orderId: order.orderId } });
    load();
  };

  const updateStatus = async (order, status) => {
    await orderApi.update(order.orderId, { ...order, status, customer: { customerId: user.id } });
    await notificationApi.create({ message: `Order #${order.orderId} is now ${status.replace(/_/g,' ')}.`, order: { orderId: order.orderId } });
    load();
  };

  const openPayModal = (order) => {
    const discount = order.totalAmount > 200 ? 25 : 0;
    setPayForm({ mode: 'UPI', amount: '' });
    setPayModal(order);
  };

  const submitPayment = async () => {
    if (!payForm.amount) { alert('Enter amount'); return; }
    setPaying(true);
    try {
      await paymentApi.create({ mode: payForm.mode, amount: parseFloat(payForm.amount), order: { orderId: payModal.orderId } });
      await notificationApi.create({ message: `Payment of ₹${payForm.amount} received for Order #${payModal.orderId}.`, order: { orderId: payModal.orderId } });
      setPayModal(null);
      load();
    } catch { alert('Payment failed.'); }
    finally { setPaying(false); }
  };

  const isPaid = (orderId) => payments.some(p => p.order?.orderId === orderId);

  const statusColor = (s) => ({
    PLACED:'#f97316', CONFIRMED:'#3b82f6', OUT_FOR_DELIVERY:'#8b5cf6', DELIVERED:'#16a34a', CANCELLED:'#dc2626'
  }[s] || '#78716c');

  const statusSteps = ['PLACED','CONFIRMED','OUT_FOR_DELIVERY','DELIVERED'];
  const stepIdx = (s) => statusSteps.indexOf(s);

  const s = {
    heading: { fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 4 },
    sub: { color: '#a8a29e', fontSize: 14, marginBottom: 28 },
    empty: { textAlign: 'center', padding: 60, color: '#a8a29e' },
    card: { background: '#fff', borderRadius: 14, padding: '22px 24px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    orderId: { fontSize: 16, fontWeight: 700, color: '#1c1917' },
    orderDate: { fontSize: 12, color: '#a8a29e', marginTop: 2 },
    badge: (color) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '18', color }),
    address: { fontSize: 13, color: '#57534e', marginBottom: 16 },
    // Tracker
    tracker: { display: 'flex', alignItems: 'center', marginBottom: 20 },
    step: (done, current) => ({
      width: 28, height: 28, borderRadius: '50%',
      background: done ? '#f97316' : current ? '#fff7ed' : '#f5f5f4',
      border: done ? '2px solid #f97316' : current ? '2px solid #f97316' : '2px solid #e7e5e4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, color: done ? '#fff' : current ? '#f97316' : '#a8a29e',
      fontWeight: 700, flexShrink: 0,
    }),
    stepLine: (done) => ({ flex: 1, height: 2, background: done ? '#f97316' : '#e7e5e4', margin: '0 4px' }),
    stepLabels: { display: 'flex', justifyContent: 'space-between', marginBottom: 20 },
    stepLabel: (done) => ({ fontSize: 10, fontWeight: 600, color: done ? '#f97316' : '#a8a29e', textAlign: 'center', flex: 1 }),
    actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    payBtn: { background: '#f97316', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    cancelBtn: { background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    paidBadge: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700 },
    // Simulate buttons (for demo)
    simBtn: (color) => ({ background: color + '18', color, border: `1px solid ${color}40`, padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer' }),
    // Modal
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
    mbox: { background: '#fff', borderRadius: 16, padding: 32, width: 380, maxWidth: '92vw' },
    mlabel: { display: 'block', fontSize: 11, fontWeight: 700, color: '#78716c', marginBottom: 5, textTransform: 'uppercase' },
    minput: { width: '100%', padding: '10px 12px', border: '1.5px solid #e7e5e4', borderRadius: 8, fontSize: 14, marginBottom: 13, background: '#fafaf9', boxSizing: 'border-box' },
    modeRow: { display: 'flex', gap: 8, marginBottom: 13 },
    modeBtn: (active) => ({ flex: 1, padding: '9px', border: active ? '2px solid #f97316' : '2px solid #e7e5e4', borderRadius: 8, background: active ? '#fff7ed' : '#fafaf9', color: active ? '#f97316' : '#78716c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }),
    confirmBtn: { width: '100%', padding: '12px', background: '#f97316', color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    mcancel: { width: '100%', padding: '10px', background: '#fafaf9', color: '#78716c', border: '1.5px solid #e7e5e4', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginTop: 8 },
  };

  if (loading) return <div style={{ color: '#a8a29e', padding: 40 }}>Loading orders...</div>;

  return (
    <div>
      <div style={s.heading}>My Orders 📦</div>
      <div style={s.sub}>Track and manage your grocery orders</div>

      {orders.length === 0
        ? <div style={s.empty}><div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>No orders yet. Go shop!</div>
        : orders.map(order => {
          const curStep = stepIdx(order.status);
          const paid    = isPaid(order.orderId);
          return (
            <div key={order.orderId} style={s.card}>
              <div style={s.cardTop}>
                <div>
                  <div style={s.orderId}>Order #{order.orderId}</div>
                  <div style={s.orderDate}>{order.orderDate}</div>
                </div>
                <span style={s.badge(statusColor(order.status))}>{order.status?.replace(/_/g,' ')}</span>
              </div>

              <div style={s.address}>📍 {order.deliveryAddress}</div>

              {/* Order tracker */}
              {order.status !== 'CANCELLED' && (
                <>
                  <div style={s.tracker}>
                    {statusSteps.map((step, i) => (
                      <React.Fragment key={step}>
                        <div style={s.step(i < curStep, i === curStep)}>{i < curStep ? '✓' : i+1}</div>
                        {i < statusSteps.length - 1 && <div style={s.stepLine(i < curStep)} />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={s.stepLabels}>
                    {['Placed','Confirmed','Out for Delivery','Delivered'].map((lbl, i) => (
                      <div key={lbl} style={s.stepLabel(i <= curStep)}>{lbl}</div>
                    ))}
                  </div>
                </>
              )}

              <div style={s.actions}>
                {/* Pay button */}
                {!paid
                  ? <button style={s.payBtn} onClick={() => openPayModal(order)}>💳 Pay Now</button>
                  : <span style={s.paidBadge}>✅ Paid</span>}

                {/* Cancel — only if PLACED */}
                {order.status === 'PLACED' && (
                  <button style={s.cancelBtn} onClick={() => cancelOrder(order)}>✕ Cancel Order</button>
                )}

                {/* Simulate status for demo */}
                {order.status === 'PLACED' && (
                  <button style={s.simBtn('#3b82f6')} onClick={() => updateStatus(order,'CONFIRMED')}>→ Confirm</button>
                )}
                {order.status === 'CONFIRMED' && (
                  <button style={s.simBtn('#8b5cf6')} onClick={() => updateStatus(order,'OUT_FOR_DELIVERY')}>→ Out for Delivery</button>
                )}
                {order.status === 'OUT_FOR_DELIVERY' && (
                  <button style={s.simBtn('#16a34a')} onClick={() => updateStatus(order,'DELIVERED')}>→ Delivered</button>
                )}
              </div>
            </div>
          );
        })}

      {/* Payment modal */}
      {payModal && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setPayModal(null)}>
          <div style={s.mbox}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>💳 Pay for Order #{payModal.orderId}</div>
            <div style={{ fontSize: 13, color: '#a8a29e', marginBottom: 20 }}>Choose payment method</div>

            <label style={s.mlabel}>Payment Mode</label>
            <div style={s.modeRow}>
              {['UPI','Card','Wallet','COD'].map(m => (
                <button key={m} style={s.modeBtn(payForm.mode===m)} onClick={() => setPayForm({...payForm, mode: m})}>{m}</button>
              ))}
            </div>

            <label style={s.mlabel}>Amount (₹)</label>
            <input style={s.minput} type="number" placeholder="Enter amount" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} />

            <button style={s.confirmBtn} onClick={submitPayment} disabled={paying}>
              {paying ? 'Processing...' : `Pay ₹${payForm.amount || '0'} via ${payForm.mode}`}
            </button>
            <button style={s.mcancel} onClick={() => setPayModal(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
