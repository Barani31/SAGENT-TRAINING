import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE = 'http://localhost:8080/api';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]    = useState(null);
  const [form, setForm] = useState({ name: '', duration: '', structure: '', fee: '' });
  const [error, setError] = useState('');

  const load = () => {
    fetch(`${BASE}/courses`).then(r => r.json()).then(d => { setCourses(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', duration: '', structure: '', fee: '' }); setError(''); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, duration: c.duration, structure: c.structure, fee: c.fee }); setError(''); setShowModal(true); };

  const save = async () => {
    if (!form.name || !form.fee) { setError('Name and fee are required.'); return; }
    const body = { name: form.name, duration: form.duration, structure: form.structure, fee: parseFloat(form.fee) };
    if (editing) {
      await fetch(`${BASE}/courses/${editing.courseId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, courseId: editing.courseId }) });
    } else {
      await fetch(`${BASE}/courses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setShowModal(false); load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await fetch(`${BASE}/courses/${id}`, { method: 'DELETE' });
    load();
  };

  const isOfficer = user?.role === 'officer';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Courses</h1>
        <p className="page-subtitle">{isOfficer ? 'Manage available courses for students' : 'Browse available courses'}</p>
      </div>

      {isOfficer && (
        <div style={{ marginBottom: 20 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Course</button>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
        : courses.length === 0
        ? <div className="card"><div className="empty-state"><div className="empty-icon">📚</div><p>No courses added yet.</p></div></div>
        : (
        <div className="course-grid">
          {courses.map(c => (
            <div key={c.courseId} className="course-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="course-name">{c.name}</div>
                {isOfficer && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(c.courseId)}>Delete</button>
                  </div>
                )}
              </div>
              <div className="course-fee">₹{c.fee?.toLocaleString()}</div>
              <div className="course-meta" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {c.duration  && <span>⏱ Duration: {c.duration}</span>}
                {c.structure && <span>📐 Structure: {c.structure}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Course' : 'Add New Course'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">⚠️ {error}</div>}
              <div className="form-group">
                <label className="form-label">Course Name *</label>
                <input className="form-input" placeholder="e.g. B.Tech Computer Science" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Duration</label>
                  <input className="form-input" placeholder="e.g. 4 years" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Application Fee (₹) *</label>
                  <input className="form-input" type="number" placeholder="e.g. 1500" value={form.fee} onChange={e => setForm(p => ({ ...p, fee: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Structure</label>
                <input className="form-input" placeholder="e.g. Semester-based" value={form.structure} onChange={e => setForm(p => ({ ...p, structure: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Add Course'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
