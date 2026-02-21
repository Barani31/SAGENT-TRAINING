import React, { useEffect, useState } from 'react';
import { cartApi, orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [placing, setPlacing]   = useState(false);
  const [address, setAddress]   = useState(user?.address || '');
  const [success, setSuccess]   = useState('');

  const load = () => {
    setLoading(true);
    cartApi.getAll().then(carts => {
      const mine = carts.find(c => c.customer?.customerId === user?.id);
      setCart(mine || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const discount   = cart?.totalPrice > 200 ? 25 : 0;
  const finalTotal = cart ? cart.totalPrice - discount : 0;

  const placeOrder = async () => {
    if (!address.trim()) { alert('Please enter delivery address.'); return; }
    setPlacing(true);
    try {
      const order = await orderApi.create({
        deliveryAddress: address,
        customer: { customerId: user.id },
      });
      // Clear cart after order
      if (cart) {
        await cartApi.update(cart.cartId, { ...cart, totalPrice: 0, discount: 0 });
      }
      setSuccess(`Order #${order.orderId} placed successfully!`);
      setTimeout(() => { setSuccess(''); navigate('/orders'); }, 2000);
    } catch { alert('Failed to place order.'); }
    finally { setPlacing(false); }
  };

  const clearCart = async () => {
    if (!cart) return;
    if (!window.confirm('Clear cart?')) return;
    await cartApi.update(cart.cartId, { ...cart, totalPrice: 0, discount: 0, customer: { customerId: user.id } });
    load();
  };

  const s = {
    heading: { fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 4 },
    sub: { color: '#a8a29e', fontSize: 14, marginBottom: 28 },
    wrap: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' },
    section: { background: '#fff', borderRadius: 14, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4' },
    emptyBox: { textAlign: 'center', padding: '60px 20px', color: '#a8a29e' },
    emptyIcon: { fontSize: 56, marginBottom: 12 },
    emptyText: { fontSize: 15, marginBottom: 16 },
    shopBtn: { background: '#f97316', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    summaryTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 },
    summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 14, color: '#57534e' },
    divider: { borderTop: '1px solid #e7e5e4', margin: '16px 0' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, color: '#1c1917' },
    discountBadge: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, marginBottom: 16, textAlign: 'center' },
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#78716c', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e7e5e4', borderRadius: 8, fontSize: 14, background: '#fafaf9', marginBottom: 16, boxSizing: 'border-box' },
    orderBtn: { width: '100%', padding: '13px', background: '#f97316', color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.35)', marginBottom: 8 },
    clearBtn: { width: '100%', padding: '10px', background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    cartInfoBox: { background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '20px', marginBottom: 16 },
    cartInfoTitle: { fontSize: 15, fontWeight: 700, color: '#1c1917', marginBottom: 8 },
    cartInfoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#57534e', marginBottom: 6 },
    cartInfoVal: { fontWeight: 600, color: '#f97316' },
    success: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 16 },
  };

  if (loading) return <div style={{ color: '#a8a29e', padding: 40 }}>Loading cart...</div>;

  return (
    <div>
      <div style={s.heading}>My Cart 🛒</div>
      <div style={s.sub}>Review items and place your order</div>

      {success && <div style={s.success}>✅ {success}</div>}

      <div style={s.wrap}>
        <div style={s.section}>
          {!cart || cart.totalPrice === 0
            ? (
              <div style={s.emptyBox}>
                <div style={s.emptyIcon}>🛒</div>
                <div style={s.emptyText}>Your cart is empty!</div>
                <button style={s.shopBtn} onClick={() => navigate('/products')}>Browse Products</button>
              </div>
            )
            : (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Cart Summary</div>
                <div style={s.cartInfoBox}>
                  <div style={s.cartInfoTitle}>🛍️ Your Cart</div>
                  <div style={s.cartInfoRow}><span>Cart Total</span><span style={s.cartInfoVal}>₹{cart.totalPrice?.toLocaleString()}</span></div>
                  <div style={s.cartInfoRow}><span>Discount Applied</span><span style={{ fontWeight: 600, color: '#16a34a' }}>- ₹{discount}</span></div>
                  {cart.totalPrice <= 200 && (
                    <div style={{ fontSize: 12, color: '#78716c', marginTop: 8, background: '#fffbf0', padding: '8px 10px', borderRadius: 6 }}>
                      💡 Add ₹{(200 - cart.totalPrice).toFixed(0)} more to get ₹25 discount!
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#a8a29e' }}>
                  Items are added when you click "Add to Cart" on the Products page. The total reflects all added items.
                </div>
              </>
            )}
        </div>

        <div style={s.section}>
          <div style={s.summaryTitle}>Order Summary</div>

          {cart && cart.totalPrice > 0 && (
            <>
              {discount > 0 && (
                <div style={s.discountBadge}>🎉 ₹25 discount applied (order above ₹200)!</div>
              )}
              <div style={s.summaryRow}><span>Cart Total</span><span>₹{cart.totalPrice?.toLocaleString()}</span></div>
              <div style={s.summaryRow}><span>Discount</span><span style={{ color: '#16a34a', fontWeight: 600 }}>- ₹{discount}</span></div>
              <div style={s.summaryRow}><span>Delivery</span><span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span></div>
              <div style={s.divider} />
              <div style={s.totalRow}><span>Total Payable</span><span style={{ color: '#f97316' }}>₹{finalTotal.toLocaleString()}</span></div>
              <div style={s.divider} />
            </>
          )}

          <label style={s.label}>Delivery Address</label>
          <input style={s.input} placeholder="Enter delivery address" value={address} onChange={e => setAddress(e.target.value)} />

          <button
            style={{ ...s.orderBtn, opacity: (!cart || cart.totalPrice === 0 || placing) ? 0.5 : 1 }}
            onClick={placeOrder}
            disabled={!cart || cart.totalPrice === 0 || placing}
          >
            {placing ? 'Placing Order...' : '🛍️ Place Order'}
          </button>

          {cart && cart.totalPrice > 0 && (
            <button style={s.clearBtn} onClick={clearCart}>Clear Cart</button>
          )}
        </div>
      </div>
    </div>
  );
}
