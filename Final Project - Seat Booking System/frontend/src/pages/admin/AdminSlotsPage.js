import React, { useState, useEffect } from 'react';
import { getEventsByOrganiser, getSlotsByEvent, getAllLocations, createSlot, updateSlot, deleteSlot } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  AVAILABLE: { bg: '#e8f8f2', color: '#00a86b', border: '#b2e8d0' },
  HOUSEFULL: { bg: '#fff8e6', color: '#d4900a', border: '#f0d98a' },
  CANCELLED: { bg: '#fdecea', color: '#d63b2f', border: '#f5b7b1' },
};

const EVENT_STATUS_STYLE = {
  ACTIVE:    { bg: '#e8fff5', color: '#1a8f63', border: '#b2e8d0' },
  CANCELLED: { bg: '#fdecea', color: '#d63b2f', border: '#f5b7b1' },
  COMPLETED: { bg: '#eff6ff', color: '#2563a8', border: '#bfdbfe' },
};

const TYPE_ICON = { MOVIE: '🎬', CONCERT: '🎵', EVENT: '🎪' };

// ── Duration helpers ──────────────────────────────────────────────────────────
const parseDurationToMinutes = (durationStr) => {
  if (!durationStr) return 0;
  const hourMatch = durationStr.match(/(\d+)\s*h/);
  const minMatch  = durationStr.match(/(\d+)\s*min/);
  return (hourMatch ? parseInt(hourMatch[1]) : 0) * 60 + (minMatch ? parseInt(minMatch[1]) : 0);
};

const addMinutesToTime = (timeStr, minutes) => {
  if (!timeStr || !minutes) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const total  = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
    day:     d.getDate(),
    month:   d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    full:    d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
};

const isToday = (dateStr) => new Date().toISOString().split('T')[0] === dateStr;
const isPast  = (dateStr) => new Date(dateStr + 'T00:00:00') < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');

const groupByLocationThenDate = (slots, locations) => {
  const locMap = {};
  locations.forEach((l) => { locMap[l.locationId] = { ...l, dateMap: {} }; });
  slots.forEach((s) => {
    const locId = s.location?.locationId;
    if (!locId) return;
    if (!locMap[locId]) locMap[locId] = { ...s.location, locationId: locId, dateMap: {} };
    const date = s.showDate;
    if (!locMap[locId].dateMap[date]) locMap[locId].dateMap[date] = [];
    locMap[locId].dateMap[date].push(s);
  });
  return Object.values(locMap).filter((l) => Object.keys(l.dateMap).length > 0);
};

