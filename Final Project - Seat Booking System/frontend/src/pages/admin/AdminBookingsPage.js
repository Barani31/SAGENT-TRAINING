import React, { useState, useEffect } from 'react';
import {
  getReservationsByOrganiser, getAllCancellations,
  updateRefundStatus, getTransactionByReservation,
  getReservedSeatsByReservation,
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_BADGE = { CONFIRMED: 'badge-success', PENDING: 'badge-warning', CANCELLED: 'badge-danger' };
const REFUND_BADGE = { PROCESSED: 'badge-success', PENDING: 'badge-warning', REJECTED: 'badge-danger', CREDITED: 'badge-success' };

// ── helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

// Group reservations: eventId → date → slotId
const groupReservations = (reservations) => {
  const eventMap = {};
  reservations.forEach((r) => {
    const eventId   = r.slot?.event?.eventId;
    const eventName = r.slot?.event?.name || 'Unknown Event';
    const date      = r.slot?.showDate || '—';
    const slotId    = r.slot?.slotId;
    const slotTime  = r.slot?.startTime?.slice(0, 5) || '—';

    if (!eventId) return;
    if (!eventMap[eventId]) eventMap[eventId] = { eventId, eventName, dateMap: {} };

    if (!eventMap[eventId].dateMap[date]) eventMap[eventId].dateMap[date] = {};
    const dateEntry = eventMap[eventId].dateMap[date];

    if (!dateEntry[slotId]) dateEntry[slotId] = { slotId, slotTime, endTime: r.slot?.endTime?.slice(0,5) || '', bookings: [] };
    dateEntry[slotId].bookings.push(r);
  });
  return Object.values(eventMap);
};

const AdminBookingsPage = () => {
  const { user } = useAuth();
  const [reservations,  setReservations]  = useState([]);
  const [cancellations, setCancellations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState('bookings');
  const [search,        setSearch]        = useState('');

  // Drill-down state
  const [selectedEvent, setSelectedEvent] = useState(null); // { eventId, eventName, dateMap }
  const [selectedDate,  setSelectedDate]  = useState(null); // date string
  const [selectedSlot,  setSelectedSlot]  = useState(null); // { slotId, slotTime, bookings }

  // Details modal
  const [detailModal,   setDetailModal]   = useState(null);
  const [detailTxn,     setDetailTxn]     = useState(null);
  const [detailSeats,   setDetailSeats]   = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    try {
      const [resRes, canRes] = await Promise.all([
        getReservationsByOrganiser(user.userId),
        getAllCancellations(),
      ]);
      setReservations(Array.isArray(resRes.data?.data) ? resRes.data.data : []);
      setCancellations(Array.isArray(canRes.data?.data) ? canRes.data.data : []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Reset drill-down when switching tabs
  useEffect(() => { setSelectedEvent(null); setSelectedDate(null); setSelectedSlot(null); }, [tab]);

  const openDetails = async (reservation) => {
    setDetailModal(reservation);
    setDetailTxn(null); setDetailSeats([]); setDetailLoading(true);
    try {
      const [txnRes, seatsRes] = await Promise.all([
        getTransactionByReservation(reservation.reservationId).catch(() => null),
        getReservedSeatsByReservation(reservation.reservationId).catch(() => null),
      ]);
      setDetailTxn(txnRes?.data?.data || null);
      setDetailSeats(Array.isArray(seatsRes?.data?.data) ? seatsRes.data.data : []);
    } finally { setDetailLoading(false); }
  };

  const handleRefund = async (id, status) => {
    try {
      await updateRefundStatus(id, status);
      toast.success(`Refund ${status === 'PROCESSED' ? 'approved' : 'rejected'} — user notified`);
      load();
    } catch { toast.error('Failed to update refund status'); }
  };

  const q = search.toLowerCase();
  const filteredCan = cancellations.filter((c) =>
    !q || c.reservation?.refCode?.toLowerCase().includes(q) ||
    c.user?.name?.toLowerCase().includes(q)
  );

  // Filtered reservations for drill-down search
  const filteredRes = reservations.filter((r) =>
    !q || r.refCode?.toLowerCase().includes(q) ||
    r.user?.name?.toLowerCase().includes(q) ||
    r.slot?.event?.name?.toLowerCase().includes(q)
  );

  const grouped = groupReservations(filteredRes);

  // ── Breadcrumb trail ──────────────────────────────────────────────────────
  const breadcrumbs = [];
  if (selectedEvent) {
    breadcrumbs.push({ label: 'Events', onClick: () => { setSelectedEvent(null); setSelectedDate(null); setSelectedSlot(null); } });
    breadcrumbs.push({ label: selectedEvent.eventName, onClick: () => { setSelectedDate(null); setSelectedSlot(null); } });
    if (selectedDate) {
      breadcrumbs.push({ label: formatDate(selectedDate), onClick: () => setSelectedSlot(null) });
      if (selectedSlot) {
        breadcrumbs.push({ label: `${selectedSlot.slotTime} show`, onClick: null });
      }
    }
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '36px', paddingBottom: '48px' }}>
        <div className="page-header">
          <h1 className="page-title">Bookings &amp; Cancellations</h1>
          <p className="page-subtitle">Manage all reservations for your events</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            ['Total Bookings',  reservations.length,                                                    '#e05c2a'],
            ['Confirmed',       reservations.filter((r) => r.status === 'CONFIRMED').length,            '#1a8f63'],
            ['Cancelled',       reservations.filter((r) => r.status === 'CANCELLED').length,            '#e8305a'],
            ['Pending Refunds', cancellations.filter((c) => c.refundStatus === 'PENDING').length,       '#c97d1a'],
          ].map(([label, val, color]) => (
            <div key={label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color }}>{val}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {[['bookings', reservations.length], ['cancellations', cancellations.length]].map(([id, count]) => (
              <button key={id} className={`tab-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                {id.charAt(0).toUpperCase() + id.slice(1)}{' '}
                <span style={{ marginLeft: '4px', padding: '1px 7px', borderRadius: '99px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{count}</span>
              </button>
            ))}
          </div>
          <input className="form-input" placeholder="Search by ref, user, event..."
            value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '280px' }} />
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tab === 'bookings' ? (

          /* ═══════════ BOOKINGS DRILL-DOWN ═══════════ */
          <div>

            {/* Breadcrumb */}
            {breadcrumbs.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
                {breadcrumbs.map((b, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>›</span>}
                    <button onClick={b.onClick || undefined}
                      disabled={!b.onClick}
                      style={{
                        background: 'none', border: 'none', padding: '2px 4px',
                        cursor: b.onClick ? 'pointer' : 'default',
                        color: b.onClick ? 'var(--accent)' : 'var(--text-primary)',
                        fontWeight: b.onClick ? 600 : 700,
                        fontSize: '13px', fontFamily: 'var(--font-body)',
                        textDecoration: b.onClick ? 'underline' : 'none',
                      }}>
                      {b.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* ── LEVEL 1: Event list ── */}
            {!selectedEvent && (
              grouped.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">🎟</div><h3>No Bookings Found</h3></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {grouped.map((ev) => {
                    const totalBookings  = Object.values(ev.dateMap).flatMap((d) => Object.values(d)).flatMap((s) => s.bookings).length;
                    const confirmedCount = Object.values(ev.dateMap).flatMap((d) => Object.values(d)).flatMap((s) => s.bookings).filter((b) => b.status === 'CONFIRMED').length;
                    const totalRevenue   = Object.values(ev.dateMap).flatMap((d) => Object.values(d)).flatMap((s) => s.bookings).filter((b) => b.status === 'CONFIRMED').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
                    const dateCount      = Object.keys(ev.dateMap).length;

                    return (
                      <div key={ev.eventId} onClick={() => setSelectedEvent(ev)}
                        className="card"
                        style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', transition: 'var(--transition)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#fff8f5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🎭</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>{ev.eventName}</div>
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>📅 {dateCount} date{dateCount !== 1 ? 's' : ''}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>🎟 {totalBookings} booking{totalBookings !== 1 ? 's' : ''}</span>
                            <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>✅ {confirmedCount} confirmed</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent)', fontWeight: 400 }}>₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>revenue</div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── LEVEL 2: Dates for selected event ── */}
            {selectedEvent && !selectedDate && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 500 }}>
                  Select a date to see show timings
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(selectedEvent.dateMap)
                    .sort(([a], [b]) => new Date(a) - new Date(b))
                    .map(([date, slotMap]) => {
                      const allBookings     = Object.values(slotMap).flatMap((s) => s.bookings);
                      const confirmedCount  = allBookings.filter((b) => b.status === 'CONFIRMED').length;
                      const slotCount       = Object.keys(slotMap).length;
                      const revenue         = allBookings.filter((b) => b.status === 'CONFIRMED').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

                      return (
                        <div key={date} onClick={() => setSelectedDate(date)}
                          className="card"
                          style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', transition: 'var(--transition)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#fff8f5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                        >
                          {/* Date badge */}
                          <div style={{ width: 50, height: 54, borderRadius: '10px', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}
                            </span>
                            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                              {new Date(date + 'T00:00:00').getDate()}
                            </span>
                            <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}
                            </span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{formatDate(date)}</div>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>⏰ {slotCount} show time{slotCount !== 1 ? 's' : ''}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>🎟 {allBookings.length} booking{allBookings.length !== 1 ? 's' : ''}</span>
                              <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>✅ {confirmedCount} confirmed</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--accent)', fontWeight: 400 }}>₹{revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ── LEVEL 3: Slots for selected date ── */}
            {selectedEvent && selectedDate && !selectedSlot && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 500 }}>
                  Select a show timing to view its bookings
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.values(selectedEvent.dateMap[selectedDate])
                    .sort((a, b) => a.slotTime.localeCompare(b.slotTime))
                    .map((slot) => {
                      const confirmed = slot.bookings.filter((b) => b.status === 'CONFIRMED').length;
                      const revenue   = slot.bookings.filter((b) => b.status === 'CONFIRMED').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

                      return (
                        <div key={slot.slotId} onClick={() => setSelectedSlot(slot)}
                          className="card"
                          style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', transition: 'var(--transition)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#fff8f5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                        >
                          {/* Time badge */}
                          <div style={{ minWidth: 72, padding: '8px 12px', borderRadius: '10px', background: 'var(--accent-dim)', border: '1.5px solid rgba(224,92,42,0.2)', textAlign: 'center', flexShrink: 0 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '18px', color: 'var(--accent)', lineHeight: 1 }}>{slot.slotTime}</div>
                            {slot.endTime && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>–{slot.endTime}</div>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{slot.slotTime} Show</div>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>🎟 {slot.bookings.length} booking{slot.bookings.length !== 1 ? 's' : ''}</span>
                              <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>✅ {confirmed} confirmed</span>
                              {slot.bookings.filter((b) => b.status === 'CANCELLED').length > 0 && (
                                <span style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 600 }}>❌ {slot.bookings.filter((b) => b.status === 'CANCELLED').length} cancelled</span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--accent)', fontWeight: 400 }}>₹{revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ── LEVEL 4: Bookings table for selected slot ── */}
            {selectedEvent && selectedDate && selectedSlot && (
              <div>
                {/* Slot summary bar */}
                <div className="card" style={{ padding: '14px 18px', marginBottom: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--accent-dim)', borderColor: 'rgba(224,92,42,0.25)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent)' }}>{selectedEvent.eventName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(selectedDate)} · {selectedSlot.slotTime}{selectedSlot.endTime ? ` – ${selectedSlot.endTime}` : ''}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent)', fontWeight: 400 }}>{selectedSlot.bookings.length}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--green)', fontWeight: 400 }}>{selectedSlot.bookings.filter((b) => b.status === 'CONFIRMED').length}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIRMED</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent)', fontWeight: 400 }}>
                        ₹{selectedSlot.bookings.filter((b) => b.status === 'CONFIRMED').reduce((s, b) => s + parseFloat(b.amount || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>REVENUE</div>
                    </div>
                  </div>
                </div>

                {/* Bookings table */}
                {selectedSlot.bookings.length === 0 ? (
                  <div className="empty-state"><div className="empty-state-icon">🎟</div><h3>No bookings for this slot</h3></div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Ref Code</th><th>User</th><th>Amount</th><th>Status</th><th>Booked On</th><th>Details</th></tr>
                      </thead>
                      <tbody>
                        {selectedSlot.bookings.map((r) => (
                          <tr key={r.reservationId}>
                            <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>{r.refCode}</span></td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '13px' }}>{r.user?.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.user?.mail}</div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{parseFloat(r.amount || 0).toFixed(2)}</span>
                              {parseFloat(r.discount || 0) > 0 && (
                                <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>−₹{parseFloat(r.discount).toFixed(0)} off</div>
                              )}
                            </td>
                            <td><span className={`badge ${STATUS_BADGE[r.status] || 'badge-muted'}`}>{r.status}</span></td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {r.reservedDate ? new Date(r.reservedDate).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td>
                              <button onClick={() => openDetails(r)} className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}>
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

        ) : (
          /* ═══════════ CANCELLATIONS (unchanged) ═══════════ */
          filteredCan.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">❌</div><h3>No Cancellations</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Ref Code</th><th>User</th><th>Event</th><th>Reason</th><th>Refund Amt</th><th>Refund Status</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredCan.map((c) => (
                    <tr key={c.cancellationId}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>{c.reservation?.refCode}</span></td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.user?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.user?.mail}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.reservation?.slot?.event?.name || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '200px' }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '12px' }}>{c.reason || '—'}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{parseFloat(c.refundAmount || 0).toFixed(2)}</td>
                      <td><span className={`badge ${REFUND_BADGE[c.refundStatus] || 'badge-muted'}`}>{c.refundStatus}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{c.date ? new Date(c.date).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        {c.refundStatus === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => handleRefund(c.cancellationId, 'PROCESSED')} className="btn btn-success btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>Approve</button>
                            <button onClick={() => handleRefund(c.cancellationId, 'REJECTED')} className="btn btn-danger btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>Reject</button>
                          </div>
                        ) : c.refundStatus === 'PROCESSED' ? (
                          <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700 }}>✅ Approved</span>
                        ) : c.refundStatus === 'REJECTED' ? (
                          <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>❌ Rejected</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ── Booking Details Modal (unchanged) ── */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" style={{ maxWidth: '540px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Booking Details</h3>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div style={{ padding: '4px 0 16px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Customer</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{detailModal.user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{detailModal.user?.mail}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{detailModal.user?.contactNo}</div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Show</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{detailModal.slot?.event?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{detailModal.slot?.showDate} · {detailModal.slot?.startTime?.slice(0, 5)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{detailModal.slot?.location?.locName}</div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <SectionLabel>Booking Info</SectionLabel>
                <DetailRow label="Ref Code"    value={detailModal.refCode} mono />
                <DetailRow label="Status"      value={detailModal.status} />
                <DetailRow label="Booked On"   value={detailModal.reservedDate ? new Date(detailModal.reservedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'} />
                <DetailRow label="Subtotal"    value={`₹${(parseFloat(detailModal.amount || 0) + parseFloat(detailModal.discount || 0)).toFixed(2)}`} />
                {parseFloat(detailModal.discount || 0) > 0 && <DetailRow label="Discount" value={`−₹${parseFloat(detailModal.discount).toFixed(2)}`} green />}
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
                      const typeColor = rs.seat?.seatType === 'VIP' ? '#c97d1a' : rs.seat?.seatType === 'PREMIUM' ? '#2563a8' : '#6b7280';
                      return (
                        <div key={rs.resSeatId} style={{ padding: '8px 12px', borderRadius: '8px', textAlign: 'center', minWidth: '64px', background: `${typeColor}12`, border: `1.5px solid ${typeColor}44` }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px', color: typeColor }}>{rs.seat?.rowLetter}{rs.seat?.seatNo}</div>
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
                    <DetailRow label="Payment Mode"     value={detailTxn.paymentMethod} />
                    <DetailRow label="Txn Ref"          value={detailTxn.transactionRef} mono />
                    <DetailRow label="Txn Status"       value={detailTxn.status} />
                    <DetailRow label="Txn Date"         value={detailTxn.date ? new Date(detailTxn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'} />
                    {parseFloat(detailTxn.discountAmount || 0) > 0 && <DetailRow label="Discount Applied" value={`−₹${parseFloat(detailTxn.discountAmount).toFixed(2)}`} green />}
                    <DetailRow label="Amount Charged"   value={`₹${parseFloat(detailTxn.amount || 0).toFixed(2)}`} bold />
                  </>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>No payment record found</div>
                )}
              </div>
            </div>
            <div style={{ paddingTop: '8px' }}>
              <button onClick={() => setDetailModal(null)} className="btn btn-secondary btn-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>{children}</div>
);

const DetailRow = ({ label, value, mono, bold, green }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
    <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', fontWeight: bold ? 800 : 600, color: green ? 'var(--green)' : 'var(--text-primary)' }}>{value}</span>
  </div>
);

export default AdminBookingsPage;