import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentApi, consultationApi, dailyReadingApi, reportApi } from '../services/api';

const card = (label, count, color) => ({
  label, count, color
});

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (!user) return;
    const id = user.id;

    if (user.role === 'patient') {
      Promise.all([
        appointmentApi.getByPatient(id),
        consultationApi.getByPatient(id),
        dailyReadingApi.getByPatient(id),
        reportApi.getByPatient(id),
      ]).then(([a, c, r, rep]) => setStats([
        card('My Appointments', a.length, 'var(--blue-500)'),
        card('Consultations', c.length, 'var(--blue-400)'),
        card('Daily Readings', r.length, 'var(--blue-200)'),
        card('Reports', rep.length, 'var(--blue-600)'),
      ])).catch(() => {});
    } else {
      Promise.all([
        appointmentApi.getByDoctor(id),
        consultationApi.getByDoctor(id),
      ]).then(([a, c]) => setStats([
        card('My Appointments', a.length, 'var(--blue-500)'),
        card('Consultations Sent', c.length, 'var(--blue-600)'),
      ])).catch(() => {});
    }
  }, [user]);

  const s = {
    heading: { fontFamily: "'DM Serif Display', serif", fontSize: 28, color: 'var(--text-dark)', marginBottom: 6 },
    sub: { color: 'var(--text-light)', fontSize: 14, marginBottom: 32 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 },
    card: (color) => ({
      background: 'var(--white)', borderRadius: 'var(--radius)', padding: '24px',
      boxShadow: 'var(--shadow)', borderLeft: `4px solid ${color}`,
    }),
    num: { fontSize: 36, fontWeight: 700, color: 'var(--blue-600)' },
    lbl: { fontSize: 13, color: 'var(--text-light)', marginTop: 4 },
  };

  return (
    <div>
      <div style={s.heading}>Welcome, {user?.name}</div>
      <div style={s.sub}>
        {user?.role === 'doctor' ? 'Doctor Dashboard — manage your patients and consultations' : 'Patient Dashboard — view your health summary'}
      </div>
      <div style={s.grid}>
        {stats.map(({ label, count, color }) => (
          <div key={label} style={s.card(color)}>
            <div style={s.num}>{count}</div>
            <div style={s.lbl}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}