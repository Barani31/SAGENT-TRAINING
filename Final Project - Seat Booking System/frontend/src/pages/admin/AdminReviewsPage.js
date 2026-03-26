import React, { useState, useEffect } from 'react';
import { getEventsByOrganiser, getReviewsByEvent, getEventRatingSummary } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminReviewsPage = () => {
  const { user }    = useAuth();
  const [events,    setEvents]    = useState([]);
  const [selected,  setSelected]  = useState(null);  // selected event
  const [reviews,   setReviews]   = useState([]);
  const [summary,   setSummary]   = useState({ averageRating: 0, totalReviews: 0 });
  const [loading,   setLoading]   = useState(true);
  const [revLoading, setRevLoading] = useState(false);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    getEventsByOrganiser(user.userId)
      .then((res) => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setEvents(data);
        if (data.length > 0) loadReviews(data[0]);
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const loadReviews = async (event) => {
    setSelected(event);
    setRevLoading(true);
    try {
      const [rvRes, rsRes] = await Promise.all([
        getReviewsByEvent(event.eventId),
        getEventRatingSummary(event.eventId),
      ]);
      setReviews(Array.isArray(rvRes.data?.data) ? rvRes.data.data : []);
      setSummary(rsRes.data?.data || { averageRating: 0, totalReviews: 0 });
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setRevLoading(false);
    }
  };

  const q = search.toLowerCase();
  const filteredReviews = reviews.filter((r) =>
    !q || r.user?.name?.toLowerCase().includes(q) ||
          r.user?.mail?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q)
  );

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '36px', paddingBottom: '48px' }}>
        <div className="page-header">
          <h1 className="page-title">Reviews & Ratings</h1>
          <p className="page-subtitle">See what attendees say about your events</p>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⭐</div>
            <h3>No Events Found</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

            {/* ── Event list sidebar ── */}
            <div style={{ width: '240px', flexShrink: 0 }}>
              <div style={{ position: 'sticky', top: '84px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                  Your Events
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {events.map((ev) => (
                    <button key={ev.eventId} onClick={() => loadReviews(ev)}
                      style={{
                        padding: '12px 14px', borderRadius: '10px', border: '1.5px solid', textAlign: 'left',
                        cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'var(--transition)',
                        borderColor: selected?.eventId === ev.eventId ? 'var(--accent)' : 'var(--border)',
                        background:  selected?.eventId === ev.eventId ? 'var(--accent-dim)' : 'var(--bg-card)',
                      }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: selected?.eventId === ev.eventId ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '3px' }}>
                        {ev.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {ev.type} · {ev.status}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Reviews panel ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {selected && (
                <>
                  {/* Event header */}
                  <div className="card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '4px' }}>
                          {selected.name}
                        </h2>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selected.type} · {selected.status}</div>
                      </div>

                      {/* Rating summary */}
                      {summary.totalReviews > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fffbf0', border: '1.5px solid #c97d1a44', borderRadius: '12px', padding: '14px 20px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400, color: '#c97d1a', lineHeight: 1 }}>
                              {summary.averageRating}
                            </div>
                            <div style={{ fontSize: '16px', margin: '4px 0' }}>{renderStars(summary.averageRating)}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div>
                            {[5,4,3,2,1].map((star) => {
                              const count = reviews.filter((r) => r.rating === star).length;
                              const pct   = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                              return (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '8px' }}>{star}</span>
                                  <span style={{ fontSize: '11px' }}>⭐</span>
                                  <div style={{ width: '80px', height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: '#c97d1a', borderRadius: '99px' }} />
                                  </div>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '20px' }}>{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search */}
                  <div style={{ marginBottom: '16px' }}>
                    <input className="form-input" placeholder="Search by user name, email or review..."
                      value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>

                  {revLoading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                  ) : filteredReviews.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">⭐</div>
                      <h3>{reviews.length === 0 ? 'No Reviews Yet' : 'No Matching Reviews'}</h3>
                      <p style={{ fontSize: '13px' }}>
                        {reviews.length === 0 ? 'Reviews will appear here after attendees rate the event' : 'Try adjusting your search'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {filteredReviews.map((review) => (
                        <div key={review.reviewId} className="card" style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>

                            {/* User info */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--accent)', flexShrink: 0 }}>
                                {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '14px' }}>{review.user?.name || 'User'}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{review.user?.mail || ''}</div>
                                {review.user?.contactNo && (
                                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {review.user.contactNo}</div>
                                )}
                              </div>
                            </div>

                            {/* Rating + date */}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '20px', marginBottom: '3px' }}>{renderStars(review.rating)}</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>
                                {review.reservation?.refCode || ''}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                                {review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                              </div>
                            </div>
                          </div>

                          {review.comment && (
                            <div style={{ marginTop: '14px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '10px', borderLeft: '3px solid var(--accent)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              "{review.comment}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const renderStars = (rating) => {
  const r = Math.round(rating);
  return '⭐'.repeat(r) + '☆'.repeat(Math.max(0, 5 - r));
};

export default AdminReviewsPage;