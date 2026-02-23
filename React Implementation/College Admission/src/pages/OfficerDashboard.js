import React, { useEffect, useState } from 'react';
import { StatusBadge } from './StudentDashboard';

const BASE = 'http://localhost:8080/api';

export default function OfficerDashboard({ showOnlyApplications = false }) {
  const [apps, setApps]         = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = () => {
    Promise.all([
      fetch(`${BASE}/applications`).then(r => r.json()),
      fetch(`${BASE}/students`).then(r => r.json()),
      fetch(`${BASE}/payments`).then(r => r.json()),
    ]).then(([a, s, p]) => {
      setApps(a); setStudents(s); setPayments(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const pending  = apps.filter(a => a.status === 'Pending');
  const review   = apps.filter(a => a.status === 'Under Review');
  const accepted = apps.filter(a => a.status === 'Accepted');

  const updateStatus = async (id, status) => {
    const app = apps.find(a => a.applicationId === id);
    await fetch(`${BASE}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...app, status }),
    });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{showOnlyApplications ? 'Applications' : 'Officer Dashboard'}</h1>
        <p className="page-subtitle">{showOnlyApplications ? 'Review and manage all student applications' : 'Manage and review student applications'}</p>
      </div>

      {/* Stats - only on dashboard */}
      {!showOnlyApplications && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{loading ? '—' : apps.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{loading ? '—' : pending.length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-value">{loading ? '—' : review.length}</div>
            <div className="stat-label">Under Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{loading ? '—' : accepted.length}</div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{loading ? '—' : students.length}</div>
            <div className="stat-label">Students</div>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Applications</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{apps.length} total</span>
        </div>
        {loading ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
          : apps.length === 0
          ? <div className="empty-state"><div className="empty-icon">📭</div><p>No applications submitted yet.</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(a => {
                  const pay = payments.find(p => p.application?.applicationId === a.applicationId);
                  const isFinalized = a.status === 'Accepted' || a.status === 'Rejected';
                  return (
                    <tr key={a.applicationId}>
                      <td style={{ fontWeight: 600, color: 'var(--navy)' }}>#{a.applicationId}</td>
                      <td>{a.student?.name || 'N/A'}</td>
                      <td>{a.course?.name || 'N/A'}</td>
                      <td>{a.appliedDate || 'N/A'}</td>
                      <td>
                        <span className={`badge ${pay?.status === 'PAID' ? 'badge-paid' : 'badge-unpaid'}`}>
                          {pay?.status || 'Unpaid'}
                        </span>
                      </td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>
                        {isFinalized ? (
                          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Finalised</span>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {a.status !== 'Under Review' && (
                              <button className="btn btn-outline btn-sm"
                                onClick={() => updateStatus(a.applicationId, 'Under Review')}>
                                Review
                              </button>
                            )}
                            <button className="btn btn-success btn-sm"
                              onClick={() => updateStatus(a.applicationId, 'Accepted')}>
                              Accept
                            </button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => updateStatus(a.applicationId, 'Rejected')}>
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}