const AdminSlotsPage = () => {
  const { user } = useAuth();
  const [slots, setSlots]               = useState([]);
  const [events, setEvents]             = useState([]);
  const [locations, setLocations]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState(false);
  const [editId, setEditId]             = useState(null);
  const [saving, setSaving]             = useState(false);
  const [expandedLoc, setExpandedLoc]   = useState(null);
  const [expandedDate, setExpandedDate] = useState({});
  const [form, setForm] = useState({
    eventId: '', locationId: '', showDate: '', startTime: '', endTime: '', seatsLeft: '', slotStatus: 'AVAILABLE',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [evRes, locRes] = await Promise.all([
        getEventsByOrganiser(user.userId),
        getAllLocations(),
      ]);
      const evs  = Array.isArray(evRes.data?.data)  ? evRes.data.data  : [];
      const locs = Array.isArray(locRes.data?.data) ? locRes.data.data : [];
      setEvents(evs);
      setLocations(locs);
      if (evs.length > 0) {
        const results = await Promise.allSettled(evs.map((e) => getSlotsByEvent(e.eventId)));
        const all = results.flatMap((r) =>
          r.status === 'fulfilled' ? (Array.isArray(r.value.data?.data) ? r.value.data.data : []) : []
        );
        setSlots(all);
      } else { setSlots([]); }
    } catch { toast.error('Failed to load slots'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ eventId: events[0]?.eventId || '', locationId: locations[0]?.locationId || '', showDate: '', startTime: '', endTime: '', seatsLeft: '', slotStatus: 'AVAILABLE' });
    setEditId(null);
    setModal(true);
  };

  const openEdit = (s, e) => {
    e.stopPropagation();
    setForm({
      eventId:    s.event?.eventId         || '',
      locationId: s.location?.locationId   || '',
      showDate:   s.showDate               || '',
      startTime:  s.startTime?.slice(0, 5) || '',
      endTime:    s.endTime?.slice(0, 5)   || '',
      seatsLeft:  s.seatsLeft              || '',
      slotStatus: s.slotStatus             || 'AVAILABLE',
    });
    setEditId(s.slotId);
    setModal(true);
  };

  // Get duration of currently selected event
  const selectedEvent = events.find((e) => String(e.eventId) === String(form.eventId));
  const selectedEventDuration = selectedEvent?.duration || '';
  const durationMins = parseDurationToMinutes(selectedEventDuration);

  // When start time changes — auto-calc end time from event duration
  const handleStartTimeChange = (newStart) => {
    const autoEnd = durationMins > 0 ? addMinutesToTime(newStart, durationMins) : '';
    setForm((f) => ({ ...f, startTime: newStart, endTime: autoEnd || f.endTime }));
  };

  // When event changes — re-calc end time if start time already set
  const handleEventChange = (newEventId) => {
    const ev = events.find((e) => String(e.eventId) === String(newEventId));
    const mins = parseDurationToMinutes(ev?.duration || '');
    setForm((f) => ({
      ...f,
      eventId: newEventId,
      endTime: (mins > 0 && f.startTime) ? addMinutesToTime(f.startTime, mins) : f.endTime,
    }));
  };

  const save = async () => {
    if (!form.eventId || !form.locationId || !form.showDate || !form.startTime) {
      toast.error('Event, venue, date and start time are required'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        eventId:    parseInt(form.eventId),
        locationId: parseInt(form.locationId),
        seatsLeft:  form.seatsLeft ? parseInt(form.seatsLeft) : null,
      };
      if (editId) { await updateSlot(editId, payload); toast.success('Slot updated'); }
      else        { await createSlot(payload);         toast.success('Slot created!'); }
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save slot'); }
    finally { setSaving(false); }
  };

  const del = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this slot?')) return;
    try { await deleteSlot(id); toast.success('Slot deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const toggleLoc  = (locId) => { setExpandedLoc(expandedLoc === locId ? null : locId); setExpandedDate({}); };
  const toggleDate = (locId, date) => setExpandedDate((prev) => ({ ...prev, [locId]: prev[locId] === date ? null : date }));
  const isSlotEditable = (slot) => (slot.event?.status?.toUpperCase() || 'ACTIVE') === 'ACTIVE';

  const grouped = groupByLocationThenDate(slots, locations);
  const autoEndActive = durationMins > 0 && !!form.startTime;

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: '28px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>SHOW SLOTS</h1>
          <p className="page-subtitle">Browse by venue · click a venue to see its shows</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">➕ Add Slot</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {grouped.length} venue{grouped.length !== 1 ? 's' : ''}</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>🎭 {slots.length} total slot{slots.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : grouped.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📍</div>
          <h3>No Slots Found</h3>
          <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: '16px' }}>Add First Slot</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {grouped.map((loc) => {
            const locOpen     = expandedLoc === loc.locationId;
            const totalSlots  = Object.values(loc.dateMap).flat().length;
            const totalSeats  = Object.values(loc.dateMap).flat().reduce((s, sl) => s + (sl.seatsLeft || 0), 0);
            const dateEntries = Object.entries(loc.dateMap).sort(([a], [b]) => new Date(a) - new Date(b));
            const uniqueEvents = [...new Map(Object.values(loc.dateMap).flat().map((s) => [s.event?.eventId, s.event?.name])).entries()];

            return (
              <div key={loc.locationId} style={{
                borderRadius: '16px',
                border: `1.5px solid ${locOpen ? 'var(--accent)' : 'var(--border)'}`,
                background: 'var(--bg-primary)', overflow: 'hidden',
                boxShadow: locOpen ? '0 6px 28px rgba(0,0,0,0.09)' : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}>
                <div onClick={() => toggleLoc(loc.locationId)} style={{
                  display: 'flex', alignItems: 'center', gap: '18px', padding: '20px 24px',
                  cursor: 'pointer', background: locOpen ? '#fff8f5' : 'transparent',
                  borderBottom: locOpen ? '1.5px solid var(--border)' : 'none', transition: 'background 0.2s',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '12px', flexShrink: 0,
                    background: locOpen ? 'var(--accent)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${locOpen ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', transition: 'all 0.2s',
                  }}>📍</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                      {loc.locName || `Venue #${loc.locationId}`}
                    </div>
                    {loc.address && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>{loc.address}</div>}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>🎭 {totalSlots} show{totalSlots !== 1 ? 's' : ''}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>📅 {dateEntries.length} date{dateEntries.length !== 1 ? 's' : ''}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>💺 {totalSeats} seats left</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '300px' }}>
                    {uniqueEvents.slice(0, 3).map(([id, name]) => (
                      <span key={id} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {name?.length > 16 ? name.slice(0, 16) + '…' : name}
                      </span>
                    ))}
                    {uniqueEvents.length > 3 && <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '3px 6px' }}>+{uniqueEvents.length - 3} more</span>}
                  </div>
                  <span style={{ fontSize: '20px', color: locOpen ? 'var(--accent)' : 'var(--text-muted)', transform: locOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0, marginLeft: '8px' }}>▾</span>
                </div>

                {locOpen && (
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {dateEntries.map(([date, daySlots]) => {
                      const df       = formatDate(date);
                      const today    = isToday(date);
                      const past     = isPast(date);
                      const dateOpen = expandedDate[loc.locationId] === date;
                      const sortedSlots = [...daySlots].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

                      return (
                        <div key={date} style={{
                          borderRadius: '12px',
                          border: `1.5px solid ${dateOpen ? 'rgba(224,92,42,0.35)' : 'var(--border)'}`,
                          overflow: 'hidden', background: 'var(--bg-primary)', opacity: past ? 0.72 : 1,
                        }}>
                          <div onClick={() => toggleDate(loc.locationId, date)} style={{
                            display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px',
                            cursor: 'pointer', background: dateOpen ? 'var(--bg-secondary)' : 'transparent',
                            borderBottom: dateOpen ? '1px solid var(--border)' : 'none',
                          }}>
                            <div style={{
                              width: 46, height: 50, borderRadius: '9px', flexShrink: 0,
                              background: today ? 'var(--accent)' : 'var(--bg-secondary)',
                              border: `1.5px solid ${today ? 'var(--accent)' : 'var(--border)'}`,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: today ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', letterSpacing: '0.06em' }}>{df.weekday}</span>
                              <span style={{ fontSize: '20px', fontWeight: 800, color: today ? '#fff' : 'var(--text-primary)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>{df.day}</span>
                              <span style={{ fontSize: '9px', fontWeight: 600, color: today ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>{df.month}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{df.full}</span>
                                {today && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', background: 'var(--accent)', color: '#fff' }}>TODAY</span>}
                                {past  && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Past</span>}
                              </div>
                              <div style={{ display: 'flex', gap: '14px', marginTop: '3px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🎬 {sortedSlots.length} show{sortedSlots.length !== 1 ? 's' : ''}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>💺 {sortedSlots.reduce((s, sl) => s + (sl.seatsLeft || 0), 0)} seats left</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '220px' }}>
                              {sortedSlots.slice(0, 4).map((s) => {
                                const sc = STATUS_STYLE[s.slotStatus] || STATUS_STYLE.AVAILABLE;
                                return (
                                  <span key={s.slotId} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontWeight: 700 }}>
                                    {s.startTime?.slice(0, 5)}
                                  </span>
                                );
                              })}
                              {sortedSlots.length > 4 && <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '2px 5px' }}>+{sortedSlots.length - 4}</span>}
                            </div>
                            <span style={{ fontSize: '16px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '6px', transform: dateOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                          </div>

                          {dateOpen && (
                            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {sortedSlots.map((s) => {
                                const sc       = STATUS_STYLE[s.slotStatus] || STATUS_STYLE.AVAILABLE;
                                const editable = isSlotEditable(s);
                                const evStatus = s.event?.status?.toUpperCase();
                                const showEventBadge = evStatus && evStatus !== 'ACTIVE';
                                const evSS = EVENT_STATUS_STYLE[evStatus] || EVENT_STATUS_STYLE.ACTIVE;

                                return (
                                  <div key={s.slotId} style={{
                                    display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px',
                                    borderRadius: '10px',
                                    border: `1.5px solid ${showEventBadge ? evSS.border : sc.border}`,
                                    background: showEventBadge ? evSS.bg : sc.bg,
                                    opacity: editable ? 1 : 0.85,
                                  }}>
                                    <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '68px', padding: '6px 10px', borderRadius: '8px', background: 'white', border: '1px solid var(--border)' }}>
                                      <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                        {s.startTime?.slice(0, 5)}
                                      </div>
                                      {s.endTime && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>–{s.endTime.slice(0, 5)}</div>}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                                        <span>{TYPE_ICON[s.event?.type] || '🎭'}</span>
                                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{s.event?.name}</span>
                                        {showEventBadge ? (
                                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: 'white', color: evSS.color, border: `1px solid ${evSS.border}` }}>Event {evStatus}</span>
                                        ) : (
                                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: 'white', color: sc.color, border: `1px solid ${sc.border}` }}>{s.slotStatus}</span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                        {s.event?.genre    && <span>🎭 {s.event.genre}</span>}
                                        {s.event?.language && <span>🌐 {s.event.language}</span>}
                                        {s.event?.duration && <span>⏱ {s.event.duration}</span>}
                                        <span style={{ fontWeight: 700, color: s.seatsLeft > 20 ? 'var(--green)' : s.seatsLeft > 0 ? 'var(--gold)' : 'var(--accent)' }}>💺 {s.seatsLeft} left</span>
                                      </div>
                                      {!editable && (
                                        <div style={{ fontSize: '11px', marginTop: '4px', color: evSS.color, fontWeight: 600 }}>
                                          🔒 Locked — event is {evStatus}. Set event back to ACTIVE to edit.
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                      <button onClick={(e) => editable && openEdit(s, e)} disabled={!editable} className="btn btn-secondary btn-sm"
                                        style={{ opacity: editable ? 1 : 0.3, cursor: editable ? 'pointer' : 'not-allowed' }}>Edit</button>
                                      <button onClick={(e) => editable && del(s.slotId, e)} disabled={!editable} className="btn btn-danger btn-sm"
                                        style={{ opacity: editable ? 1 : 0.3, cursor: editable ? 'pointer' : 'not-allowed' }}>Delete</button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'EDIT SLOT' : 'ADD SHOW SLOT'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>

            {/* Event */}
            <div className="form-group">
              <label className="form-label">Event *</label>
              <select className="form-input" value={form.eventId} onChange={(e) => handleEventChange(e.target.value)}>
                <option value="">Select event</option>
                {events.filter((e) => e.status === 'ACTIVE').map((e) => (
                  <option key={e.eventId} value={e.eventId}>{e.name}{e.duration ? ` (${e.duration})` : ''}</option>
                ))}
              </select>
            </div>

            {/* Venue */}
            <div className="form-group">
              <label className="form-label">Venue *</label>
              <select className="form-input" value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}>
                <option value="">Select venue</option>
                {locations.map((l) => <option key={l.locationId} value={l.locationId}>{l.locName} – {l.address}</option>)}
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Show Date *</label>
              <input type="date" className="form-input" value={form.showDate} onChange={(e) => setForm((f) => ({ ...f, showDate: e.target.value }))} />
            </div>

            {/* Start + End time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                {/* Auto-calc end time on start time change */}
                <input type="time" className="form-input" value={form.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  End Time
                  {autoEndActive && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--accent)', fontWeight: 700 }}>✓ auto</span>
                  )}
                </label>
                <input type="time" className="form-input" value={form.endTime}
                  readOnly={autoEndActive}
                  style={{ opacity: autoEndActive ? 0.75 : 1, cursor: autoEndActive ? 'not-allowed' : 'auto', background: autoEndActive ? 'var(--bg-secondary)' : '' }}
                  onChange={(e) => !autoEndActive && setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Seats (blank = auto)</label>
                <input type="number" className="form-input" value={form.seatsLeft} onChange={(e) => setForm((f) => ({ ...f, seatsLeft: e.target.value }))} placeholder="Auto from venue" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.slotStatus} onChange={(e) => setForm((f) => ({ ...f, slotStatus: e.target.value }))}>
                  {['AVAILABLE', 'HOUSEFULL', 'CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {!editId && (
              <div style={{ padding: '10px 14px', background: 'var(--green-dim)', borderRadius: '8px', border: '1px solid rgba(0,214,143,0.2)', fontSize: '13px', color: 'var(--green)', marginBottom: '16px' }}>
                💡 Creating a slot will auto-generate seat entries from the venue's seat layout
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary" style={{ flex: 2 }}>
                {saving ? 'Saving...' : editId ? 'Update Slot' : 'Create Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlotsPage;