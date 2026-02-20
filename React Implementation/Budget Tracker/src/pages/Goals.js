import React, { useEffect, useState } from 'react';
import { goalApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const st = {
  th: { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--green-50)', borderBottom: '1.5px solid var(--border)' },
  td: { padding: '13px 16px', fontSize: 14, color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' },
  editBtn: { background: 'var(--green-50)', color: 'var(--green-600)', border: '1px solid var(--green-100)', padding: '5px 13px', borderRadius: 6, fontSize: 12, marginRight: 6, cursor: 'pointer' },
  delBtn:  { background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '5px 13px', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  flabel: { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  finput: { width: '100%', padding: '10px 13px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 14 },
};

export default function Goals() {
  const { user } = useAuth();
  const USER_ID = user?.id;

  const [rows, setRows]           = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({});
  const [editId, setEditId]       = useState(null);
  const [error, setError]         = useState('');

  const load = () => {
    if (!USER_ID) return;
    goalApi.getByUser(USER_ID).then(setRows).catch(() => setRows([]));
  };
  useEffect(() => { load(); }, [USER_ID]);

  const openAdd = () => {
    setForm({ goalName: '', targetAmount: '', currentAmount: '0', deadline: '' });
    setEditId(null); setError(''); setShowModal(true);
  };

  const openEdit = (r) => {
    setForm({ goalName: r.goalName, targetAmount: r.targetAmount, currentAmount: r.currentAmount, deadline: r.deadline || '' });
    setEditId(r.goalId); setError(''); setShowModal(true);
  };

  const save = async () => {
    try {
      const payload = {
        goalName: form.goalName,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount || 0),
        deadline: form.deadline || null,
      };
      if (editId) await goalApi.update(editId, payload);
      else        await goalApi.create(USER_ID, payload);
      setShowModal(false); load();
    } catch (e) { setError('Failed to save: ' + (e.response?.data || e.message)); }
  };

  const del = async (id) => { if (!window.confirm('Delete goal?')) return; await goalApi.delete(id); load(); };
  const pct = (current, target) => Math.min(100, Math.round(((current || 0) / (target || 1)) * 100));

  return (
    <div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>Savings Goals</div>
      <div style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 24 }}>Set and track your savings targets</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button style={{ background: 'var(--green-500)', color: 'white', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }} onClick={openAdd}>+ Add Goal</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {rows.length === 0
          ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-light)' }}>No goals set yet. Start saving!</div>
          : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['ID','Goal','Target','Current Savings','Deadline','Progress','Actions'].map(c => <th key={c} style={st.th}>{c}</th>)}</tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const p = pct(r.currentAmount, r.targetAmount);
                  return (
                    <tr key={r.goalId} style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg)' }}>
                      <td style={st.td}>{r.goalId}</td>
                      <td style={{ ...st.td, fontWeight: 600, color: 'var(--text-dark)' }}>🎯 {r.goalName}</td>
                      <td style={st.td}>₹{r.targetAmount?.toLocaleString()}</td>
                      <td style={{ ...st.td, color: 'var(--green-600)', fontWeight: 600 }}>₹{r.currentAmount?.toLocaleString()}</td>
                      <td style={st.td}>{r.deadline || '-'}</td>
                      <td style={{ ...st.td, minWidth: 130 }}>
                        <div style={{ height: 8, borderRadius: 4, background: `linear-gradient(to right, var(--green-500) ${p}%, var(--green-100) ${p}%)` }} />
                        <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>{p}% complete</span>
                      </td>
                      <td style={st.td}>
                        <button style={st.editBtn} onClick={() => openEdit(r)}>Edit</button>
                        <button style={st.delBtn}  onClick={() => del(r.goalId)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>}
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,46,34,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(2px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: 460, maxWidth: '92vw', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>{editId ? 'Edit' : 'Add'} Goal</div>
            {error && <div style={{ background: '#fff5f5', color: '#c53030', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <label style={st.flabel}>Goal Name</label>
            <input style={st.finput} placeholder="e.g. Vacation Fund" value={form.goalName || ''} onChange={e => setForm({...form, goalName: e.target.value})} />
            <label style={st.flabel}>Target Amount (₹)</label>
            <input style={st.finput} type="number" value={form.targetAmount || ''} onChange={e => setForm({...form, targetAmount: e.target.value})} />
            <label style={st.flabel}>Current Amount Saved (₹)</label>
            <input style={st.finput} type="number" value={form.currentAmount || ''} onChange={e => setForm({...form, currentAmount: e.target.value})} />
            <label style={st.flabel}>Deadline</label>
            <input style={st.finput} type="date" value={form.deadline || ''} onChange={e => setForm({...form, deadline: e.target.value})} />
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