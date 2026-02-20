import React, { useEffect, useState } from 'react';

const s = {
  wrap: { background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1.5px solid var(--border)' },
  title: { fontSize: 18, fontWeight: 600, color: 'var(--text-dark)' },
  addBtn: {
    background: 'var(--blue-500)', color: 'white', border: 'none',
    padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'background 0.15s',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--blue-50)', borderBottom: '1.5px solid var(--border)' },
  td: { padding: '13px 16px', fontSize: 14, color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' },
  editBtn: { background: 'var(--blue-50)', color: 'var(--blue-600)', border: '1px solid var(--blue-200)', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, marginRight: 6, cursor: 'pointer' },
  delBtn: { background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(26,39,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modalBox: { background: 'var(--white)', borderRadius: 'var(--radius)', padding: 32, width: 480, maxWidth: '90vw', boxShadow: 'var(--shadow-md)', maxHeight: '80vh', overflowY: 'auto' },
  modalTitle: { fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--text-dark)' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', color: 'var(--text-dark)', background: 'var(--bg)' },
  modalFooter: { display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' },
  cancelBtn: { background: 'var(--bg)', color: 'var(--text-mid)', border: '1.5px solid var(--border)', padding: '9px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  saveBtn: { background: 'var(--blue-500)', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  empty: { padding: 40, textAlign: 'center', color: 'var(--text-light)', fontSize: 14 },
  error: { padding: '12px 16px', background: '#fff5f5', color: '#e53e3e', borderRadius: 8, fontSize: 13, marginBottom: 16 },
};

export default function CrudTable({ title, fields, api, idField }) {
  const [rows, setRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api.getAll().then(d => { setRows(d); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({}); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (row) => { setForm({ ...row }); setEditId(row[idField]); setError(''); setShowModal(true); };

  const save = async () => {
    try {
      if (editId) await api.update(editId, form);
      else await api.create(form);
      setShowModal(false); load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save. Check backend connection.');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await api.delete(id); load(); } catch { setError('Delete failed.'); }
  };

  const visibleFields = fields.filter(f => !f.hidden);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.title}>{title}</span>
        <button style={s.addBtn} onClick={openAdd}>+ Add New</button>
      </div>
      {loading ? (
        <div style={s.empty}>Loading...</div>
      ) : rows.length === 0 ? (
        <div style={s.empty}>No records found. Add one to get started.</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>{visibleFields.map(f => <th key={f.key} style={s.th}>{f.label}</th>)}<th style={s.th}>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--white)' : 'var(--bg)' }}>
                {visibleFields.map(f => <td key={f.key} style={s.td}>{String(row[f.key] ?? '-')}</td>)}
                <td style={s.td}>
                  <button style={s.editBtn} onClick={() => openEdit(row)}>Edit</button>
                  <button style={s.delBtn} onClick={() => del(row[idField])}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modalBox}>
            <div style={s.modalTitle}>{editId ? 'Edit' : 'Add'} {title}</div>
            {error && <div style={s.error}>{error}</div>}
            {fields.filter(f => !f.noForm).map(f => (
              <div key={f.key} style={s.field}>
                <label style={s.label}>{f.label}</label>
                <input
                  style={s.input}
                  type={f.type || 'text'}
                  value={form[f.key] || ''}
                  placeholder={f.placeholder || f.label}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={s.saveBtn} onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
