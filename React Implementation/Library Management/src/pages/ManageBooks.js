import React, { useEffect, useState } from 'react';
import { StatusBadge } from './MemberDashboard';

const BASE = 'http://localhost:8080/api';
const safe = (d) => (Array.isArray(d) ? d : []);

export default function ManageBooks() {
  const [books, setBooks]         = useState([]);
  const [inventory, setInventory] = useState([]);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({ name: '', author: '', totalCopies: 1 });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState('');

  const load = () => {
    Promise.all([
      fetch(`${BASE}/books`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/inventory`).then(r => r.json()).catch(() => []),
    ]).then(([b, inv]) => {
      setBooks(safe(b));
      setInventory(safe(inv));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const getInv = (bookId) => safe(inventory).find(i => i.book?.bookId === bookId);

  const openAdd  = () => { setEditing(null); setForm({ name: '', author: '', totalCopies: 1 }); setError(''); setShowModal(true); };
  const openEdit = (b) => {
    const inv = getInv(b.bookId);
    setEditing(b);
    setForm({ name: b.name, author: b.author, totalCopies: inv?.totalCopies || 1 });
    setError(''); setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.author) { setError('Name and author are required.'); return; }
    try {
      if (editing) {
        await fetch(`${BASE}/books/${editing.bookId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: editing.bookId, name: form.name, author: form.author }),
        });
      } else {
        const res = await fetch(`${BASE}/books`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, author: form.author }),
        });
        const bookData = await res.json();
        await fetch(`${BASE}/inventory`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book: { bookId: bookData.bookId },
            totalCopies: parseInt(form.totalCopies) || 1,
            availableCopies: parseInt(form.totalCopies) || 1,
            lostCopies: 0, damagedCopies: 0,
            lastUpdated: new Date().toISOString().split('T')[0],
          }),
        });
      }
      setMsg('✅ Book saved successfully!');
      setShowModal(false); load();
    } catch { setError('Failed to save. Please try again.'); }
  };

  const deleteBook = async (id) => {
    if (!window.confirm('Delete this book from catalog?')) return;
    try {
      await fetch(`${BASE}/books/${id}`, { method: 'DELETE' });
      setMsg('✅ Book deleted.');
      load();
    } catch { setMsg('❌ Could not delete. Book may have active borrows.'); }
  };

  const filtered = safe(books).filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Books</h1>
        <p className="page-subtitle">Add, edit, delete books and manage inventory</p>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input className="search-input" style={{ flex: 1 }} placeholder="🔍 Search books..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={openAdd}>+ Add Book</button>
      </div>

      {loading
        ? <p style={{ color: 'var(--gray-400)' }}>Loading...</p>
        : filtered.length === 0
        ? <div className="card"><div className="empty-state"><div className="empty-icon">📭</div><p>No books yet. Click "+ Add Book" to add one.</p></div></div>
        : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Book Name</th><th>Author</th><th>Total</th><th>Available</th><th>Damaged</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const inv    = getInv(b.bookId);
                  const status = !inv ? 'AVAILABLE' : (inv.availableCopies > 0 ? 'AVAILABLE' : 'NOT_AVAILABLE');
                  return (
                    <tr key={b.bookId}>
                      <td style={{ fontWeight: 600, color: 'var(--forest)' }}>#{b.bookId}</td>
                      <td style={{ fontWeight: 600 }}>{b.name}</td>
                      <td>{b.author}</td>
                      <td>{inv?.totalCopies ?? '—'}</td>
                      <td>{inv?.availableCopies ?? '—'}</td>
                      <td>{inv?.damagedCopies ?? 0}</td>
                      <td><StatusBadge status={status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteBook(b.bookId)}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Book' : 'Add New Book'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">⚠️ {error}</div>}
              <div className="form-group">
                <label className="form-label">Book Title *</label>
                <input className="form-input" placeholder="e.g. The Great Gatsby"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Author *</label>
                <input className="form-input" placeholder="e.g. F. Scott Fitzgerald"
                  value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} />
              </div>
              {!editing && (
                <div className="form-group">
                  <label className="form-label">Number of Copies</label>
                  <input className="form-input" type="number" min="1"
                    value={form.totalCopies} onChange={e => setForm(p => ({ ...p, totalCopies: e.target.value }))} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Update Book' : 'Add Book'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
