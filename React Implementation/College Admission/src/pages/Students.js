import React, { useEffect, useState } from 'react';

const BASE = 'http://localhost:8080/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [apps, setApps]         = useState([]);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/students`).then(r => r.json()),
      fetch(`${BASE}/applications`).then(r => r.json()),
    ]).then(([s, a]) => {
      setStudents(s); setApps(a); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-subtitle">All registered students and their applications</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Student Registry</h2>
          <input className="form-input" placeholder="Search by name or email..."
            style={{ width: 240 }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
          : filtered.length === 0
          ? <div className="empty-state"><div className="empty-icon">👥</div><p>No students found.</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>DOB</th>
                  <th>Applications</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const count = apps.filter(a => a.student?.studentId === s.studentId).length;
                  return (
                    <tr key={s.studentId}>
                      <td style={{ fontWeight: 600, color: 'var(--navy)' }}>#{s.studentId}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'var(--navy)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 600, flexShrink: 0,
                          }}>
                            {s.name?.[0]?.toUpperCase()}
                          </div>
                          {s.name}
                        </div>
                      </td>
                      <td>{s.email}</td>
                      <td>{s.phnNo || 'N/A'}</td>
                      <td>{s.gender || 'N/A'}</td>
                      <td>{s.dob || 'N/A'}</td>
                      <td>
                        <span style={{
                          background: count > 0 ? 'var(--navy)' : 'var(--gray-200)',
                          color: count > 0 ? 'white' : 'var(--gray-400)',
                          borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600,
                        }}>{count}</span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(s)}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Student Profile</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: 'var(--navy)', borderRadius: 10 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'var(--gold)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700,
                }}>
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{selected.email}</div>
                </div>
              </div>

              {[
                ['Student ID', `#${selected.studentId}`],
                ['Phone', selected.phnNo || 'N/A'],
                ['Date of Birth', selected.dob || 'N/A'],
                ['Gender', selected.gender || 'N/A'],
                ['Address', selected.address || 'N/A'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 14 }}>
                  <span style={{ color: 'var(--gray-400)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 8 }}>Applications</div>
                {apps.filter(a => a.student?.studentId === selected.studentId).length === 0
                  ? <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No applications</p>
                  : apps.filter(a => a.student?.studentId === selected.studentId).map(a => (
                    <div key={a.applicationId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--gray-100)', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <span>#{a.applicationId} — {a.course?.name}</span>
                      <span className={`badge ${a.status === 'Accepted' ? 'badge-accepted' : a.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>{a.status}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
