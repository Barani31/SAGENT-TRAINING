import React, { useState, useEffect } from 'react';
import { getEventsByOrganiser, createEvent, updateEvent, deleteEvent, getAllLocations, createSlot } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', type: 'MOVIE', genres: [], languages: [], venues: [],
  duration: '', categoryName: '', status: 'ACTIVE',
};

const TYPES         = ['MOVIE', 'CONCERT', 'EVENT'];
const ALL_GENRES    = ['Action','Drama','Comedy','Romance','Horror','Thriller','Pop','Rock','Classical','Festival','Sports','Cultural','Other'];
const ALL_LANGUAGES = ['English','Tamil','Hindi','Telugu','Malayalam','Kannada','French','Japanese'];
const TYPE_COLOR    = { MOVIE: 'var(--blue)', CONCERT: 'var(--gold)', EVENT: 'var(--green)' };
const STATUS_STYLE  = {
  ACTIVE:    { bg: '#e8fff5', color: '#1a8f63', border: '#b2e8d0' },
  CANCELLED: { bg: '#fdecea', color: '#b91c1c', border: '#fca5a5' },
  COMPLETED: { bg: '#eff6ff', color: '#2563a8', border: '#bfdbfe' },
};

const parseList = (str) => (!str ? [] : str.split(',').map((s) => s.trim()).filter(Boolean));

// ── Duration helpers ──────────────────────────────────────────────────────────
// Parses "2h 45min", "3h 0min", "90min", "2h" → total minutes
const parseDurationToMinutes = (durationStr) => {
  if (!durationStr) return 0;
  const hourMatch = durationStr.match(/(\d+)\s*h/);
  const minMatch  = durationStr.match(/(\d+)\s*min/);
  const hours   = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minMatch  ? parseInt(minMatch[1])  : 0;
  return hours * 60 + minutes;
};

// Adds minutes to "HH:MM" time string → returns new "HH:MM"
const addMinutesToTime = (timeStr, minutes) => {
  if (!timeStr || !minutes) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const total  = h * 60 + m + minutes;
  const newH   = Math.floor(total / 60) % 24;
  const newM   = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

// ── Tag picker ────────────────────────────────────────────────────────────────
const TagPicker = ({ label, options, selected, onChange }) => (
  <div className="form-group">
    <label className="form-label">
      {label} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '11px' }}>(select one or more)</span>
    </label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button"
            onClick={() => onChange(active ? selected.filter((x) => x !== opt) : [...selected, opt])}
            style={{
              padding: '5px 13px', borderRadius: '20px', border: '1.5px solid',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              borderColor: active ? 'var(--accent)' : 'var(--border)',
              background:  active ? 'var(--accent-dim)' : 'var(--bg-secondary)',
              color:       active ? 'var(--accent)' : 'var(--text-secondary)',
            }}>
            {active && '✓ '}{opt}
          </button>
        );
      })}
    </div>
    {selected.length > 0 && (
      <div style={{ marginTop: '7px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Selected: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{selected.join(', ')}</span>
      </div>
    )}
  </div>
);

// ── Global venue picker ───────────────────────────────────────────────────────
const VenuePicker = ({ locations, selected, onChange }) => (
  <div className="form-group" style={{ gridColumn: '1/-1' }}>
    <label className="form-label">
      Venue / Address <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '11px' }}>(select venues for this event)</span>
    </label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
      {locations.map((l) => {
        const active = selected.includes(l.locationId);
        return (
          <button key={l.locationId} type="button"
            onClick={() => onChange(active ? selected.filter((x) => x !== l.locationId) : [...selected, l.locationId])}
            style={{
              padding: '6px 14px', borderRadius: '10px', border: '1.5px solid',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              borderColor: active ? 'var(--accent)' : 'var(--border)',
              background:  active ? 'var(--accent-dim)' : 'var(--bg-secondary)',
              color:       active ? 'var(--accent)' : 'var(--text-secondary)',
            }}>
            {active && '✓ '}📍 {l.locName}{l.address ? ` — ${l.address}` : ''}
          </button>
        );
      })}
    </div>
    {selected.length > 0 && (
      <div style={{ marginTop: '7px', fontSize: '12px', color: 'var(--text-muted)' }}>
        {selected.length} venue{selected.length > 1 ? 's' : ''} selected
      </div>
    )}
  </div>
);

