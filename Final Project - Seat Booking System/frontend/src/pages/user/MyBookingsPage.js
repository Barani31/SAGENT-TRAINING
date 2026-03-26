import React, { useState, useEffect, useRef } from 'react';
import {
  getReservationsByUser, cancelReservation,
  getTransactionByReservation, getReservedSeatsByReservation,
  submitReview, checkHasReviewed,
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { QRCodeSVG as QRCode } from 'qrcode.react';

// ── MUST be defined before component ─────────────────────────────────────────
const isShowOver = (reservation) => {
  if (!reservation?.slot) return false;
  const slot = reservation.slot;
  if (slot.slotStatus === 'COMPLETED') return true;
  if (slot.showDate) {
    const showDate = new Date(slot.showDate + 'T00:00:00');
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    if (showDate < today) return true;
    if (showDate.getTime() === today.getTime() && slot.endTime) {
      const [h, m] = slot.endTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(h, m, 0, 0);
      if (new Date() > endDate) return true;
    }
  }
  return false;
};

const getCompletedLabel = (eventType) => {
  switch (eventType?.toUpperCase()) {
    case 'MOVIE':   return { icon: '🎬', label: 'Movie Watched' };
    case 'concert': return { icon: '🎵', label: 'Concert Attended' };
    case 'EVENT':   return { icon: '🎪', label: 'Event Completed' };
    default:        return { icon: '✅', label: 'Show Completed' };
  }
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyBookingsPage = () => {
  const { user }  = useAuth();
  const ticketRef = useRef(null);

  const [reservations,     setReservations]     = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [cancelModal,      setCancelModal]      = useState(null);
  const [detailModal,      setDetailModal]      = useState(null);
  const [ticketModal,      setTicketModal]      = useState(null);
  const [ticketSeats,      setTicketSeats]      = useState([]);
  const [ticketLoading,    setTicketLoading]    = useState(false);
  const [detailTxn,        setDetailTxn]        = useState(null);
  const [detailSeats,      setDetailSeats]      = useState([]);
  const [detailLoading,    setDetailLoading]    = useState(false);
  const [reviewModal,      setReviewModal]      = useState(null);
  const [reviewedIds,      setReviewedIds]      = useState({});
  const [rating,           setRating]           = useState(0);
  const [hoverRating,      setHoverRating]      = useState(0);
  const [comment,          setComment]          = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reason,           setReason]           = useState('');
  const [cancelling,       setCancelling]       = useState(false);
  const [activeTab,        setActiveTab]        = useState('ALL');

  const load = async () => {
    try {
      const res  = await getReservationsByUser(user.userId);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setReservations(data);

      const completedRes = data.filter((r) => r.status === 'CONFIRMED' && isShowOver(r));
      const reviewChecks = await Promise.all(
        completedRes.map(async (r) => {
          try {
            const cr = await checkHasReviewed(r.reservationId);
            return { id: r.reservationId, reviewed: cr.data?.data };
          } catch { return { id: r.reservationId, reviewed: false }; }
        })
      );
      const map = {};
      reviewChecks.forEach(({ id, reviewed }) => { map[id] = reviewed; });
      setReviewedIds(map);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openDetails = async (reservation) => {
    setDetailModal(reservation);
    setDetailTxn(null); setDetailSeats([]);
    setDetailLoading(true);
    try {
      const [txnRes, seatsRes] = await Promise.all([
        getTransactionByReservation(reservation.reservationId).catch(() => null),
        getReservedSeatsByReservation(reservation.reservationId).catch(() => null),
      ]);
      setDetailTxn(txnRes?.data?.data || null);
      setDetailSeats(Array.isArray(seatsRes?.data?.data) ? seatsRes.data.data : []);
    } finally { setDetailLoading(false); }
  };

  const openTicket = async (reservation) => {
    setTicketModal(reservation);
    setTicketSeats([]);
    setTicketLoading(true);
    try {
      const seatsRes = await getReservedSeatsByReservation(reservation.reservationId).catch(() => null);
      setTicketSeats(Array.isArray(seatsRes?.data?.data) ? seatsRes.data.data : []);
    } finally { setTicketLoading(false); }
  };

  const downloadTicket = () => {
    if (!ticketRef.current) return;
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(ticketRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `ShowSpot-Ticket-${ticketModal.refCode}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Ticket downloaded!');
      });
    }).catch(() => {
      window.print();
    });
  };

  const openReview = (reservation) => {
    setReviewModal(reservation);
    setRating(0); setHoverRating(0); setComment('');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmittingReview(true);
    try {
      await submitReview({
        userId:        user.userId,
        eventId:       reviewModal.slot?.event?.eventId,
        reservationId: reviewModal.reservationId,
        rating,
        comment,
      });
      toast.success('Review submitted! Thank you 🎉');
      setReviewedIds((prev) => ({ ...prev, [reviewModal.reservationId]: true }));
      setReviewModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  const handleCancel = async () => {
    if (!reason.trim()) { toast.error('Please provide a reason'); return; }
    setCancelling(true);
    try {
      await cancelReservation({ reservationId: cancelModal.reservationId, userId: user.userId, reason });
      toast.success('Booking cancelled. Refund will be initiated.');
      setCancelModal(null); setReason('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally { setCancelling(false); }
  };

  const tabs     = ['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'];
  const filtered = activeTab === 'ALL' ? reservations : reservations.filter((r) => r.status === activeTab);
  const canReview = (r) => r.status === 'CONFIRMED' && isShowOver(r) && !reviewedIds[r.reservationId];

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '36px', paddingBottom: '48px' }}>
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">{reservations.length} total booking{reservations.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="tabs">
          {tabs.map((t) => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
              <span style={{ marginLeft: '5px', padding: '1px 7px', borderRadius: '99px', fontSize: '11px',
                background: activeTab === t ? 'var(--accent-dim)' : 'var(--bg-card)',
                color: activeTab === t ? 'var(--accent)' : 'var(--text-muted)',
                border: '1px solid var(--border)' }}>
                {t === 'ALL' ? reservations.length : reservations.filter((r) => r.status === t).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎟</div>
            <h3>No Bookings Found</h3>
            <p style={{ fontSize: '13px' }}>Your tickets will appear here after booking</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.map((r) => (
              <BookingCard key={r.reservationId} reservation={r}
                canReview={canReview(r)}
                hasReviewed={!!reviewedIds[r.reservationId]}
                onCancel={() => setCancelModal(r)}
                onViewDetails={() => openDetails(r)}
                onViewTicket={() => openTicket(r)}
                onReview={() => openReview(r)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Ticket Modal with QR + Seats + Download ── */}
      {ticketModal && (
        <div className="modal-overlay" onClick={() => setTicketModal(null)}>
          <div className="modal" style={{ maxWidth: '460px', width: '92%', padding: 0, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>

            {/* Downloadable ticket area */}
            <div ref={ticketRef} style={{ background: 'white' }}>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg,#e05c2a,#c94a1a)', padding: '22px 28px', color: 'white' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', opacity: 0.8, marginBottom: '4px' }}>SHOWSPOT TICKET</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.7rem', fontWeight: 700, lineHeight: 1.1 }}>
                  {ticketModal.slot?.event?.name}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '6px' }}>{ticketModal.slot?.event?.type}</div>
              </div>

              {/* Dashed separator */}
              <div style={{ position: 'relative', height: '20px', background: 'white' }}>
                <div style={{ position: 'absolute', left: -10, top: 4, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-secondary)' }} />
                <div style={{ borderTop: '2px dashed #e0d6cc', margin: '9px 14px' }} />
                <div style={{ position: 'absolute', right: -10, top: 4, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-secondary)' }} />
              </div>

              {/* Body */}
              <div style={{ padding: '16px 28px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                {/* Left — details */}
                <div style={{ flex: 1 }}>
                  <TicketRow icon="📅" label="Date"  value={ticketModal.slot?.showDate} />
                  <TicketRow icon="⏰" label="Time"  value={ticketModal.slot?.startTime?.slice(0, 5)} />
                  <TicketRow icon="📍" label="Venue" value={ticketModal.slot?.location?.locName} />
                  <TicketRow icon="👤" label="Name"  value={ticketModal.user?.name || user.name} />

                  {/* Seats */}
                  {!ticketLoading && ticketSeats.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Seats</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {ticketSeats.map((rs) => {
                          const typeColor = rs.seat?.seatType === 'VIP' ? '#c97d1a'
                                          : rs.seat?.seatType === 'PREMIUM' ? '#2563a8' : '#6b7280';
                          return (
                            <span key={rs.resSeatId} style={{
                              fontFamily: 'monospace', fontWeight: 800, fontSize: '12px',
                              padding: '3px 9px', borderRadius: '6px',
                              background: `${typeColor}15`, border: `1.5px solid ${typeColor}40`,
                              color: typeColor,
                            }}>
                              {rs.seat?.rowLetter}{rs.seat?.seatNo}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {ticketLoading && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>Loading seats...</div>
                  )}

                  {/* Amount */}
                  <div style={{ marginTop: '14px', padding: '10px 12px', borderRadius: '8px', background: '#f9f5f0', border: '1px solid #e8ddd4' }}>
                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount Paid</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e05c2a', fontFamily: 'Georgia,serif', marginTop: '2px' }}>
                      ₹{parseFloat(ticketModal.amount || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Right — QR code */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '10px', background: 'white', borderRadius: '10px', border: '2px solid #f0ebe5', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    {ticketLoading ? (
                      <div style={{ width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '11px' }}>Loading...</div>
                    ) : (
                      <QRCode
                        value={JSON.stringify({
                          ref:   ticketModal.refCode,
                          event: ticketModal.slot?.event?.name,
                          date:  ticketModal.slot?.showDate,
                          time:  ticketModal.slot?.startTime?.slice(0, 5),
                          venue: ticketModal.slot?.location?.locName,
                          seats: ticketSeats.map((s) => `${s.seat?.rowLetter}${s.seat?.seatNo}`).join(','),
                          name:  ticketModal.user?.name || user.name,
                        })}
                        size={110}
                        level="M"
                        includeMargin={false}
                      />
                    )}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', textAlign: 'center' }}>
                    {ticketModal.refCode}
                  </div>
                  <div style={{ fontSize: '9px', color: '#9ca3af', textAlign: 'center', maxWidth: '110px', lineHeight: 1.4 }}>
                    Scan at venue entrance
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: '#faf7f4', borderTop: '1px solid #f0ebe5', padding: '10px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>ShowSpot · Your Entertainment Partner</div>
                <div style={{
                  fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px',
                  background: '#e8fff5', color: '#1a8f63',
                }}>
                  ✅ CONFIRMED
                </div>
              </div>
            </div>

            {/* Action buttons — outside downloadable area */}
            <div style={{ padding: '14px 20px', background: 'var(--bg-secondary)', display: 'flex', gap: '10px', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setTicketModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Close</button>
              <button onClick={downloadTicket} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                ⬇️ Download Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Rate Your Experience</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div style={{ padding: '4px 0 16px' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{reviewModal.slot?.event?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {reviewModal.slot?.showDate} · {reviewModal.slot?.location?.locName}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}>
                  How would you rate this {reviewModal.slot?.event?.type?.toLowerCase() || 'show'}?
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ fontSize: '40px', background: 'none', border: 'none', cursor: 'pointer',
                        transition: 'transform 0.1s',
                        transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                        filter: (hoverRating || rating) >= star ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                      ⭐
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 700,
                    color: rating >= 4 ? 'var(--green)' : rating >= 3 ? 'var(--gold)' : 'var(--accent)' }}>
                    {['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Excellent 🤩'][rating]}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Your Review (optional)</label>
                <textarea className="form-input" rows={3}
                  placeholder={`Tell others what you thought about the ${reviewModal.slot?.event?.type?.toLowerCase() || 'show'}...`}
                  value={comment} onChange={(e) => setComment(e.target.value)}
                  style={{ resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setReviewModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSubmitReview} disabled={submittingReview || rating === 0}
                className="btn btn-primary" style={{ flex: 1 }}>
                {submittingReview ? 'Submitting...' : 'Submit Review ⭐'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" style={{ maxWidth: '520px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Booking Details</h3>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div style={{ padding: '4px 0 16px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '8px' }}>
                  {detailModal.slot?.event?.name}
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {detailModal.slot?.showDate    && <span>📅 {detailModal.slot.showDate}</span>}
                  {detailModal.slot?.startTime   && <span>⏰ {detailModal.slot.startTime?.slice(0, 5)}</span>}
                  {detailModal.slot?.location?.locName && <span>📍 {detailModal.slot.location.locName}</span>}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <SectionLabel>Booking Info</SectionLabel>
                <DetailRow label="Ref Code"    value={detailModal.refCode} mono />
                <DetailRow label="Status"      value={detailModal.status} />
                <DetailRow label="Booked On"   value={detailModal.reservedDate
                  ? new Date(detailModal.reservedDate).toLocaleDateString('en-IN',
                    { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'} />
                <DetailRow label="Subtotal"    value={`₹${(parseFloat(detailModal.amount || 0) + parseFloat(detailModal.discount || 0)).toFixed(2)}`} />
                {parseFloat(detailModal.discount || 0) > 0 && (
                  <DetailRow label="Discount"  value={`-₹${parseFloat(detailModal.discount).toFixed(2)}`} green />
                )}
                <DetailRow label="Amount Paid" value={`₹${parseFloat(detailModal.amount || 0).toFixed(2)}`} bold />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <SectionLabel>Seats Booked {detailLoading ? '' : `(${detailSeats.length})`}</SectionLabel>
                {detailLoading ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>Loading seats...</div>
                ) : detailSeats.length === 0 ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>No seat data found</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {detailSeats.map((rs) => {
                      const typeColor = rs.seat?.seatType === 'VIP' ? '#c97d1a'
                                      : rs.seat?.seatType === 'PREMIUM' ? '#2563a8' : '#6b7280';
                      return (
                        <div key={rs.resSeatId} style={{
                          padding: '8px 12px', borderRadius: '8px', textAlign: 'center',
                          background: `${typeColor}12`, border: `1.5px solid ${typeColor}44`,
                        }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px', color: typeColor }}>
                            {rs.seat?.rowLetter}{rs.seat?.seatNo}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{rs.seat?.seatType}</div>
                          <div style={{ fontSize: '11px', color: typeColor, fontWeight: 700 }}>₹{parseFloat(rs.price || 0).toFixed(0)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <SectionLabel>Payment</SectionLabel>
                {detailLoading ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>Loading...</div>
                ) : detailTxn ? (
                  <>
                    <DetailRow label="Method"     value={detailTxn.paymentMethod} />
                    <DetailRow label="Txn Ref"    value={detailTxn.transactionRef} mono />
                    <DetailRow label="Txn Status" value={detailTxn.status} />
                    {parseFloat(detailTxn.discountAmount || 0) > 0 && (
                      <DetailRow label="Discount Applied" value={`-₹${parseFloat(detailTxn.discountAmount).toFixed(2)}`} green />
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>No payment record found</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button onClick={() => setDetailModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Close</button>
              {detailModal.status === 'CONFIRMED' && !isShowOver(detailModal) && (
                <button onClick={() => { setDetailModal(null); setCancelModal(detailModal); }}
                  className="btn btn-danger btn-sm" style={{ flex: 1 }}>Cancel Booking</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Cancel Booking</h3>
              <button className="modal-close" onClick={() => setCancelModal(null)}>✕</button>
            </div>
            <div style={{ padding: '4px 0 16px' }}>
              <div style={{ padding: '14px 16px', borderRadius: '10px', marginBottom: '16px', background: '#fff8f5', border: '1.5px solid rgba(224,92,42,0.2)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Ref: {cancelModal.refCode}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>80% refund pending admin approval</div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason for Cancellation *</label>
                <textarea className="form-input" rows={3} placeholder="Tell us why you're cancelling..."
                  value={reason} onChange={(e) => setReason(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setCancelModal(null); setReason(''); }} className="btn btn-secondary" style={{ flex: 1 }}>Keep Booking</button>
              <button onClick={handleCancel} disabled={cancelling} className="btn btn-danger" style={{ flex: 1 }}>
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Booking Card ──────────────────────────────────────────────────────────────
const BookingCard = ({ reservation, onCancel, onViewDetails, onViewTicket, onReview, canReview, hasReviewed }) => {
  const slot      = reservation.slot;
  const showOver  = isShowOver(reservation);
  const completed = getCompletedLabel(slot?.event?.type);

  const statusClass = reservation.status === 'CONFIRMED' ? 'badge-success'
                    : reservation.status === 'CANCELLED'  ? 'badge-danger'
                    : 'badge-warning';

  return (
    <div className="card" style={{
      padding: '20px 24px',
      borderLeft: showOver && reservation.status === 'CONFIRMED' ? '3px solid #9ca3af' : '',
      opacity: showOver && reservation.status === 'CONFIRMED' ? 0.92 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className={`badge ${statusClass}`}>{reservation.status}</span>

            {showOver && reservation.status === 'CONFIRMED' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px',
                background: '#eff6ff', color: '#2563a8', border: '1px solid #2563a844',
              }}>
                {completed.icon} {completed.label}
              </span>
            )}

            {hasReviewed && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px',
                background: '#fffbf0', color: '#c97d1a', border: '1px solid #c97d1a44',
              }}>⭐ Reviewed</span>
            )}

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '5px', border: '1px solid var(--border)', fontWeight: 600 }}>
              {reservation.refCode}
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 400, marginBottom: '8px' }}>
            {slot?.event?.name || 'Event'}
          </h3>

          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {slot?.showDate          && <span>📅 {slot.showDate}</span>}
            {slot?.startTime         && <span>⏰ {slot.startTime?.slice(0, 5)}</span>}
            {slot?.location?.locName && <span>📍 {slot.location.locName}</span>}
          </div>

          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--accent)' }}>
              ₹{parseFloat(reservation.amount || 0).toFixed(2)}
            </span>
            {parseFloat(reservation.discount || 0) > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>
                (-₹{parseFloat(reservation.discount).toFixed(2)} off)
              </span>
            )}
          </div>
        </div>

        {/* Right side buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {reservation.reservedDate ? new Date(reservation.reservedDate).toLocaleDateString('en-IN') : ''}
          </div>

          <button onClick={onViewDetails} className="btn btn-secondary btn-sm">View Details</button>

          {reservation.status === 'CONFIRMED' && !showOver && (
            // ── Upcoming: View Ticket + Cancel ──
            <>
              <button onClick={onViewTicket} className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                🎟 View Ticket
              </button>
              <button onClick={onCancel} className="btn btn-danger btn-sm">Cancel</button>
            </>
          )}

          {reservation.status === 'CONFIRMED' && showOver && (
            // ── Show ended: Rate or Reviewed ──
            canReview ? (
              <button onClick={onReview} className="btn btn-sm" style={{
                background: 'linear-gradient(135deg,#c97d1a,#e05c2a)',
                color: 'white', border: 'none',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                ⭐ Rate {slot?.event?.type === 'MOVIE' ? 'Movie'
                       : slot?.event?.type === 'CONCERT' ? 'Concert'
                       : 'Event'}
              </button>
            ) : hasReviewed ? (
              <span style={{ fontSize: '12px', color: '#c97d1a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⭐ You Reviewed
              </span>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const TicketRow = ({ icon, label, value }) => (
  <div style={{ marginBottom: '10px' }}>
    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{icon} {label}</div>
    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', marginTop: '2px' }}>{value || '—'}</div>
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>{children}</div>
);

const DetailRow = ({ label, value, mono, bold, green }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
    <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', fontWeight: bold ? 800 : 600, color: green ? 'var(--green)' : 'var(--text-primary)' }}>{value}</span>
  </div>
);

export default MyBookingsPage;