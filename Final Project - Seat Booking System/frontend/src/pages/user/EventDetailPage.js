import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getSlotsByEvent, getReviewsByEvent, getEventRatingSummary } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TYPE_ICONS = { MOVIE: '🎬', CONCERT: '🎵', EVENT: '🎪' };
const TYPE_COLOR = { MOVIE: '#2563a8', CONCERT: '#c97d1a', EVENT: '#1a8f63' };

const RIBBON = {
  CANCELLED: { bg: '#b91c1c', label: 'CANCELLED' },
  HOUSEFULL: { bg: '#c97d1a', label: 'HOUSEFULL' },
};

const EventDetailPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [event,        setEvent]        = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [reviews,      setReviews]      = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, slRes, rvRes, rsRes] = await Promise.all([
          getEventById(id),
          getSlotsByEvent(id),
          getReviewsByEvent(id).catch(() => ({ data: { data: [] } })),
          getEventRatingSummary(id).catch(() => ({ data: { data: { averageRating: 0, totalReviews: 0 } } })),
        ]);
        const ev = evRes.data?.data || null;
        const sl = Array.isArray(slRes.data?.data) ? slRes.data.data : [];
        const rv = Array.isArray(rvRes.data?.data) ? rvRes.data.data : [];
        const rs = rsRes.data?.data || { averageRating: 0, totalReviews: 0 };
        setEvent(ev);
        setSlots(sl);
        setReviews(rv);
        setRatingSummary(rs);
        if (sl.length > 0) setSelectedDate(sl[0].showDate);
      } catch { toast.error('Failed to load event details'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!event)  return (
    <div className="empty-state" style={{ marginTop: '80px' }}>
      <div className="empty-state-icon">🎭</div><h3>Event not found</h3>
      <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Browse</button>
    </div>
  );

  const color       = TYPE_COLOR[event.type] || '#9c9285';
  const icon        = TYPE_ICONS[event.type] || '🎪';
  const isActive    = event.status === 'ACTIVE';
  const isCancelled = event.status === 'CANCELLED';
  const isCompleted = event.status === 'COMPLETED';
  const dates       = [...new Set(slots.map((s) => s.showDate))].sort();
  const filteredSlots = selectedDate ? slots.filter((s) => s.showDate === selectedDate) : slots;

  const handleBook = (slotId, slotStatus) => {
    if (!user)    { toast.error('Please login to book'); navigate('/login'); return; }
    if (!isActive){ toast.error(`Booking unavailable — this event is ${event.status}`); return; }
    if (slotStatus === 'HOUSEFULL') { toast.error('This show is housefull'); return; }
    if (slotStatus === 'CANCELLED') { toast.error('This show has been cancelled'); return; }
    navigate(`/book/${slotId}`);
  };

  const eventStatusConfig = {
    ACTIVE:    { bg: '#e8fff5', color: '#1a8f63' },
    CANCELLED: { bg: '#fff0f0', color: '#b91c1c' },
    COMPLETED: { bg: '#eff6ff', color: '#2563a8' },
  }[event.status] || { bg: '#f0f0f0', color: '#888' };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#fff8f5 0%,#fef2ea 100%)', borderBottom: '1.5px solid var(--border)', padding: '28px 0 36px' }}>
        <div className="container">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '18px', paddingLeft: 0 }}>
            ← Back to Browse
          </button>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 96, height: 96, background: 'white', borderRadius: '18px', border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', boxShadow: 'var(--shadow)', flexShrink: 0 }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color, background: `${color}15`, padding: '3px 10px', borderRadius: '20px' }}>
                  {icon} {event.type}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', background: eventStatusConfig.bg, color: eventStatusConfig.color }}>
                  {event.status}
                </span>
                {event.genre    && event.genre.split(',').map((g) => <span key={g} className="badge badge-muted">{g.trim()}</span>)}
                {event.language && event.language.split(',').map((l) => <span key={l} className="badge badge-muted">{l.trim()}</span>)}

                {/* Rating badge */}
                {ratingSummary.totalReviews > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', background: '#fffbf0', border: '1px solid #c97d1a44', fontSize: '12px', fontWeight: 700, color: '#c97d1a' }}>
                    ⭐ {ratingSummary.averageRating} ({ratingSummary.totalReviews})
                  </span>
                )}
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.8rem)', fontWeight: 400, marginBottom: '10px' }}>
                {event.name}
              </h1>

              {event.summary && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '600px', fontSize: '15px', marginBottom: '14px' }}>
                  {event.summary}
                </p>
              )}

              <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                {event.duration     && <Detail label="Duration"  value={event.duration} />}
                {event.categoryName && <Detail label="Category"  value={event.categoryName} />}
                {event.organiser?.name && <Detail label="Organiser" value={event.organiser.name} />}
              </div>

              {!isActive && (
                <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px',
                  background: isCancelled ? 'rgba(185,28,28,0.08)' : 'rgba(37,99,168,0.08)',
                  border: `1.5px solid ${isCancelled ? 'rgba(185,28,28,0.25)' : 'rgba(37,99,168,0.25)'}`,
                  color: isCancelled ? '#b91c1c' : '#2563a8', fontSize: '13px', fontWeight: 600,
                }}>
                  {isCancelled ? '🚫' : '✅'}
                  {isCancelled ? 'This event has been cancelled. All bookings are refunded.'
                               : 'This event has completed. Bookings are closed.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shows */}
      <div className="container" style={{ paddingTop: '36px', paddingBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '6px' }}>
          Choose a Show
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          {slots.length} show{slots.length !== 1 ? 's' : ''} scheduled
        </p>

        {slots.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📅</div><h3>No Shows Scheduled</h3></div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '6px' }}>
              {dates.map((date) => {
                const d          = new Date(date + 'T00:00:00');
                const isSelected = selectedDate === date;
                const dateSlots  = slots.filter((s) => s.showDate === date);
                const allCancelled = dateSlots.every((s) => s.slotStatus === 'CANCELLED');

                return (
                  <button key={date} onClick={() => setSelectedDate(date)} style={{
                    padding: '10px 22px', borderRadius: '10px', border: '1.5px solid', flexShrink: 0,
                    cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px',
                    opacity: (allCancelled || isCompleted) ? 0.55 : 1,
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    background:  isSelected ? 'var(--accent-dim)' : 'var(--bg-card)',
                    color:       isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                    boxShadow:   isSelected ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                  }}>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                    <div>{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    {allCancelled && !isCompleted && <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 700, marginTop: '2px' }}>Cancelled</div>}
                    {isCompleted && <div style={{ fontSize: '10px', color: '#2563a8', fontWeight: 700, marginTop: '2px' }}>Completed</div>}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
              {filteredSlots.map((slot) => (
                <SlotCard key={slot.slotId} slot={slot} eventActive={isActive} eventStatus={event.status}
                  onBook={() => handleBook(slot.slotId, slot.slotStatus)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Reviews Section ── */}
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '32px' }}>

          {/* Reviews header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '4px' }}>
                Reviews
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {ratingSummary.totalReviews} review{ratingSummary.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating summary */}
            {ratingSummary.totalReviews > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px 24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 400, color: '#c97d1a', lineHeight: 1 }}>
                    {ratingSummary.averageRating}
                  </div>
                  <div style={{ fontSize: '20px', marginTop: '4px' }}>
                    {renderStars(ratingSummary.averageRating)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                    out of 5
                  </div>
                </div>
                <div>
                  {[5,4,3,2,1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct   = ratingSummary.totalReviews > 0
                      ? (count / ratingSummary.totalReviews) * 100 : 0;
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '8px' }}>{star}</span>
                        <span style={{ fontSize: '11px' }}>⭐</span>
                        <div style={{ width: '80px', height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#c97d1a', borderRadius: '99px', transition: 'width 0.5s' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, width: '20px' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Review cards */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-secondary)', borderRadius: '14px', border: '1.5px dashed var(--border)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⭐</div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>No reviews yet</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Reviews from attendees will appear here after the show
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews.map((review) => (
                <ReviewCard key={review.reviewId} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Review Card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => (
  <div className="card" style={{ padding: '20px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* Avatar */}
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--accent)', flexShrink: 0 }}>
          {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>{review.user?.name || 'User'}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{review.user?.mail || ''}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '18px', marginBottom: '2px' }}>{renderStars(review.rating)}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
          {review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
        </div>
      </div>
    </div>
    {review.comment && (
      <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        "{review.comment}"
      </p>
    )}
  </div>
);

// ── Star renderer ─────────────────────────────────────────────────────────────
const renderStars = (rating) => {
  const r = Math.round(rating);
  return '⭐'.repeat(r) + '☆'.repeat(Math.max(0, 5 - r));
};

// ── Slot Card ─────────────────────────────────────────────────────────────────
const SlotCard = ({ slot, eventActive, eventStatus, onBook }) => {
  const isAvailable = slot.slotStatus === 'AVAILABLE';
  const isHousefull = slot.slotStatus === 'HOUSEFULL';
  const isCancelled = slot.slotStatus === 'CANCELLED';
  const isCompleted = eventStatus === 'COMPLETED';
  const canBook     = eventActive && isAvailable;

  const buttonLabel = isCancelled || eventStatus === 'CANCELLED' ? 'Cancelled'
    : isCompleted ? 'Completed'
    : isHousefull ? 'Housefull'
    : 'Book Now';

  const btnBg = (isCancelled || eventStatus === 'CANCELLED') ? '#b91c1c'
    : isCompleted ? '#2563a8'
    : isHousefull ? 'var(--gold)'
    : undefined;

  const ribbon = RIBBON[slot.slotStatus];
  const eventRibbon = !eventActive
    ? (eventStatus === 'CANCELLED' ? RIBBON.CANCELLED : { bg: '#2563a8', label: 'COMPLETED' })
    : null;
  const activeRibbon = eventRibbon || ribbon;

  return (
    <div className="card" style={{
      padding: '20px', transition: 'var(--transition)',
      opacity: canBook ? 1 : 0.72, position: 'relative', overflow: 'hidden',
      border: !canBook ? `1.5px solid ${(isCancelled || !eventActive) ? 'rgba(185,28,28,0.2)' : isHousefull ? 'rgba(201,125,26,0.2)' : 'var(--border)'}` : undefined,
    }}
      onMouseEnter={(e) => { if (canBook) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {activeRibbon && (
        <div style={{ position: 'absolute', top: 12, right: -22, background: activeRibbon.bg, color: 'white', fontSize: '8px', fontWeight: 800, padding: '3px 28px', transform: 'rotate(35deg)', letterSpacing: '0.06em', zIndex: 1, whiteSpace: 'nowrap' }}>
          {activeRibbon.label}
        </div>
      )}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, lineHeight: 1 }}>
          {slot.startTime?.slice(0, 5)}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>ends {slot.endTime?.slice(0, 5)}</div>
      </div>
      {slot.location?.locName && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '14px' }}>
          📍 {slot.location.locName}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Seats</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isCancelled || !eventActive ? '#b91c1c' : isHousefull ? 'var(--gold)' : 'var(--green)' }}>
            {isCancelled || !eventActive ? (isCompleted ? 'Completed' : 'Cancelled') : isHousefull ? 'Housefull' : `${slot.seatsLeft} left`}
          </div>
        </div>
        <button onClick={onBook} disabled={!canBook} className="btn btn-primary btn-sm"
          style={{ background: btnBg, opacity: canBook ? 1 : 0.55, cursor: canBook ? 'pointer' : 'not-allowed' }}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{value}</div>
  </div>
);

export default EventDetailPage;