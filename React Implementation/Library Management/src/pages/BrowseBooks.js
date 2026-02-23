import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './MemberDashboard';

const BASE = 'http://localhost:8080/api';
const safe = (d) => (Array.isArray(d) ? d : []);

export default function BrowseBooks() {
  const { user } = useAuth();
  const [books, setBooks]         = useState([]);
  const [inventory, setInventory] = useState([]);
  const [borrows, setBorrows]     = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState('');

  const load = () => {
    Promise.all([
      fetch(`${BASE}/books`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/inventory`).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/borrow`).then(r => r.json()).catch(() => []),
    ]).then(([b, inv, br]) => {
      setBooks(safe(b));
      setInventory(safe(inv));
      setBorrows(safe(br));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const getInv = (bookId) => safe(inventory).find(i => i.book?.bookId === bookId);

  const isAlreadyBorrowed = (bookId) =>
    safe(borrows).some(b => b.book?.bookId === bookId && b.member?.memId === user.memId && b.status !== 'RETURNED' && b.status !== 'CANCELLED');

  const borrowBook = async (book) => {
    setMsg('');
    if (isAlreadyBorrowed(book.bookId)) { setMsg('⚠️ You already have this book borrowed!'); return; }
    const inv = getInv(book.bookId);
    if (inv && inv.availableCopies <= 0) { setMsg('⚠️ No copies available right now.'); return; }
    try {
      const today = new Date().toISOString().split('T')[0];
      const due   = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      await fetch(`${BASE}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book:    { bookId: book.bookId },
          member:  { memId: user.memId },
          issueDate: today,
          dueDate:   due,
          status:    'ISSUED',
        }),
      });
      setMsg(`✅ "${book.name}" borrowed! Due: ${due}`);
      load();
    } catch { setMsg('❌ Failed to borrow. Please try again.'); }
  };

  const filtered = safe(books).filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Browse Books</h1>
        <p className="page-subtitle">Search and borrow from our catalog</p>
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="🔍 Search by title or author..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{filtered.length} books</span>
      </div>

      {msg && (
        <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>
      )}

      {loading
        ? <p style={{ color: 'var(--gray-400)' }}>Loading books...</p>
        : filtered.length === 0
        ? <div className="empty-state"><div className="empty-icon">📭</div><p>No books found. Ask librarian to add books.</p></div>
        : (
        <div className="book-grid">
          {filtered.map(b => {
            const inv       = getInv(b.bookId);
            const available = inv ? inv.availableCopies > 0 : true;
            const borrowed  = isAlreadyBorrowed(b.bookId);
            const status    = !inv ? 'AVAILABLE' : (inv.availableCopies > 0 ? 'AVAILABLE' : 'NOT_AVAILABLE');
            return (
              <div key={b.bookId} className="book-card">
                <div className="book-icon">📗</div>
                <div className="book-name">{b.name}</div>
                <div className="book-author">by {b.author}</div>
                <div className="book-meta">
                  <StatusBadge status={status} />
                  {inv && (
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      {inv.availableCopies}/{inv.totalCopies} copies
                    </span>
                  )}
                </div>
                <div className="book-actions">
                  {borrowed
                    ? <span style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}>📖 Already borrowed</span>
                    : (
                    <button className="btn btn-primary btn-sm"
                      disabled={!available}
                      onClick={() => borrowBook(b)}>
                      {available ? '📖 Borrow' : 'Unavailable'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
