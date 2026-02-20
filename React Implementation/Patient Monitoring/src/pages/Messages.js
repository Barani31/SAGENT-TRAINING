import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageApi, consultationApi } from '../services/api';

export default function Messages() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const isDoctor = user?.role === 'doctor';

  const load = () => {
    const fetch = isDoctor ? messageApi.getByDoctor(user.id) : messageApi.getByPatient(user.id);
    fetch.then(setRows).catch(() => setRows([]));
  };

  useEffect(() => {
    load();
    if (isDoctor) {
      consultationApi.getByDoctor(user.id).then(setConsultations).catch(() => {});
    }
  }, []);

  const openAdd = () => { setForm({ sender: user.name, message: '', consultId: '' }); setError(''); setShowModal(true); };

  const save = async () => {
    try {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      await messageApi.create({
        sender: user.name,
        message: form.message,
        time: timeStr,
        consultation: { consultId: parseInt(form.consultId) },
      });
      setShowModal(false); load();
    } catch { setError('Failed to send. Make sure you select a consultation.'); }
  };

  const del = async (id) => { if (!window.confirm('Delete?')) return; await messageApi.delete(id); load(); };

  const st = {
    wrap: { background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' },
    hdr: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1.5px solid var(--border)' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', background: 'var(--blue-50)', borderBottom: '1.5px solid var(--border)' },
    td: { padding: '13px 16px', fontSize: 14, color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' },
    addBtn: { background: 'var(--blue-500)', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
    delBtn: { background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
    empty: { padding: 40, textAlign: 'center', color: 'var(--text-light)' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(26,39,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
    mbox: { background: 'var(--white)', borderRadius: 12, padding: 32, width: 440, boxShadow: 'var(--shadow-md)' },
    mlabel: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 6, textTransform: 'uppercase' },
    minput: { width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', background: 'var(--bg)', marginBottom: 14 },
    mfooter: { display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' },
    cancelBtn: { background: 'var(--bg)', color: 'var(--text-mid)', border: '1.5px solid var(--border)', padding: '9px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
    saveBtn: { background: 'var(--blue-500)', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>Messages</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 24, fontSize: 14 }}>
        {isDoctor ? 'Send messages to patients via consultations' : 'Messages received from your doctor'}
      </p>
      <div style={st.wrap}>
        <div style={st.hdr}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>Messages</span>
          {isDoctor && <button style={st.addBtn} onClick={openAdd}>+ Send Message</button>}
        </div>
        {rows.length === 0
          ? <div style={st.empty}>No messages found.</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['ID', 'From', 'Message', 'Time', 'Patient', ...(isDoctor ? ['Actions'] : [])].map(h => <th key={h} style={st.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.messageId} style={{ background: i % 2 === 0 ? 'var(--white)' : 'var(--bg)' }}>
                    <td style={st.td}>{r.messageId}</td>
                    <td style={st.td}>{r.sender}</td>
                    <td style={st.td}>{r.message}</td>
                    <td style={st.td}>{r.time}</td>
                    <td style={st.td}>{r.consultation?.patient?.name}</td>
                    {isDoctor && (
                      <td style={st.td}>
                        <button style={st.delBtn} onClick={() => del(r.messageId)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {showModal && (
        <div style={st.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={st.mbox}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Send Message</div>
            {error && <div style={{ color: '#e53e3e', fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <label style={st.mlabel}>Select Consultation (Patient)</label>
            <select style={st.minput} value={form.consultId || ''} onChange={e => setForm({ ...form, consultId: e.target.value })}>
              <option value="">Select consultation</option>
              {consultations.map(c => <option key={c.consultId} value={c.consultId}>#{c.consultId} — {c.patient?.name} ({c.date})</option>)}
            </select>
            <label style={st.mlabel}>Message</label>
            <textarea style={{ ...st.minput, height: 100, resize: 'vertical' }} placeholder="Type your message..."
              value={form.message || ''} onChange={e => setForm({ ...form, message: e.target.value })} />
            <div style={st.mfooter}>
              <button style={st.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={st.saveBtn} onClick={save}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}