import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dailyReadingApi } from '../services/api';

export default function DailyReadings() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const isDoctor = user?.role === 'doctor';

  const load = () => {
    const fetch = isDoctor
      ? dailyReadingApi.getAll()
      : dailyReadingApi.getByPatient(user.id);
    fetch.then(setRows).catch(() => setRows([]));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ heartRate: '', bloodPressure: '', oxygenLevel: '', temperature: '', recordedDate: '' }); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (row) => { setForm({ heartRate: row.heartRate, bloodPressure: row.bloodPressure, oxygenLevel: row.oxygenLevel, temperature: row.temperature, recordedDate: row.recordedDate }); setEditId(row.readingId); setError(''); setShowModal(true); };

  const save = async () => {
    try {
      const payload = { ...form, patient: { patientId: user.id } };
      if (editId) await dailyReadingApi.update(editId, payload);
      else await dailyReadingApi.create(payload);
      setShowModal(false); load();
    } catch { setError('Failed to save.'); }
  };

  const del = async (id) => { if (!window.confirm('Delete?')) return; await dailyReadingApi.delete(id); load(); };

  const f = (label, key, type = 'text', placeholder = '') => ({ label, key, type, placeholder });
  const fields = [
    f('Date', 'recordedDate', 'date'),
    f('Heart Rate (bpm)', 'heartRate', 'number'),
    f('Blood Pressure', 'bloodPressure', 'text', 'e.g. 120/80'),
    f('Oxygen Level (%)', 'oxygenLevel', 'number'),
    f('Temperature (°F)', 'temperature', 'number'),
  ];

  const st = {
    wrap: { background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' },
    hdr: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1.5px solid var(--border)' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', background: 'var(--blue-50)', borderBottom: '1.5px solid var(--border)' },
    td: { padding: '13px 16px', fontSize: 14, color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' },
    addBtn: { background: 'var(--blue-500)', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
    editBtn: { background: 'var(--blue-50)', color: 'var(--blue-600)', border: '1px solid var(--blue-200)', padding: '5px 12px', borderRadius: 6, fontSize: 12, marginRight: 6, cursor: 'pointer' },
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
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>Daily Readings</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 24, fontSize: 14 }}>Track vitals — heart rate, blood pressure, oxygen, temperature</p>
      <div style={st.wrap}>
        <div style={st.hdr}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>Daily Readings</span>
          {!isDoctor && <button style={st.addBtn} onClick={openAdd}>+ Add Reading</button>}
        </div>
        {rows.length === 0
          ? <div style={st.empty}>No readings found.</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['ID', 'Date', 'Patient', 'Heart Rate', 'Blood Pressure', 'Oxygen %', 'Temp °F', ...(isDoctor ? [] : ['Actions'])].map(h => <th key={h} style={st.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.readingId} style={{ background: i % 2 === 0 ? 'var(--white)' : 'var(--bg)' }}>
                    <td style={st.td}>{r.readingId}</td>
                    <td style={st.td}>{r.recordedDate}</td>
                    <td style={st.td}>{r.patient?.name}</td>
                    <td style={st.td}>{r.heartRate} bpm</td>
                    <td style={st.td}>{r.bloodPressure}</td>
                    <td style={st.td}>{r.oxygenLevel}%</td>
                    <td style={st.td}>{r.temperature}°F</td>
                    {!isDoctor && (
                      <td style={st.td}>
                        <button style={st.editBtn} onClick={() => openEdit(r)}>Edit</button>
                        <button style={st.delBtn} onClick={() => del(r.readingId)}>Delete</button>
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
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{editId ? 'Edit' : 'Add'} Reading</div>
            {error && <div style={{ color: '#e53e3e', fontSize: 12, marginBottom: 10 }}>{error}</div>}
            {fields.map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={st.mlabel}>{label}</label>
                <input style={st.minput} type={type} placeholder={placeholder} value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div style={st.mfooter}>
              <button style={st.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={st.saveBtn} onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
