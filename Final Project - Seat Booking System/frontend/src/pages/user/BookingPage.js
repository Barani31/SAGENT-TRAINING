import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSlotById, getAllSeatsForSlot, bookSeats, processPayment, getLoyaltyOffer } from '../../api/api';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = ['UPI', 'CARD', 'NETBANKING', 'WALLET'];
const PM_ICONS        = { UPI: '📱', CARD: '💳', NETBANKING: '🏦', WALLET: '👛' };
const SEAT_TYPE_COLOR = { VIP: '#c97d1a', PREMIUM: '#2563a8', REGULAR: '#9c9285' };
const CONVENIENCE_FEE = { MOVIE: 5, CONCERT: 8, EVENT: 6 };
const GST_RATE        = { MOVIE: 5, CONCERT: 10, EVENT: 12 };
const HOLD_SECONDS    = 2 * 60; // 2 minutes

const getConvenienceFee = (eventType, base) => {
  const pct = CONVENIENCE_FEE[eventType?.toUpperCase()] || 5;
  return { pct, amount: parseFloat(((base * pct) / 100).toFixed(2)) };
};
const getGst = (eventType, base) => {
  const pct = GST_RATE[eventType?.toUpperCase()] || 5;
  return { pct, amount: parseFloat(((base * pct) / 100).toFixed(2)) };
};

const lockSeats    = (slotId, userId, seatSlotIds) => api.post(`/seat-slots/lock?slotId=${slotId}&userId=${userId}`, seatSlotIds);
const releaseSeats = (slotId, userId)              => api.post(`/seat-slots/release?slotId=${slotId}&userId=${userId}`);

