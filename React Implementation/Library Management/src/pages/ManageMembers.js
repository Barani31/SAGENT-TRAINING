import React, { useEffect, useState } from 'react';

const BASE = 'http://localhost:8080/api';
const safe = (d) => (Array.isArray(d) ? d : []);

export default function ManageMembers() {
  const [members, setMembers] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/members`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/borrow`).then(r => r.json()).catch(() => []),
    ]).then(([m, b]) => {
      setMembers(safe(m)); setBorrows(safe(b)); setLoading(false);
    });
  }, []);

  const filtered = safe(members).filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Members</h1>
        <p className="page-subtitle">All registered library members</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Member Registry ({filtered.length})</h2>
          <input className="form-input" style={{ width: 240 }} placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
          : filtered.length === 0
          ? <div className="empty-state"><div className="empty-icon">👥</div><p>No members found.</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Category</th><th>Email</th><th>Phone</th><th>Active Borrows</th><th>Details</th></tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const active = safe(borrows).filter(b => b.member?.memId === m.memId && b.status !== 'RETURNED' && b.status !== 'CANCELLED').length;
                  return (
                    <tr key={m.memId}>
                      <td style={{ fontWeight: 600, color: 'var(--forest)' }}>#{m.memId}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {m.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          {m.name}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${m.category === 'Student' ? 'badge-blue' : m.category === 'Staff' ? 'badge-amber' : 'badge-gray'}`}>
                          {m.category || 'Member'}
                        </span>
                      </td>
                      <td>{m.email || '—'}</td>
                      <td>{m.phNo || '—'}</td>
                      <td>
                        <span style={{ background: active > 0 ? 'var(--forest)' : 'var(--gray-200)', color: active > 0 ? 'white' : 'var(--gray-400)', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                          {active}
                        </span>
                      </td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(m)}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Member Profile</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: 'var(--forest)', borderRadius: 10 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--amber)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
                  {selected.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{selected.category || 'Member'} · {selected.email}</div>
                </div>
              </div>
              {[['Library ID', `#${selected.memId}`], ['Phone', selected.phNo || 'N/A'], ['Address', selected.address || 'N/A']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 14 }}>
                  <span style={{ color: 'var(--gray-400)' }}>{l}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--forest)', marginBottom: 8 }}>Borrow History</div>
                {safe(borrows).filter(b => b.member?.memId === selected.memId).length === 0
                  ? <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No borrows yet</p>
                  : safe(borrows).filter(b => b.member?.memId === selected.memId).map(b => (
                    <div key={b.borrowId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--gray-100)', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <span>{b.book?.name}</span>
                      <span className={`badge ${b.status === 'RETURNED' ? 'badge-green' : b.status === 'OVERDUE' ? 'badge-red' : 'badge-blue'}`}>{b.status}</span>
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