// ── Per-row venue mini-picker ─────────────────────────────────────────────────
const RowVenuePicker = ({ locations, selectedVenueIds, rowVenues, onChange }) => {
  const available = locations.filter((l) => selectedVenueIds.includes(l.locationId));
  if (available.length === 0) return (
    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
      ← Select venues above first
    </div>
  );
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
      {available.map((l) => {
        const active = rowVenues.includes(l.locationId);
        return (
          <button key={l.locationId} type="button"
            onClick={() => onChange(active ? rowVenues.filter((x) => x !== l.locationId) : [...rowVenues, l.locationId])}
            style={{
              padding: '3px 10px', borderRadius: '20px', border: '1.5px solid',
              fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              borderColor: active ? 'var(--accent)' : 'var(--border)',
              background:  active ? 'var(--accent-dim)' : 'var(--bg-primary)',
              color:       active ? 'var(--accent)' : 'var(--text-secondary)',
            }}>
            {active ? '✓ ' : ''}📍 {l.locName}
          </button>
        );
      })}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminEventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents]       = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [slotRows, setSlotRows]   = useState([{ showDate: '', startTime: '', endTime: '', venueIds: [] }]);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);

  const load = async () => {
    try {
      const [evRes, locRes] = await Promise.all([
        getEventsByOrganiser(user.userId),
        getAllLocations(),
      ]);
      setEvents(Array.isArray(evRes.data?.data) ? evRes.data.data : []);
      setLocations(Array.isArray(locRes.data?.data) ? locRes.data.data : []);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSlotRows([{ showDate: '', startTime: '', endTime: '', venueIds: [] }]);
    setEditId(null);
    setModal(true);
  };

  const openEdit = (e) => {
    const venueIds = parseList(e.summary).map((name) => {
      const found = locations.find((l) => l.locName === name);
      return found ? found.locationId : null;
    }).filter(Boolean);

    setForm({
      name:         e.name         || '',
      type:         e.type         || 'MOVIE',
      genres:       parseList(e.genre),
      languages:    parseList(e.language),
      venues:       venueIds,
      duration:     e.duration     || '',
      categoryName: e.categoryName || '',
      status:       e.status       || 'ACTIVE',
    });
    setEditId(e.eventId);
    setModal(true);
  };

  const handle = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addSlotRow = () =>
    setSlotRows((prev) => [...prev, { showDate: '', startTime: '', endTime: '', venueIds: [] }]);

  const removeSlotRow = (i) =>
    setSlotRows((prev) => prev.filter((_, idx) => idx !== i));

  const updateSlotRow = (i, key, val) =>
    setSlotRows((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  // When start time changes, auto-calculate end time from duration
  const handleStartTimeChange = (i, newStartTime) => {
    const durationMins = parseDurationToMinutes(form.duration);
    const autoEnd = durationMins > 0 ? addMinutesToTime(newStartTime, durationMins) : '';
    setSlotRows((prev) => prev.map((s, idx) =>
      idx === i ? { ...s, startTime: newStartTime, endTime: autoEnd || s.endTime } : s
    ));
  };

  const handleVenueChange = (newVenues) => {
    handle('venues', newVenues);
    setSlotRows((prev) => prev.map((row) => ({
      ...row,
      venueIds: row.venueIds.filter((v) => newVenues.includes(v)),
    })));
  };

  const totalSlotsToCreate = slotRows.reduce((sum, row) => {
    if (!row.showDate || !row.startTime) return sum;
    return sum + (row.venueIds.length > 0 ? row.venueIds.length : form.venues.length);
  }, 0);

  const durationMins = parseDurationToMinutes(form.duration);

  const save = async () => {
    if (!form.name.trim()) { toast.error('Event name is required'); return; }

    const venueNames = form.venues.map((id) => {
      const loc = locations.find((l) => l.locationId === id);
      return loc ? loc.locName : '';
    }).filter(Boolean);

    setSaving(true);
    try {
      const payload = {
        name:         form.name,
        type:         form.type,
        status:       form.status,
        duration:     form.duration,
        categoryName: form.categoryName,
        genre:        form.genres.join(','),
        language:     form.languages.join(','),
        summary:      venueNames.join(','),
        organiserId:  user.userId,
      };

      if (editId) {
        await updateEvent(editId, payload);
        toast.success('Event updated!');
      } else {
        const res = await createEvent(payload);
        const savedEventId = res.data?.data?.eventId;
        toast.success('Event created!');

        const filledRows = slotRows.filter((r) => r.showDate && r.startTime);
        if (filledRows.length > 0 && form.venues.length > 0 && savedEventId) {
          const promises = [];
          for (const row of filledRows) {
            const venueIds = row.venueIds.length > 0 ? row.venueIds : form.venues;
            for (const venueId of venueIds) {
              promises.push(createSlot({
                eventId:    savedEventId,
                locationId: venueId,
                showDate:   row.showDate,
                startTime:  row.startTime,
                endTime:    row.endTime || null,
                slotStatus: 'AVAILABLE',
              }));
            }
          }
          await Promise.allSettled(promises);
          toast.success(`${promises.length} slot${promises.length > 1 ? 's' : ''} created automatically!`);
        }
      }

      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await deleteEvent(id); toast.success('Event deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
<div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: '28px' }}>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">MY EVENTS</h1>
          <p className="page-subtitle">{events.length} events managed</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">➕ Create Event</button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎭</div>
          <h3>No Events Yet</h3>
          <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: '16px' }}>Create Event</button>
        </div>
      ) : (
        <div className="grid-3">
          {events.map((e) => {
            const genres    = parseList(e.genre);
            const languages = parseList(e.language);
            const venues    = parseList(e.summary);
            const ss        = STATUS_STYLE[e.status] || STATUS_STYLE.ACTIVE;

            return (
              <div key={e.eventId} className="card" style={{ padding: '20px', borderTop: `3px solid ${TYPE_COLOR[e.type] || 'var(--accent)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                    {e.status}
                  </span>
                  <span style={{ fontSize: '12px', color: TYPE_COLOR[e.type], fontWeight: 600 }}>{e.type}</span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '8px' }}>{e.name}</h3>

                {genres.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                    {genres.map((g) => (
                      <span key={g} style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{g}</span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  🌐 {languages.join(', ') || '—'} &nbsp;·&nbsp; ⏱ {e.duration || '—'}
                </div>

                {venues.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {venues.map((v) => (
                      <span key={v} style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>📍 {v}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => openEdit(e)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Edit</button>
                  <button onClick={() => del(e.eventId)} className="btn btn-danger btn-sm" style={{ flex: 1 }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: '660px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'EDIT EVENT' : 'CREATE EVENT'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Event Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => handle('name', e.target.value)} placeholder="e.g. AR Rahman Live" />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={(e) => handle('type', e.target.value)}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={(e) => handle('status', e.target.value)}>
                  {['ACTIVE', 'COMPLETED', 'CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input className="form-input" value={form.duration}
                  onChange={(e) => {
                    handle('duration', e.target.value);
                    // Re-calculate all end times when duration changes
                    const mins = parseDurationToMinutes(e.target.value);
                    if (mins > 0) {
                      setSlotRows((prev) => prev.map((row) => ({
                        ...row,
                        endTime: row.startTime ? addMinutesToTime(row.startTime, mins) : row.endTime,
                      })));
                    }
                  }}
                  placeholder="2h 30min"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" value={form.categoryName} onChange={(e) => handle('categoryName', e.target.value)} placeholder="e.g. Blockbuster" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <TagPicker label="Language" options={ALL_LANGUAGES} selected={form.languages} onChange={(v) => handle('languages', v)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <TagPicker label="Genre" options={ALL_GENRES} selected={form.genres} onChange={(v) => handle('genres', v)} />
              </div>
              <VenuePicker locations={locations} selected={form.venues} onChange={handleVenueChange} />
            </div>

            {/* ── Slot rows — CREATE only ── */}
            {!editId && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Show Dates & Times
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '11px', marginLeft: '6px' }}>
                      (pick venues per row, or leave blank for all)
                    </span>
                  </label>
                  <button type="button" onClick={addSlotRow} className="btn btn-secondary btn-sm">+ Add Row</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {slotRows.map((row, i) => {
                    const rowVenueCount = row.venueIds.length > 0 ? row.venueIds.length : form.venues.length;
                    const willCreate    = row.showDate && row.startTime ? rowVenueCount : 0;
                    const autoEndActive = durationMins > 0 && !!row.startTime;

                    return (
                      <div key={i} style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Date *</label>
                            <input type="date" className="form-input" value={row.showDate}
                              onChange={(e) => updateSlotRow(i, 'showDate', e.target.value)} />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Start Time *</label>
                            {/* ── On change: auto-calc end time from duration ── */}
                            <input type="time" className="form-input" value={row.startTime}
                              onChange={(e) => handleStartTimeChange(i, e.target.value)} />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>
                              End Time
                              {autoEndActive && (
                                <span style={{ marginLeft: '5px', fontSize: '10px', color: 'var(--accent)', fontWeight: 700 }}>
                                  ✓ auto
                                </span>
                              )}
                            </label>
                            {/* Read-only when auto-calculated, editable if no duration set */}
                            <input type="time" className="form-input" value={row.endTime}
                              readOnly={autoEndActive}
                              style={{
                                opacity: autoEndActive ? 0.75 : 1,
                                cursor:  autoEndActive ? 'not-allowed' : 'auto',
                                background: autoEndActive ? 'var(--bg-secondary)' : '',
                              }}
                              onChange={(e) => !autoEndActive && updateSlotRow(i, 'endTime', e.target.value)}
                            />
                          </div>

                          <button type="button" onClick={() => removeSlotRow(i)}
                            disabled={slotRows.length === 1}
                            className="btn btn-danger btn-sm"
                            style={{ opacity: slotRows.length === 1 ? 0.3 : 1 }}>✕</button>
                        </div>

                        {/* Per-row venue selector */}
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                            SHOW AT WHICH VENUE{form.venues.length > 1 ? 'S' : ''}?
                            <span style={{ fontWeight: 400, marginLeft: '6px' }}>
                              {row.venueIds.length === 0 ? '(all selected venues)' : ''}
                            </span>
                          </div>
                          <RowVenuePicker
                            locations={locations}
                            selectedVenueIds={form.venues}
                            rowVenues={row.venueIds}
                            onChange={(v) => updateSlotRow(i, 'venueIds', v)}
                          />
                          {willCreate > 0 && (
                            <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>
                              → Will create {willCreate} slot{willCreate > 1 ? 's' : ''} for this time
                              {row.venueIds.length > 0
                                ? ` (${row.venueIds.map((id) => locations.find((l) => l.locationId === id)?.locName).filter(Boolean).join(', ')})`
                                : form.venues.length > 1 ? ' (all venues)' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalSlotsToCreate > 0 && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'var(--green-dim)', border: '1px solid rgba(0,214,143,0.2)', fontSize: '12px', color: 'var(--green)' }}>
                    💡 Total: <strong>{totalSlotsToCreate}</strong> slot{totalSlotsToCreate > 1 ? 's' : ''} will be created across all rows
                  </div>
                )}
              </div>
            )}

            {/* Edit mode hint */}
            {editId && (
              <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
                💡 To edit show dates & times, go to the <strong>Slots</strong> page.
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary" style={{ flex: 2 }}>
                {saving ? 'Saving...' : editId ? 'Update Event →' : 'Create Event & Slots →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;