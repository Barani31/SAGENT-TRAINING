import React, { useEffect, useState } from 'react';
import { productApi, categoryApi, cartApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter]         = useState('all');
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ price: '', quantity: '', categoryId: '', productName: '' });
  const [editId, setEditId]         = useState(null);
  const [error, setError]           = useState('');
  const [addedMsg, setAddedMsg]     = useState('');

  const load = () => {
    productApi.getAll().then(setProducts).catch(() => {});
    categoryApi.getAll().then(data => {
      // Remove duplicate category names
      const unique = data.filter((c, idx, arr) =>
        arr.findIndex(x => x.categoryType?.toLowerCase() === c.categoryType?.toLowerCase()) === idx
      );
      setCategories(unique);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  // Filter products by selected category
  const filtered = filter === 'all'
    ? products
    : products.filter(p => p.category?.categoryId === parseInt(filter));

  const openAdd  = () => { setForm({ price: '', quantity: '', categoryId: '', productName: '' }); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (p) => {
    setForm({ price: p.price, quantity: p.quantity, categoryId: p.category?.categoryId || '', productName: p.productName || '' });
    setEditId(p.productId); setError(''); setShowModal(true);
  };

  const save = async () => {
    if (!form.categoryId) { setError('Please select a category.'); return; }
    try {
      const payload = {
        productName: form.productName,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        category: { categoryId: parseInt(form.categoryId) }
      };
      if (editId) await productApi.update(editId, payload);
      else        await productApi.create(payload);
      setShowModal(false); load();
    } catch { setError('Failed to save.'); }
  };

  const del = async (id) => { if (!window.confirm('Delete product?')) return; await productApi.delete(id); load(); };

  const addToCart = async (product) => {
    try {
      const carts = await cartApi.getAll();
      let myCart  = carts.find(c => c.customer?.customerId === user?.id);
      const newTotal = myCart ? myCart.totalPrice + product.price : product.price;
      const discount = newTotal > 200 ? 25 : 0;
      if (myCart) {
        await cartApi.update(myCart.cartId, { ...myCart, totalPrice: newTotal, discount, customer: { customerId: user.id } });
      } else {
        await cartApi.create({ totalPrice: product.price, discount: 0, customer: { customerId: user.id } });
      }
      setAddedMsg(`Added to cart! Cart total: ₹${newTotal.toFixed(0)}${newTotal > 200 ? ' (₹25 discount applied!)' : ''}`);
      setTimeout(() => setAddedMsg(''), 3000);
    } catch { alert('Failed to add to cart.'); }
  };

  const catEmoji = (type) => ({
    Fruits:'🍎', Vegetables:'🥦', Dairy:'🥛', Bakery:'🍞',
    Beverages:'🥤', Snacks:'🍿', Meat:'🥩', Other:'🛒'
  }[type] || '🛒');

  const catBg = (type) => ({
    Fruits:'#fff1f2', Vegetables:'#f0fdf4', Dairy:'#eff6ff', Bakery:'#fffbeb',
    Beverages:'#f0f9ff', Snacks:'#fdf4ff', Meat:'#fff5f5', Other:'#fafaf9'
  }[type] || '#fff7ed');

  const s = {
    heading: { fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 4 },
    sub: { color: '#a8a29e', fontSize: 14, marginBottom: 24 },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
    filterWrap: { display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 },
    filterBtn: (active) => ({
      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      border: active ? '2px solid #f97316' : '2px solid #e7e5e4',
      background: active ? '#fff7ed' : '#fff',
      color: active ? '#f97316' : '#78716c', cursor: 'pointer', transition: 'all 0.15s',
    }),
    addBtn: { background: '#f97316', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },

    // Category section display
    catSection: { marginBottom: 36 },
    catHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
    catTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#1c1917' },
    catCount: { fontSize: 12, color: '#a8a29e', fontWeight: 600 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 },

    card: (bg) => ({
      background: '#fff', borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e7e5e4',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }),
    cardTop: (bg) => ({
      height: 100, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 46, background: bg,
    }),
    cardBody: { padding: '12px 14px' },
    productName: { fontSize: 13, fontWeight: 700, color: '#1c1917', marginBottom: 2 },
    catLabel: { fontSize: 11, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
    price: { fontSize: 20, fontWeight: 700, color: '#1c1917', marginBottom: 2 },
    qty: { fontSize: 11, color: '#a8a29e', marginBottom: 10 },
    cardBtns: { display: 'flex', gap: 5 },
    cartBtn: { flex: 1, background: '#f97316', color: 'white', border: 'none', padding: '7px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' },
    editBtn: { background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa', padding: '7px 9px', borderRadius: 7, fontSize: 11, cursor: 'pointer' },
    delBtn:  { background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 9px', borderRadius: 7, fontSize: 11, cursor: 'pointer' },

    noProducts: { color: '#a8a29e', fontSize: 13, padding: '16px 0' },
    emptyAll: { textAlign: 'center', color: '#a8a29e', padding: 60 },

    toast: {
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: '#16a34a', color: 'white', padding: '12px 24px',
      borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
    },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
    mbox: { background: '#fff', borderRadius: 16, padding: 32, width: 400, maxWidth: '92vw' },
    flabel: { display: 'block', fontSize: 11, fontWeight: 700, color: '#78716c', marginBottom: 5, textTransform: 'uppercase' },
    finput: { width: '100%', padding: '10px 12px', border: '1.5px solid #e7e5e4', borderRadius: 8, fontSize: 14, marginBottom: 13, background: '#fafaf9', boxSizing: 'border-box', outline: 'none' },
    saveBtn: { background: '#f97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    cancelBtn: { background: '#fafaf9', color: '#78716c', border: '1.5px solid #e7e5e4', padding: '10px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginRight: 8 },
  };

  // Build display: either all categories or just filtered one
  const displayCategories = filter === 'all'
    ? categories
    : categories.filter(c => c.categoryId === parseInt(filter));

  return (
    <div>
      <div style={s.heading}>Browse Products 🛍️</div>
      <div style={s.sub}>Fresh groceries available for delivery</div>

      <div style={s.topRow}>
        <div style={s.filterWrap}>
          <button style={s.filterBtn(filter === 'all')} onClick={() => setFilter('all')}>All</button>
          {categories.map(c => (
            <button key={c.categoryId} style={s.filterBtn(filter === String(c.categoryId))}
              onClick={() => setFilter(String(c.categoryId))}>
              {catEmoji(c.categoryType)} {c.categoryType}
            </button>
          ))}
        </div>
        <button style={s.addBtn} onClick={openAdd}>+ Add Product</button>
      </div>

      {/* Products grouped by category */}
      {products.length === 0 && filter === 'all'
        ? <div style={s.emptyAll}><div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>No products yet. Add some!</div>
        : displayCategories.map(cat => {
          const catProducts = products.filter(p => p.category?.categoryId === cat.categoryId);
          if (filter === 'all' && catProducts.length === 0) return null; // hide empty categories in "All" view
          return (
            <div key={cat.categoryId} style={s.catSection}>
              <div style={s.catHeader}>
                <span style={{ fontSize: 24 }}>{catEmoji(cat.categoryType)}</span>
                <span style={s.catTitle}>{cat.categoryType}</span>
                <span style={s.catCount}>({catProducts.length} item{catProducts.length !== 1 ? 's' : ''})</span>
              </div>

              {catProducts.length === 0
                ? <div style={s.noProducts}>No products in this category yet.</div>
                : <div style={s.grid}>
                    {catProducts.map(p => (
                      <div key={p.productId} style={s.card(catBg(cat.categoryType))}>
                        <div style={s.cardTop(catBg(cat.categoryType))}>{catEmoji(cat.categoryType)}</div>
                        <div style={s.cardBody}>
                          <div style={s.productName}>{p.productName || cat.categoryType}</div>
                          <div style={s.catLabel}>{cat.categoryType}</div>
                          <div style={s.price}>₹{p.price?.toLocaleString()}</div>
                          <div style={s.qty}>Qty: {p.quantity} available</div>
                          <div style={s.cardBtns}>
                            <button style={s.cartBtn} onClick={() => addToCart(p)}>🛒 Add to Cart</button>
                            <button style={s.editBtn} onClick={() => openEdit(p)}>✏️</button>
                            <button style={s.delBtn}  onClick={() => del(p.productId)}>🗑</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          );
        })
      }

      {addedMsg && <div style={s.toast}>✅ {addedMsg}</div>}

      {showModal && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.mbox}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>{editId ? 'Edit' : 'Add'} Product</div>
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <label style={s.flabel}>Product Name</label>
            <input style={s.finput} placeholder="e.g. Fresh Tomatoes" value={form.productName}
              onChange={e => setForm({...form, productName: e.target.value})} />

            <label style={s.flabel}>Category</label>
            <select style={s.finput} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{catEmoji(c.categoryType)} {c.categoryType}</option>)}
            </select>

            <label style={s.flabel}>Price (₹)</label>
            <input style={s.finput} type="number" placeholder="e.g. 49" value={form.price}
              onChange={e => setForm({...form, price: e.target.value})} />

            <label style={s.flabel}>Quantity Available</label>
            <input style={s.finput} type="number" placeholder="e.g. 100" value={form.quantity}
              onChange={e => setForm({...form, quantity: e.target.value})} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={s.saveBtn}   onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}