const BookingPage = () => {
  const { slotId }  = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [slot, setSlot]                   = useState(null);
  const [allSeatSlots, setAllSeatSlots]   = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [step, setStep]                   = useState(1);
  const [payMethod, setPayMethod]         = useState('UPI');
  const [booking, setBooking]             = useState(null);
  const [processing, setProcessing]       = useState(false);
  const [loyaltyOffer, setLoyaltyOffer]   = useState(null);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(0);

  const holdTimerRef = useRef(null);
  const seatsLocked  = useRef(false);
  const stepRef      = useRef(1); // track step inside interval closure

  // Keep stepRef in sync with step state
  useEffect(() => { stepRef.current = step; }, [step]);

  useEffect(() => {
    const load = async () => {
      try {
        const [slRes, seatsRes] = await Promise.all([
          getSlotById(slotId),
          getAllSeatsForSlot(slotId),
        ]);
        setSlot(slRes.data?.data || null);
        setAllSeatSlots(Array.isArray(seatsRes.data?.data) ? seatsRes.data.data : []);
      } catch { toast.error('Failed to load seat details'); }
      finally { setLoading(false); }
    };
    load();

    if (user?.userId) {
      getLoyaltyOffer(user.userId)
        .then((res) => {
          const data = res.data?.data;
          if (data?.hasOffer && data?.discountPercent > 0) {
            setLoyaltyOffer({ discountPct: data.discountPercent });
          }
        })
        .catch(() => {});
    }

    // Auto-refresh seat availability every 30s so locked/booked seats show in real-time
    const refreshInterval = setInterval(() => {
      if (stepRef.current === 1) {
        getAllSeatsForSlot(slotId).then((res) => {
          setAllSeatSlots(Array.isArray(res.data?.data) ? res.data.data : []);
        }).catch(() => {});
      }
    }, 2000);

    return () => {
      if (seatsLocked.current) releaseSeats(slotId, user?.userId).catch(() => {});
      clearInterval(holdTimerRef.current);
      clearInterval(refreshInterval);
    };
  }, [slotId, user]);

  const startHoldTimer = () => {
    setHoldSecondsLeft(HOLD_SECONDS);
    clearInterval(holdTimerRef.current);
    holdTimerRef.current = setInterval(() => {
      setHoldSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(holdTimerRef.current);
          toast.error('⏰ Your 2-min seat hold has expired. Please reselect your seats.');
          seatsLocked.current = false;
          setStep(1);
          // Immediately refresh seats so freed seats show right away
          getAllSeatsForSlot(slotId).then((res) => {
            setAllSeatSlots(Array.isArray(res.data?.data) ? res.data.data : []);
          });
          // Refresh again after 2s to catch backend scheduler release
          setTimeout(() => {
            getAllSeatsForSlot(slotId).then((res) => {
              setAllSeatSlots(Array.isArray(res.data?.data) ? res.data.data : []);
            });
          }, 2000);
          setSelectedSeats([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatHoldTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const toggleSeat = (ss) => {
    if (ss.availability !== 'AVAILABLE') return;
    if (selectedSeats.find((s) => s.seatSlotId === ss.seatSlotId)) {
      setSelectedSeats((prev) => prev.filter((s) => s.seatSlotId !== ss.seatSlotId));
    } else {
      if (selectedSeats.length >= 10) { toast.error('Max 10 seats per booking'); return; }
      setSelectedSeats((prev) => [...prev, ss]);
    }
  };

  const subtotal       = selectedSeats.reduce((sum, ss) => sum + parseFloat(ss.price || 0), 0);
  const loyaltyPct     = loyaltyOffer?.discountPct || 0;
  const discountAmount = loyaltyPct > 0 ? parseFloat((subtotal * loyaltyPct).toFixed(2)) : 0;
  const { pct: gstPct, amount: gstAmount } = getGst(slot?.event?.type, subtotal);
  const { pct: feePct, amount: feeAmount } = getConvenienceFee(slot?.event?.type, subtotal);
  const grandTotal = parseFloat((subtotal + gstAmount + feeAmount - discountAmount).toFixed(2));

  const proceedToPayment = async () => {
    if (selectedSeats.length === 0) return;
    try {
      await lockSeats(parseInt(slotId), user.userId, selectedSeats.map((s) => s.seatSlotId));
      seatsLocked.current = true;
      startHoldTimer();
      setStep(2);
    } catch {
      toast.error('Could not hold seats — please try again');
    }
  };

  const handleBack = async () => {
    clearInterval(holdTimerRef.current);
    if (seatsLocked.current) {
      await releaseSeats(parseInt(slotId), user.userId).catch(() => {});
      seatsLocked.current = false;
    }
    setHoldSecondsLeft(0);
    setStep(1);
    const seatsRes = await getAllSeatsForSlot(slotId).catch(() => null);
    if (seatsRes) setAllSeatSlots(Array.isArray(seatsRes.data?.data) ? seatsRes.data.data : []);
  };

  const handleBook = async () => {
    if (selectedSeats.length === 0) { toast.error('Select at least one seat'); return; }
    setProcessing(true);
    try {
      const res = await bookSeats({
        userId:        user.userId,
        slotId:        parseInt(slotId),
        seatIds:       selectedSeats.map((s) => s.seat.seatId),
        discount:      discountAmount > 0 ? discountAmount : undefined,
        paymentMethod: payMethod,
      });
      const reservation   = res.data?.data;
      const finalAmount   = parseFloat(reservation?.amount   || grandTotal);
      const finalDiscount = parseFloat(reservation?.discount || discountAmount || 0);
      const txnRes = await processPayment({
        reservationId:  reservation.reservationId,
        paymentMethod:  payMethod,
        amount:         finalAmount,
        discountAmount: finalDiscount,
        transactionRef: null,
      });
      clearInterval(holdTimerRef.current);
      seatsLocked.current = false;
      setBooking({ reservation, transaction: txnRes.data?.data });
      setStep(3);
      toast.success('Booking confirmed! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setProcessing(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!slot)   return <div className="empty-state"><h3>Slot not found</h3></div>;

  const rows = {};
  allSeatSlots.forEach((ss) => {
    const r = ss.seat?.rowLetter || 'A';
    if (!rows[r]) rows[r] = [];
    rows[r].push(ss);
  });

  const availableCount = allSeatSlots.filter((ss) => ss.availability === 'AVAILABLE').length;
  const bookedCount    = allSeatSlots.filter((ss) => ss.availability === 'BOOKED').length;
  const timerColor = holdSecondsLeft > 60 ? '#1a8f63' : holdSecondsLeft > 30 ? '#c97d1a' : '#e8305a';
  const timerBg    = holdSecondsLeft > 60 ? '#e8fff5' : holdSecondsLeft > 30 ? '#fff8e6' : '#fff0f0';

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '920px', paddingTop: '32px', paddingBottom: '48px' }}>

        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px', paddingLeft: 0 }}>← Back</button>

        {/* Slot info bar */}
        <div className="card" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>{slot.event?.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
              📅 {slot.showDate} &nbsp;·&nbsp; ⏰ {slot.startTime?.slice(0, 5)}–{slot.endTime?.slice(0, 5)} &nbsp;·&nbsp; 📍 {slot.location?.locName}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
            {step === 2 && holdSecondsLeft > 0 && (
              <div style={{ padding: '8px 14px', borderRadius: '10px', background: timerBg, border: `1.5px solid ${timerColor}40`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>⏱</span>
                <div>
                  <div style={{ fontSize: '10px', color: timerColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seat Hold</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: timerColor, lineHeight: 1 }}>
                    {formatHoldTime(holdSecondsLeft)}
                  </div>
                </div>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--green)', fontWeight: 400 }}>{availableCount}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booked</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--red)', fontWeight: 400 }}>{bookedCount}</div>
            </div>
          </div>
        </div>

        {step === 3 && <ConfirmationStep booking={booking} navigate={navigate} />}

        {step === 2 && (
          <PaymentStep
            selectedSeats={selectedSeats}
            subtotal={subtotal} discountAmount={discountAmount} loyaltyPct={loyaltyPct}
            gstPct={gstPct} gstAmount={gstAmount} feePct={feePct} feeAmount={feeAmount}
            grandTotal={grandTotal} eventType={slot?.event?.type}
            payMethod={payMethod} setPayMethod={setPayMethod}
            holdSecondsLeft={holdSecondsLeft} timerColor={timerColor} timerBg={timerBg}
            formatHoldTime={formatHoldTime}
            onBack={handleBack} onConfirm={handleBook} processing={processing}
          />
        )}

        {step === 1 && (
          <>
            {loyaltyOffer && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', background: 'linear-gradient(135deg,#fff8f0,#fef2e0)', border: '1.5px solid rgba(224,92,42,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🌟</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>
                    Loyalty Reward: {Math.round(loyaltyPct * 100)}% OFF will be applied at checkout!
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {selectedSeats.length > 0 ? `You'll save ₹${discountAmount.toFixed(2)} on this booking` : 'Select seats to see your savings'}
                  </div>
                </div>
              </div>
            )}

            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', background: 'var(--blue-dim)', border: '1px solid rgba(37,99,168,0.15)', fontSize: '12px', color: 'var(--blue)', fontWeight: 600 }}>
              ⏱ Selected seats will be held for <strong>2 minutes</strong> once you proceed to payment
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <SeatLegendItem color="var(--red)"  bg="rgba(185,28,28,0.08)"  label="Booked" cross />
              <SeatLegendItem color="var(--gold)" bg="rgba(201,125,26,0.08)" label="On Hold" />
              <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
              {Object.entries(SEAT_TYPE_COLOR).map(([type, color]) => (
                <span key={type} style={{ fontSize: '12px', color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: 8, height: 8, background: color, borderRadius: '50%', display: 'inline-block' }} />{type}
                </span>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                GST {gstPct}% + {feePct}% convenience fee
              </span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '9px', background: 'var(--bg-card)', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '7px', textTransform: 'uppercase', fontWeight: 600 }}>
              ── SCREEN ──
            </div>

            <div className="card" style={{ padding: '28px', overflowX: 'auto' }}>
              {allSeatSlots.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}><p style={{ fontSize: '13px' }}>No seats configured for this slot</p></div>
              ) : (
                Object.entries(rows).sort().map(([row, rowSeats]) => (
                  <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ width: '20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', flexShrink: 0, fontWeight: 600 }}>{row}</span>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {rowSeats.sort((a, b) => (parseInt(a.seat?.seatNo) || 0) - (parseInt(b.seat?.seatNo) || 0)).map((ss) => {
                        const isBooked   = ss.availability === 'BOOKED';
                        const isLocked   = ss.availability === 'LOCKED';
                        const isSelected = !!selectedSeats.find((s) => s.seatSlotId === ss.seatSlotId);
                        const typeColor  = SEAT_TYPE_COLOR[ss.seat?.seatType] || '#9c9285';
                        let bg, border, textColor, cursor, opacity;
                        if (isBooked)        { bg = 'rgba(185,28,28,0.08)';  border = 'var(--red)';    textColor = 'var(--red)';   cursor = 'not-allowed'; opacity = 1; }
                        else if (isLocked)   { bg = 'rgba(201,125,26,0.08)'; border = 'var(--gold)'; textColor = 'var(--gold)'; cursor = 'not-allowed'; opacity = 0.7; }
                        else if (isSelected) { bg = 'var(--accent)';          border = 'var(--accent)'; textColor = '#fff';       cursor = 'pointer';     opacity = 1; }
                        else                 { bg = `${typeColor}15`;          border = typeColor;     textColor = typeColor;     cursor = 'pointer';     opacity = 1; }
                        return (
                          <div key={ss.seatSlotId} style={{ position: 'relative' }}>
                            <button onClick={() => toggleSeat(ss)} disabled={isBooked || isLocked}
                              title={`${ss.seat?.rowLetter}${ss.seat?.seatNo} | ${ss.seat?.seatType} | ₹${ss.price} | ${ss.availability}`}
                              style={{ width: '36px', height: '32px', borderRadius: '5px 5px 2px 2px', border: `2px solid ${border}`, background: bg, color: textColor, fontSize: '10px', fontWeight: 700, cursor, opacity, fontFamily: 'var(--font-mono)', transition: 'var(--transition)', position: 'relative' }}
                              onMouseEnter={(e) => { if (!isBooked && !isLocked && !isSelected) { e.currentTarget.style.background = `${typeColor}30`; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                              onMouseLeave={(e) => { if (!isBooked && !isLocked && !isSelected) { e.currentTarget.style.background = `${typeColor}15`; e.currentTarget.style.transform = ''; } }}
                            >
                              {ss.seat?.seatNo}
                              {isBooked && <span style={{ position: 'absolute', top: '1px', right: '2px', fontSize: '8px', color: 'var(--red)', fontWeight: 900, lineHeight: 1 }}>✕</span>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedSeats.length > 0 && (
              <div style={{ position: 'sticky', bottom: 0, background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '20px', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 500 }}>
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}: <strong style={{ color: 'var(--text-primary)' }}>{selectedSeats.map((s) => `${s.seat?.rowLetter}${s.seat?.seatNo}`).join(', ')}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--accent)' }}>₹{grandTotal.toFixed(2)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      (GST {gstPct}% + {feePct}% fee{discountAmount > 0 ? ` · 🌟 ${Math.round(loyaltyPct * 100)}% off` : ''})
                    </div>
                  </div>
                </div>
                <button onClick={proceedToPayment} className="btn btn-primary btn-lg">Proceed to Payment →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SeatLegendItem = ({ color, bg, label, cross }) => (
  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
    <span style={{ width: 20, height: 18, background: bg, border: `2px solid ${color}`, borderRadius: '4px 4px 2px 2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color, fontWeight: 900 }}>
      {cross && '✕'}
    </span>
    {label}
  </span>
);

const PaymentStep = ({
  selectedSeats, subtotal, discountAmount, loyaltyPct,
  gstPct, gstAmount, feePct, feeAmount, grandTotal, eventType,
  payMethod, setPayMethod, holdSecondsLeft, timerColor, timerBg, formatHoldTime,
  onBack, onConfirm, processing,
}) => (
  <div style={{ maxWidth: '480px', margin: '0 auto' }}>
    {holdSecondsLeft > 0 && (
      <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', background: timerBg, border: `1.5px solid ${timerColor}40`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '22px' }}>⏱</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: timerColor }}>Seats held — complete payment within</div>
          <div style={{ fontSize: '10px', color: timerColor, opacity: 0.8, marginTop: '2px' }}>Seats release automatically when timer expires</div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: timerColor, flexShrink: 0 }}>
          {formatHoldTime(holdSecondsLeft)}
        </div>
      </div>
    )}

    <div className="card" style={{ padding: '28px', marginBottom: '16px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, marginBottom: '20px' }}>Order Summary</h3>
      {selectedSeats.map((s) => (
        <div key={s.seatSlotId} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Seat {s.seat?.rowLetter}{s.seat?.seatNo}
            <span style={{ marginLeft: '6px', fontSize: '11px', color: SEAT_TYPE_COLOR[s.seat?.seatType], fontWeight: 700 }}>{s.seat?.seatType}</span>
          </span>
          <span style={{ fontWeight: 700 }}>₹{parseFloat(s.price).toFixed(2)}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Subtotal</span>
        <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
          GST <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px', background: '#f0f4ff', color: '#4a5568', border: '1px solid #cbd5e0' }}>{eventType} {gstPct}%</span>
        </span>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>₹{gstAmount.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
          Convenience Fee <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px', background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid rgba(37,99,168,0.15)' }}>{eventType} {feePct}%</span>
        </span>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>₹{feeAmount.toFixed(2)}</span>
      </div>
      {discountAmount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontSize: '14px', borderBottom: '1px solid var(--border)', background: '#fffbf0', borderLeft: '3px solid #c97d1a' }}>
          <span style={{ color: '#c97d1a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            🌟 Loyalty Reward
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px', background: '#fff3d0', color: '#c97d1a', border: '1px solid rgba(201,125,26,0.3)' }}>{Math.round(loyaltyPct * 100)}% OFF</span>
          </span>
          <span style={{ fontWeight: 700, color: '#1a8f63' }}>−₹{discountAmount.toFixed(2)}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '15px' }}>Total Payable</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, color: 'var(--accent)' }}>₹{grandTotal.toFixed(2)}</span>
      </div>
      {discountAmount > 0 && (
        <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: '#f0faf6', border: '1px solid rgba(26,143,99,0.2)', fontSize: '13px', color: '#1a8f63', fontWeight: 600 }}>
          🎉 You're saving ₹{discountAmount.toFixed(2)} with your loyalty reward!
        </div>
      )}
    </div>

    <div className="card" style={{ padding: '28px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, marginBottom: '20px' }}>Payment Method</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        {PAYMENT_METHODS.map((m) => (
          <button key={m} onClick={() => setPayMethod(m)} style={{
            padding: '14px', borderRadius: '10px', border: '1.5px solid',
            borderColor: payMethod === m ? 'var(--accent)' : 'var(--border)',
            background:  payMethod === m ? 'var(--accent-dim)' : 'var(--bg-card)',
            color:       payMethod === m ? 'var(--accent)'     : 'var(--text-secondary)',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px',
            transition: 'var(--transition)', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)',
          }}>{PM_ICONS[m]} {m}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ flex: 1 }}>← Back</button>
        <button onClick={onConfirm} disabled={processing} className="btn btn-primary" style={{ flex: 2 }}>
          {processing ? 'Processing...' : `Pay ₹${grandTotal.toFixed(2)}`}
        </button>
      </div>
    </div>
  </div>
);

const ConfirmationStep = ({ booking, navigate }) => {
  const amount   = parseFloat(booking?.reservation?.amount   || 0);
  const discount = parseFloat(booking?.reservation?.discount || 0);
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '44px', border: '2px solid var(--green)', boxShadow: '0 8px 32px rgba(26,143,99,0.12)' }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--green)', marginBottom: '6px' }}>Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '14px' }}>A confirmation email has been sent to you</p>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '18px', marginBottom: '24px', textAlign: 'left' }}>
          <InfoRow label="Ref Code"            value={booking?.reservation?.refCode} mono />
          <InfoRow label="Amount Paid"         value={`₹${amount.toFixed(2)}`} />
          {discount > 0 && <InfoRow label="🌟 Discount Applied" value={`−₹${discount.toFixed(2)}`} />}
          <InfoRow label="Transaction ID"      value={booking?.transaction?.transactionRef} mono />
          <InfoRow label="Status"              value="✅ Confirmed" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/my-bookings')} className="btn btn-primary" style={{ flex: 1 }}>🎟 View Ticket</button>
          <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ flex: 1 }}>Browse More</button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
    <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
  </div>
);

export default BookingPage;