import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportApi, patientApi, healthDataApi } from '../services/api';

export default function Reports() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [patients, setPatients] = useState([]);
  const [healthData, setHealthData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const isDoctor = user?.role === 'doctor';

  const load = () => {
    const fetch = isDoctor ? reportApi.getAll() : reportApi.getByPatient(user.id);
    fetch.then(setRows).catch(() => setRows([]));
  };

  useEffect(() => {
    load();
    if (isDoctor) {
      patientApi.getAll().then(setPatients).catch(() => {});
      healthDataApi.getAll().then(setHealthData).catch(() => {});
    }
  }, []);

  const openAdd = () => { setForm({ reportDetails: '', filePath: '', patientId: '', healthId: '' }); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (row) => { setForm({ reportDetails: row.reportDetails, filePath: row.filePath, patientId: row.patient?.patientId, healthId: row.healthData?.healthId }); setEditId(row.reportId); setError(''); setShowModal(true); };

  const save = async () => {
    try {
      const payload = {
        reportDetails: form.reportDetails,
        filePath: form.filePath,
        patient: { patientId: parseInt(form.patientId) },
        healthData: form.healthId ? { healthId: parseInt(form.healthId) } : null,
      };
      if (editId) await reportApi.update(editId, payload);
      else await reportApi.create(payload);
      setShowModal(false); load();
    } catch { setError('Failed to save.'); }
  };

  const del = async (id) => { if (!window.confirm('Delete?')) return; await reportApi.delete(id); load(); };

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
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>Reports</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 24, fontSize: 14 }}>
        {isDoctor ? 'Create and send medical reports to patients' : 'Medical reports shared with you by your doctor'}
      </p>
      <div style={st.wrap}>
        <div style={st.hdr}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>Reports</span>
          {isDoctor && <button style={st.addBtn} onClick={openAdd}>+ Add Report</button>}
        </div>
        {rows.length === 0
          ? <div style={st.empty}>No reports found.</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['ID', 'Patient', 'Report Details', 'File Path', ...(isDoctor ? ['Actions'] : [])].map(h => <th key={h} style={st.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.reportId} style={{ background: i % 2 === 0 ? 'var(--white)' : 'var(--bg)' }}>
                    <td style={st.td}>{r.reportId}</td>
                    <td style={st.td}>{r.patient?.name}</td>
                    <td style={st.td}>{r.reportDetails}</td>
                    <td style={st.td}>{r.filePath || '-'}</td>
                    {isDoctor && (
                      <td style={st.td}>
                        <button style={st.editBtn} onClick={() => openEdit(r)}>Edit</button>
                        <button style={st.delBtn} onClick={() => del(r.reportId)}>Delete</button>
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
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{editId ? 'Edit' : 'Add'} Report</div>
            {error && <div style={{ color: '#e53e3e', fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <label style={st.mlabel}>Patient</label>
            <select style={st.minput} value={form.patientId || ''} onChange={e => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.name}</option>)}
            </select>
            <label style={st.mlabel}>Linked Health Record (optional)</label>
            <select style={st.minput} value={form.healthId || ''} onChange={e => setForm({ ...form, healthId: e.target.value })}>
              <option value="">None</option>
              {healthData.map(h => <option key={h.healthId} value={h.healthId}>#{h.healthId} — {h.patient?.name} ({h.recordedDate})</option>)}
            </select>
            <label style={st.mlabel}>Report Details</label>
            <textarea style={{ ...st.minput, height: 80, resize: 'vertical' }} placeholder="Describe the report..." value={form.reportDetails || ''} onChange={e => setForm({ ...form, reportDetails: e.target.value })} />
            <label style={st.mlabel}>File Path / URL (optional)</label>
            <input style={st.minput} placeholder="e.g. /reports/xray.pdf" value={form.filePath || ''} onChange={e => setForm({ ...form, filePath: e.target.value })} />
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