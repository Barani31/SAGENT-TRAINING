import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:8080/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [apps, setApps]         = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/applications`).then(r => r.json()),
      fetch(`${BASE}/payments`).then(r => r.json()),
    ]).then(([a, p]) => {
      setApps(a.filter(x => x.student?.studentId === user.studentId));
      setPayments(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const paid   = apps.filter(a => payments.some(p => p.application?.applicationId === a.applicationId && p.status === 'PAID'));
  const accepted = apps.filter(a => a.status === 'Accepted');
  const pending  = apps.filter(a => a.status === 'Pending' || a.status === 'Under Review');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user.name} 👋</h1>
        <p className="page-subtitle">Track your college applications and payments</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{loading ? '—' : apps.length}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{loading ? '—' : pending.length}</div>
          <div className="stat-label">Under Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{loading ? '—' : accepted.length}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-value">{loading ? '—' : paid.length}</div>
          <div className="stat-label">Payments Done</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Applications</h2>
        </div>
        {loading ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
          : apps.length === 0
          ? <div className="empty-state"><div className="empty-icon">📭</div><p>No applications yet. Go to "Apply Now" to get started!</p></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Course</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {apps.slice(-5).reverse().map(a => {
                  const pay = payments.find(p => p.application?.applicationId === a.applicationId);
                  return (
                    <tr key={a.applicationId}>
                      <td style={{ fontWeight: 600, color: 'var(--navy)' }}>#{a.applicationId}</td>
                      <td>{a.course?.name || 'N/A'}</td>
                      <td>{a.appliedDate || 'N/A'}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>
                        {pay
                          ? <span className={`badge ${pay.status === 'PAID' ? 'badge-paid' : 'badge-unpaid'}`}>{pay.status}</span>
                          : <span className="badge badge-unpaid">Unpaid</span>}
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

export function StatusBadge({ status }) {
  const map = {
    'Pending':      'badge-pending',
    'Under Review': 'badge-review',
    'Accepted':     'badge-accepted',
    'Rejected':     'badge-rejected',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status || 'Pending'}</span>;
}
