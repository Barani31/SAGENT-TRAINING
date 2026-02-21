import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderApi, cartApi, notificationApi, productApi } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState({ orders: 0, cartItems: 0, notifications: 0, products: 0 });
  const [orders, setOrders] = useState([]);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    Promise.all([
      orderApi.getAll(),
      cartApi.getAll(),
      notificationApi.getAll(),
      productApi.getAll(),
    ]).then(([o, c, n, p]) => {
      const myOrders = o.filter(x => x.customer?.customerId === user?.id);
      setOrders(myOrders.slice(0, 4));
      const myNotifs = n.filter(x => x.order?.customer?.customerId === user?.id);
      setNotifs(myNotifs.slice(0, 4));
      const myCart = c.find(x => x.customer?.customerId === user?.id);
      setStats({ orders: myOrders.length, cartItems: myCart ? 1 : 0, notifications: myNotifs.length, products: p.length });
    }).catch(() => {});
  }, [user]);

  const statusColor = (s) => ({ PLACED:'#f97316', CONFIRMED:'#3b82f6', OUT_FOR_DELIVERY:'#8b5cf6', DELIVERED:'#16a34a', CANCELLED:'#dc2626' }[s] || '#78716c');

  const s = {
    heading: { fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1c1917', marginBottom: 4 },
    sub: { color: '#a8a29e', fontSize: 14, marginBottom: 28 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 },
    card: (color) => ({
      background: '#fff', borderRadius: 14, padding: '22px 20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`,
      border: `1px solid #e7e5e4`, borderLeftColor: color,
    }),
    cardNum: (color) => ({ fontSize: 34, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }),
    cardLbl: { fontSize: 13, color: '#78716c', fontWeight: 500 },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
    section: { background: '#fff', borderRadius: 14, padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4' },
    secTitle: { fontSize: 15, fontWeight: 700, color: '#1c1917', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    viewAll: { fontSize: 12, color: '#f97316', fontWeight: 600, textDecoration: 'none' },
    orderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f4' },
    badge: (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '18', color }),
    emptyTxt: { color: '#a8a29e', fontSize: 13, textAlign: 'center', padding: '20px 0' },
    quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 },
    quickCard: {
      background: '#fff', borderRadius: 12, padding: '18px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4',
      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12,
      transition: 'transform 0.15s',
    },
    quickIcon: { fontSize: 28, width: 48, height: 48, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    quickLabel: { fontSize: 13, fontWeight: 700, color: '#1c1917' },
    quickSub: { fontSize: 11, color: '#a8a29e', marginTop: 2 },
  };

  const statCards = [
    { label: 'My Orders',      value: stats.orders,        color: '#f97316' },
    { label: 'Products',       value: stats.products,      color: '#3b82f6' },
    { label: 'Notifications',  value: stats.notifications, color: '#8b5cf6' },
    { label: 'Cart Active',    value: stats.cartItems,     color: '#16a34a' },
  ];

  const quickLinks = [
    { to: '/products',      icon: '🛍️', label: 'Browse Products', sub: 'Shop groceries' },
    { to: '/cart',          icon: '🛒', label: 'My Cart',          sub: 'View & checkout' },
    { to: '/orders',        icon: '📦', label: 'Track Orders',     sub: 'Order status' },
    { to: '/payments',      icon: '💳', label: 'Payments',         sub: 'Payment history' },
    { to: '/notifications', icon: '🔔', label: 'Notifications',    sub: 'Updates & alerts' },
  ];

  return (
    <div>
      <div style={s.heading}>Welcome back, {user?.name} 👋</div>
      <div style={s.sub}>Here's your grocery delivery summary</div>

      <div style={s.grid}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} style={s.card(color)}>
            <div style={s.cardNum(color)}>{value}</div>
            <div style={s.cardLbl}>{label}</div>
          </div>
        ))}
      </div>

      <div style={s.quickGrid}>
        {quickLinks.map(({ to, icon, label, sub }) => (
          <Link key={to} to={to} style={s.quickCard}>
            <div style={s.quickIcon}>{icon}</div>
            <div>
              <div style={s.quickLabel}>{label}</div>
              <div style={s.quickSub}>{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={s.row}>
        <div style={s.section}>
          <div style={s.secTitle}>
            Recent Orders
            <Link to="/orders" style={s.viewAll}>View all →</Link>
          </div>
          {orders.length === 0
            ? <div style={s.emptyTxt}>No orders yet. Start shopping!</div>
            : orders.map(o => (
              <div key={o.orderId} style={s.orderRow}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1c1917' }}>Order #{o.orderId}</div>
                  <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>{o.orderDate}</div>
                </div>
                <span style={s.badge(statusColor(o.status))}>{o.status}</span>
              </div>
            ))}
        </div>

        <div style={s.section}>
          <div style={s.secTitle}>
            Notifications
            <Link to="/notifications" style={s.viewAll}>View all →</Link>
          </div>
          {notifs.length === 0
            ? <div style={s.emptyTxt}>No notifications yet.</div>
            : notifs.map(n => (
              <div key={n.notifyId} style={s.orderRow}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18 }}>🔔</span>
                  <div>
                    <div style={{ fontSize: 13, color: '#1c1917' }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>{n.sentTime?.split('T')[0]}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
