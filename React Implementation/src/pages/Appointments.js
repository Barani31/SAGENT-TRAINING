import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentApi, patientApi, doctorApi } from '../services/api';

export default function Appointments() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ appointDate: '', status: '', patientId: '', doctorId: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const isDoctor = user?.role === 'doctor';

  const load = () => {
    const fetch = isDoctor
      ? appointmentApi.getByDoctor(user.id)
      : appointmentApi.getByPatient(user.id);
    fetch.then(setRows).catch(() => setRows([]));
  };

  useEffect(() => {
    load();
    patientApi.getAll().then(setPatients).catch(() => {});
    doctorApi.getAll().then(setDoctors).catch(() => {});
  }, []);

  const openAdd = () => {
    setForm({ appointDate: '', status: 'Scheduled', patientId: isDoctor ? '' : user.id, doctorId: isDoctor ? user.id : '' });
    setEditId(null); setError(''); setShowModal(true);
  };

  const openEdit = (row) => {
    setForm({
      appointDate: row.appointDate || '',
      status: row.status || '',
      patientId: row.patient?.patientId || '',
      doctorId: row.doctor?.doctorId || '',
    });
    setEditId(row.appointId); setError(''); setShowModal(true);
  };

  const save = async () => {
    try {
      const payload = {
        appointDate: form.appointDate,
        status: form.status,
        patient: { patientId: parseInt(form.patientId) },
        doctor: { doctorId: parseInt(form.doctorId) },
      };
      if (editId) await appointmentApi.update(editId, payload);
      else await appointmentApi.create(payload);
      setShowModal(false); load();
    } catch { setError('Failed to save. Check all fields.'); }
  };

  const del = async (id) => {
    if (!window.confirm('Cancel/delete this appointment?')) return;
    await appointmentApi.delete(id); load();
  };

  const statusColor = (s) => s === 'Scheduled' ? '#2196f3' : s === 'Completed' ? '#38a169' : '#e53e3e';

  const st = {
    wrap: { background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' },
    hdr: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1.5px solid var(--border)' },
    title: { fontSize: 18, fontWeight: 600 },
    addBtn: { background: 'var(--blue-500)', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', background: 'var(--blue-50)', borderBottom: '1.5px solid var(--border)' },
    td: { padding: '13px 16px', fontSize: 14, color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' },
    badge: (s) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusColor(s) + '18', color: statusColor(s) }),
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
    err: { color: '#e53e3e', fontSize: 12, marginBottom: 10 },
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>Appointments</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 24, fontSize: 14 }}>
        {isDoctor ? 'Manage appointments — schedule, reschedule or cancel' : 'Your scheduled appointments with doctors'}
      </p>
      <div style={st.wrap}>
        <div style={st.hdr}>
          <span style={st.title}>Appointments</span>
          {isDoctor && <button style={st.addBtn} onClick={openAdd}>+ Schedule</button>}
        </div>
        {rows.length === 0
          ? <div style={st.empty}>No appointments found.</div>
          : (
            <table style={st.table}>
              <thead>
                <tr>
                  <th style={st.th}>ID</th>
                  <th style={st.th}>Date</th>
                  <th style={st.th}>{isDoctor ? 'Patient' : 'Doctor'}</th>
                  <th style={st.th}>Status</th>
                  {isDoctor && <th style={st.th}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.appointId} style={{ background: i % 2 === 0 ? 'var(--white)' : 'var(--bg)' }}>
                    <td style={st.td}>{r.appointId}</td>
                    <td style={st.td}>{r.appointDate}</td>
                    <td style={st.td}>{isDoctor ? r.patient?.name : r.doctor?.name} </td>
                    <td style={st.td}><span style={st.badge(r.status)}>{r.status}</span></td>
                    {isDoctor && (
                      <td style={st.td}>
                        <button style={st.editBtn} onClick={() => openEdit(r)}>Reschedule</button>
                        <button style={st.delBtn} onClick={() => del(r.appointId)}>Cancel</button>
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
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{editId ? 'Reschedule' : 'Schedule'} Appointment</div>
            {error && <div style={st.err}>{error}</div>}

            <label style={st.mlabel}>Date</label>
            <input style={st.minput} type="date" value={form.appointDate} onChange={e => setForm({ ...form, appointDate: e.target.value })} />

            <label style={st.mlabel}>Status</label>
            <select style={st.minput} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <label style={st.mlabel}>Patient</label>
            <select style={st.minput} value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.name}</option>)}
            </select>

            <label style={st.mlabel}>Doctor</label>
            <select style={st.minput} value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>{d.name}</option>)}
            </select>

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