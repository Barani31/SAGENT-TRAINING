import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { patientApi } from '../services/api';

export default function Patients() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    if (isDoctor) patientApi.getAll().then(setRows).catch(() => {});
  }, []);

  const st = {
    wrap: { background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', background: 'var(--blue-50)', borderBottom: '1.5px solid var(--border)' },
    td: { padding: '13px 16px', fontSize: 14, color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' },
    empty: { padding: 40, textAlign: 'center', color: 'var(--text-light)' },
  };

  if (!isDoctor) return <div style={{ padding: 40, color: 'var(--text-light)' }}>Access restricted.</div>;

  return (
    <div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>All Patients</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 24, fontSize: 14 }}>View all registered patients and their details</p>
      <div style={st.wrap}>
        {rows.length === 0
          ? <div style={st.empty}>No patients registered yet.</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['ID', 'Name', 'Age', 'Gender', 'Phone', 'Email', 'Address'].map(h => <th key={h} style={st.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.patientId} style={{ background: i % 2 === 0 ? 'var(--white)' : 'var(--bg)' }}>
                    <td style={st.td}>{r.patientId}</td>
                    <td style={st.td}>{r.name}</td>
                    <td style={st.td}>{r.age}</td>
                    <td style={st.td}>{r.gender}</td>
                    <td style={st.td}>{r.phnNo}</td>
                    <td style={st.td}>{r.mail}</td>
                    <td style={st.td}>{r.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}