import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorApi } from '../services/api';

export default function Doctors() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.role === 'doctor') {
      doctorApi.getById(user.id).then(setProfile).catch(() => {});
    }
  }, []);

  if (user?.role !== 'doctor') return <div style={{ padding: 40, color: 'var(--text-light)' }}>Access restricted.</div>;

  const st = {
    card: { background: 'var(--white)', borderRadius: 'var(--radius)', padding: 32, boxShadow: 'var(--shadow)', maxWidth: 480 },
    label: { fontSize: 11, fontWeight: 700, color: 'var(--blue-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
    value: { fontSize: 15, color: 'var(--text-dark)', marginBottom: 20 },
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>My Profile</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 24, fontSize: 14 }}>Your doctor account details</p>
      {profile && (
        <div style={st.card}>
          {[['Doctor ID', profile.doctorId], ['Name', profile.name], ['Email', profile.email], ['Specialization', profile.specialization], ['Contact', profile.contactNo]].map(([l, v]) => (
            <div key={l}><div style={st.label}>{l}</div><div style={st.value}>{v}</div></div>
          ))}
        </div>
      )}
    </div>
  );
}