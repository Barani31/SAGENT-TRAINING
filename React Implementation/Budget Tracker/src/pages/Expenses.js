import React, { useEffect, useState } from 'react';
import { expenseApi, userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const st = {
  th: { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--green-50)', borderBottom: '1.5px solid var(--border)' },
  td: { padding: '13px 16px', fontSize: 14, color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' },
  editBtn: { background: 'var(--green-50)', color: 'var(--green-600)', border: '1px solid var(--green-100)', padding: '5px 13px', borderRadius: 6, fontSize: 12, marginRight: 6, cursor: 'pointer' },
  delBtn:  { background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '5px 13px', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  flabel: { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  finput: { width: '100%', padding: '10px 13px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 14 },
};

const catColor = (c) => ({ Food: '#ed8936', Travel: '#4299e1', Shopping: '#9f7aea', Other: '#718096' }[c] || '#718096');

export default function Expenses() {
  const { user } = useAuth();
  const [rows, setRows]           = useState([]);
  const [users, setUsers]         = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({});
  const [editId, setEditId]       = useState(null);
  const [error, setError]         = useState('');

  const load = () => expenseApi.getAll().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); userApi.getAll().then(setUsers).catch(() => {}); }, []);

  const openAdd = () => {
    setForm({ category: '', amount: '', spentDate: '', description: '', userId: user?.id });
    setEditId(null); setError(''); setShowModal(true);
  };

  const openEdit = (r) => {
    setForm({ category: r.category, amount: r.amount, spentDate: r.spentDate || '', description: r.description || '', userId: r.user?.userId });
    setEditId(r.expenseId); setError(''); setShowModal(true);
  };

  const save = async () => {
    try {
      const payload = {
        category: form.category,
        amount: parseFloat(form.amount),
        spentDate: form.spentDate,
        description: form.description,
        user: { userId: parseInt(form.userId) },
      };
      if (editId) await expenseApi.update(editId, payload);
      else        await expenseApi.create(payload);
      setShowModal(false); load();
    } catch (e) { setError('Failed to save.'); }
  };

  const del = async (id) => { if (!window.confirm('Delete?')) return; await expenseApi.delete(id); load(); };
  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
  const badge = (c) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: catColor(c) + '18', color: catColor(c) });

  return (
    <div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>Expenses</div>
      <div style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 24 }}>Log and categorize your daily spending</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 20px', fontSize: 14 }}>
          <span style={{ color: 'var(--text-light)', marginRight: 8 }}>Total Expenses:</span>
          <span style={{ fontWeight: 700, color: '#e53e3e' }}>₹{total.toLocaleString()}</span>
        </span>
        <button style={{ background: 'var(--green-500)', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }} onClick={openAdd}>+ Log Expense</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {rows.length === 0
          ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-light)' }}>No expenses logged yet.</div>
          : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['ID','Category','Amount','Date','Description','User','Actions'].map(c => <th key={c} style={st.th}>{c}</th>)}</tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.expenseId} style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg)' }}>
                    <td style={st.td}>{r.expenseId}</td>
                    <td style={st.td}><span style={badge(r.category)}>{r.category}</span></td>
                    <td style={{ ...st.td, color: '#e53e3e', fontWeight: 600 }}>₹{r.amount?.toLocaleString()}</td>
                    <td style={st.td}>{r.spentDate || '-'}</td>
                    <td style={st.td}>{r.description || '-'}</td>
                    <td style={st.td}>{r.user?.name}</td>
                    <td style={st.td}>
                      <button style={st.editBtn} onClick={() => openEdit(r)}>Edit</button>
                      <button style={st.delBtn}  onClick={() => del(r.expenseId)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,46,34,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(2px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: 460, maxWidth: '92vw', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>{editId ? 'Edit' : 'Log'} Expense</div>
            {error && <div style={{ background: '#fff5f5', color: '#c53030', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <label style={st.flabel}>Category</label>
            <select style={st.finput} value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="">Select category</option>
              {['Food','Travel','Shopping','Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={st.flabel}>Amount (₹)</label>
            <input style={st.finput} type="number" value={form.amount || ''} onChange={e => setForm({...form, amount: e.target.value})} />
            <label style={st.flabel}>Date</label>
            <input style={st.finput} type="date" value={form.spentDate || ''} onChange={e => setForm({...form, spentDate: e.target.value})} />
            <label style={st.flabel}>Description</label>
            <input style={st.finput} placeholder="What was this for?" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
            <label style={st.flabel}>User</label>
            <select style={st.finput} value={form.userId || ''} onChange={e => setForm({...form, userId: e.target.value})}>
              <option value="">Select user</option>
              {users.map(u => <option key={u.userId} value={u.userId}>{u.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button style={{ background: 'var(--bg)', color: 'var(--text-mid)', border: '1.5px solid var(--border)', padding: '9px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={{ background: 'var(--green-500)', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}