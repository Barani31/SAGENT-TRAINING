import React, { useState, useEffect } from 'react';
import {
  getAllLocations, getSeatsByLocation, createSeat, updateSeat, deleteSeat,
  createLocation, updateLocation, deleteLocation, getSlotsByEvent, getAllSeatsForSlot,
  getEventsByOrganiser, syncSeatsForSlot,
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SEAT_TYPE_COLOR = { VIP: 'var(--gold)', PREMIUM: 'var(--blue)', REGULAR: 'var(--text-secondary)' };

const getSuggestedType = (rowLetter, allRows) => {
  if (!allRows || allRows.length === 0) return 'REGULAR';
  const sorted = [...allRows].sort();
  const total  = sorted.length;
  const idx    = sorted.indexOf(rowLetter.toUpperCase());
  if (idx === -1) return rowLetter.toUpperCase() > (sorted[total - 1] || 'A') ? 'VIP' : 'REGULAR';
  const pct = idx / (total - 1 || 1);
  if (pct >= 0.7) return 'VIP';
  if (pct >= 0.3) return 'PREMIUM';
  return 'REGULAR';
};

const AdminSeatsPage = () => {
  const { user } = useAuth();
  const [locations, setLocations]       = useState([]);
  const [seats, setSeats]               = useState([]);
  const [selectedLoc, setSelectedLoc]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [viewMode, setViewMode]         = useState('layout');
  const [allSlots, setAllSlots]         = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [seatSlots, setSeatSlots]       = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [syncing, setSyncing]           = useState(false);
  const [seatModal, setSeatModal]       = useState(false);
  const [editSeat, setEditSeat]         = useState(null);
  const [saving, setSaving]             = useState(false);
  const [seatForm, setSeatForm]         = useState({ seatNo: '', rowLetter: 'A', seatType: 'REGULAR', basePrice: '' });
  const [bulkModal, setBulkModal]       = useState(false);
  const [bulkForm, setBulkForm]         = useState({ rowLetter: 'A', count: '', seatType: 'REGULAR', basePrice: '' });
  const [bulkSaving, setBulkSaving]     = useState(false);
  // Venue modal — editLocId=null means create, otherwise it's the id being edited
  const [locModal, setLocModal]         = useState(false);
  const [editLocId, setEditLocId]       = useState(null);
  const [locForm, setLocForm]           = useState({ locName: '', address: '', totalSeats: '', facilities: '' });

  const loadLocations = async () => {
    try {
      const res  = await getAllLocations();
      const locs = Array.isArray(res.data?.data) ? res.data.data : [];
      setLocations(locs);
      if (locs.length > 0 && !selectedLoc) setSelectedLoc(locs[0]);
    } catch { toast.error('Failed to load venues'); }
    finally { setLoading(false); }
  };
  const loadSeats = async (locId) => {
    try { const res = await getSeatsByLocation(locId); setSeats(Array.isArray(res.data?.data) ? res.data.data : []); }
    catch { setSeats([]); }
  };
  const loadSlotsForVenue = async (locId) => {
    setSlotsLoading(true); setAllSlots([]); setSelectedSlot(null); setSeatSlots([]);
    try {
      const evRes  = await getEventsByOrganiser(user.userId);
      const events = evRes.data?.data || [];
      const slotRequests = await Promise.all(events.map((e) => getSlotsByEvent(e.eventId).catch(() => ({ data: { data: [] } }))));
      setAllSlots(slotRequests.flatMap((r) => r.data?.data || []).filter((s) => s.location?.locationId === locId).sort((a, b) => new Date(b.showDate) - new Date(a.showDate)));
    } catch { toast.error('Failed to load slots'); }
    finally { setSlotsLoading(false); }
  };
  const loadSeatSlots = async (slotId) => {
    setSeatsLoading(true);
    try { const res = await getAllSeatsForSlot(slotId); setSeatSlots(Array.isArray(res.data?.data) ? res.data.data : []); }
    catch { toast.error('Failed to load seat status'); setSeatSlots([]); }
    finally { setSeatsLoading(false); }
  };
  const handleSync = async () => {
    if (!selectedSlot) return; setSyncing(true);
    try { await syncSeatsForSlot(selectedSlot.slotId); toast.success('Seats synced!'); await loadSeatSlots(selectedSlot.slotId); }
    catch (err) { toast.error(err.response?.data?.message || 'Sync failed'); }
    finally { setSyncing(false); }
  };

  useEffect(() => { loadLocations(); }, []);
  useEffect(() => { if (selectedLoc) { loadSeats(selectedLoc.locationId); setViewMode('layout'); setSelectedSlot(null); setSeatSlots([]); setAllSlots([]); } }, [selectedLoc]);
  useEffect(() => { if (viewMode === 'bookings' && selectedLoc) loadSlotsForVenue(selectedLoc.locationId); }, [viewMode]);
  useEffect(() => { if (selectedSlot) loadSeatSlots(selectedSlot.slotId); }, [selectedSlot]);

  const allRowLetters = [...new Set(seats.map((s) => s.rowLetter))].sort();
  const openCreateSeat = () => { setSeatForm({ seatNo: '', rowLetter: 'A', seatType: getSuggestedType('A', allRowLetters), basePrice: '' }); setEditSeat(null); setSeatModal(true); };
  const openEditSeat   = (s) => { setSeatForm({ seatNo: s.seatNo || '', rowLetter: s.rowLetter || 'A', seatType: s.seatType || 'REGULAR', basePrice: s.basePrice || '' }); setEditSeat(s); setSeatModal(true); };
  const saveSeat = async () => {
    if (!seatForm.seatNo || !seatForm.basePrice) { toast.error('Seat number and price are required'); return; }
    setSaving(true);
    try {
      if (editSeat) { await updateSeat(editSeat.seatId, seatForm); toast.success('Seat updated'); }
      else          { await createSeat(selectedLoc.locationId, seatForm); toast.success('Seat added'); }
      setSeatModal(false); loadSeats(selectedLoc.locationId);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save seat'); }
    finally { setSaving(false); }
  };
  const delSeat = async (id) => {
    if (!window.confirm('Delete this seat?')) return;
    try { await deleteSeat(id); toast.success('Seat deleted'); loadSeats(selectedLoc.locationId); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const openBulkModal = () => { setBulkForm({ rowLetter: 'A', count: '', seatType: getSuggestedType('A', allRowLetters), basePrice: '' }); setBulkModal(true); };
  const saveBulkSeats = async () => {
    const row = bulkForm.rowLetter.toUpperCase(); const count = parseInt(bulkForm.count);
    if (!row || !count || count < 1 || count > 100) { toast.error('Enter a valid row and count (1–100)'); return; }
    if (!bulkForm.basePrice) { toast.error('Base price is required'); return; }
    const existingInRow = seats.filter((s) => s.rowLetter === row).map((s) => parseInt(s.seatNo) || 0);
    const startFrom = existingInRow.length > 0 ? Math.max(...existingInRow) + 1 : 1;
    setBulkSaving(true); let ok = 0; let fail = 0;
    for (let i = 0; i < count; i++) {
      try { await createSeat(selectedLoc.locationId, { seatNo: String(startFrom + i), rowLetter: row, seatType: bulkForm.seatType, basePrice: bulkForm.basePrice }); ok++; }
      catch { fail++; }
    }
    setBulkSaving(false); setBulkModal(false); loadSeats(selectedLoc.locationId);
    if (fail === 0) toast.success(`✅ ${ok} seats added to Row ${row} (${row}${startFrom}–${row}${startFrom + count - 1})`);
    else toast.error(`Added ${ok}, failed ${fail}`);
  };

  // ── Venue CRUD ─────────────────────────────────────────────────────────
  const openCreateVenue = () => { setEditLocId(null); setLocForm({ locName: '', address: '', totalSeats: '', facilities: '' }); setLocModal(true); };
  const openEditVenue   = (loc, e) => { e?.stopPropagation(); setEditLocId(loc.locationId); setLocForm({ locName: loc.locName || '', address: loc.address || '', totalSeats: loc.totalSeats || '', facilities: loc.facilities || '' }); setLocModal(true); };
  const closeLocModal   = () => { setLocModal(false); setEditLocId(null); };

  const saveLocation = async () => {
    if (!locForm.locName || !locForm.address) { toast.error('Venue name and address required'); return; }
    setSaving(true);
    try {
      const data = { ...locForm, totalSeats: parseInt(locForm.totalSeats) || 0 };
      if (editLocId) {
        await updateLocation(editLocId, data);
        toast.success('Venue updated');
        if (selectedLoc?.locationId === editLocId) setSelectedLoc((prev) => ({ ...prev, ...data }));
      } else {
        await createLocation(data);
        toast.success('Venue created');
      }
      closeLocModal(); loadLocations();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };
  const delLocation = async (id) => {
    if (!window.confirm('Delete this venue and all its seats?')) return;
    try { await deleteLocation(id); toast.success('Venue deleted'); setSelectedLoc(null); loadLocations(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rows = {}; seats.forEach((s) => { const r = s.rowLetter || 'A'; if (!rows[r]) rows[r] = []; rows[r].push(s); });
  const rowLetters     = Object.keys(rows).sort();
  const bookedCount    = seatSlots.filter((ss) => ss.availability === 'BOOKED').length;
  const availableCount = seatSlots.filter((ss) => ss.availability === 'AVAILABLE').length;
  const totalCount     = seatSlots.length;
  const slotStatusClass = { AVAILABLE: 'badge-success', HOUSEFULL: 'badge-warning', CANCELLED: 'badge-danger' };

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: '28px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div><h1 className="page-title">SEAT MANAGEMENT</h1><p className="page-subtitle">Manage venues, seat layouts and booking status</p></div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={openCreateVenue} className="btn btn-secondary">➕ Add Venue</button>
          {selectedLoc && viewMode === 'layout' && (<>
            <button onClick={openBulkModal} className="btn btn-secondary">📋 Bulk Add Seats</button>
            <button onClick={openCreateSeat} className="btn btn-primary">💺 Add Single Seat</button>
          </>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Venues</div>
          {loading ? <div className="loading-center" style={{ padding: '20px' }}><div className="spinner" /></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {locations.map((l) => (
                <div key={l.locationId} onClick={() => setSelectedLoc(l)} className="card"
                  style={{ padding: '12px 14px', cursor: 'pointer', transition: 'var(--transition)', borderColor: selectedLoc?.locationId === l.locationId ? 'var(--accent)' : 'var(--border)', background: selectedLoc?.locationId === l.locationId ? 'var(--accent-dim)' : 'var(--bg-card)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: selectedLoc?.locationId === l.locationId ? 'var(--accent)' : 'var(--text-primary)' }}>{l.locName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{l.address}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Capacity: {l.totalSeats}</div>
                  <button onClick={(e) => openEditVenue(l, e)} className="btn btn-secondary btn-sm" style={{ marginTop: '8px', width: '100%', fontSize: '11px' }}>✏️ Edit Venue</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main */}
        <div>
          {!selectedLoc ? <div className="empty-state"><div className="empty-state-icon">📍</div><h3>Select a Venue</h3></div> : (
            <>
              {/* Venue info bar */}
              <div className="card" style={{ padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{selectedLoc.locName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>📍 {selectedLoc.address} &nbsp;·&nbsp; {seats.length} seats configured</div>
                  {selectedLoc.facilities && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>✨ {selectedLoc.facilities}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={(e) => openEditVenue(selectedLoc, e)} className="btn btn-secondary btn-sm">✏️ Edit Venue</button>
                  <button onClick={() => delLocation(selectedLoc.locationId)} className="btn btn-danger btn-sm">Delete Venue</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['layout', 'bookings'].map((mode) => (
                  <button key={mode} onClick={() => setViewMode(mode)} className="btn"
                    style={{ background: viewMode === mode ? 'var(--accent)' : 'var(--bg-card)', color: viewMode === mode ? '#fff' : 'var(--text-secondary)', border: '1.5px solid', borderColor: viewMode === mode ? 'var(--accent)' : 'var(--border)', boxShadow: viewMode === mode ? 'var(--shadow-accent)' : 'var(--shadow-sm)' }}>
                    {mode === 'layout' ? '💺 Seat Layout' : '📊 Booking Status'}
                  </button>
                ))}
              </div>

              {viewMode === 'layout' && (
                <>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {Object.entries(SEAT_TYPE_COLOR).map(([type, color]) => (
                      <span key={type} style={{ fontSize: '12px', color, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <span style={{ width: 14, height: 14, background: `${color}22`, border: `2px solid ${color}`, borderRadius: '3px', display: 'inline-block' }} />{type}
                      </span>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      Front rows = REGULAR &nbsp;·&nbsp; Middle = PREMIUM &nbsp;·&nbsp; Back rows = VIP
                    </span>
                  </div>
                  {seats.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">💺</div><h3>No Seats Added</h3>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button onClick={openBulkModal} className="btn btn-secondary">📋 Bulk Add</button>
                        <button onClick={openCreateSeat} className="btn btn-primary">💺 Add Single</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="card" style={{ padding: '24px', marginBottom: '20px', overflowX: 'auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px', padding: '9px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '7px', textTransform: 'uppercase', fontWeight: 600 }}>── SCREEN ──</div>
                        {rowLetters.map((row) => (
                          <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <span style={{ width: '20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', flexShrink: 0, fontWeight: 600 }}>{row}</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {rows[row].sort((a, b) => (parseInt(a.seatNo) || 0) - (parseInt(b.seatNo) || 0)).map((s) => {
                                const c = SEAT_TYPE_COLOR[s.seatType] || 'var(--text-secondary)';
                                return (
                                  <button key={s.seatId} title={`${s.rowLetter}${s.seatNo} | ${s.seatType} | ₹${s.basePrice}`} onClick={() => openEditSeat(s)}
                                    style={{ width: '34px', height: '30px', borderRadius: '5px 5px 2px 2px', border: `2px solid ${c}`, background: `${c}15`, color: c, fontSize: '10px', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = `${c}35`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = `${c}15`; e.currentTarget.style.transform = ''; }}
                                  >{s.seatNo}</button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead><tr><th>Seat</th><th>Row</th><th>Type</th><th>Base Price</th><th>Actions</th></tr></thead>
                          <tbody>
                            {[...seats].sort((a, b) => (a.rowLetter + String(a.seatNo).padStart(3, '0')).localeCompare(b.rowLetter + String(b.seatNo).padStart(3, '0'))).map((s) => (
                              <tr key={s.seatId}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.rowLetter}{s.seatNo}</td>
                                <td>{s.rowLetter}</td>
                                <td><span style={{ color: SEAT_TYPE_COLOR[s.seatType], fontSize: '12px', fontWeight: 600 }}>{s.seatType}</span></td>
                                <td>₹{parseFloat(s.basePrice).toFixed(2)}</td>
                                <td><div style={{ display: 'flex', gap: '6px' }}>
                                  <button onClick={() => openEditSeat(s)} className="btn btn-secondary btn-sm">Edit</button>
                                  <button onClick={() => delSeat(s.seatId)} className="btn btn-danger btn-sm">Del</button>
                                </div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              )}

              {viewMode === 'bookings' && (
                <>
                  {slotsLoading ? <div className="loading-center"><div className="spinner" /><span>Loading shows...</span></div>
                  : allSlots.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📅</div><h3>No Shows at this Venue</h3><p style={{ fontSize: '13px' }}>Create a show slot for this venue first</p></div>
                  : (
                    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Select Show</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {allSlots.map((slot) => (
                            <div key={slot.slotId} onClick={() => setSelectedSlot(slot)} className="card"
                              style={{ padding: '12px 14px', cursor: 'pointer', transition: 'var(--transition)', borderColor: selectedSlot?.slotId === slot.slotId ? 'var(--accent)' : 'var(--border)', background: selectedSlot?.slotId === slot.slotId ? 'var(--accent-dim)' : 'var(--bg-card)' }}>
                              <div style={{ fontWeight: 700, fontSize: '13px', color: selectedSlot?.slotId === slot.slotId ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '3px' }}>{slot.event?.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>📅 {slot.showDate}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>⏰ {slot.startTime?.slice(0,5)} – {slot.endTime?.slice(0,5)}</div>
                              <div style={{ marginTop: '6px' }}><span className={`badge ${slotStatusClass[slot.slotStatus] || 'badge-muted'}`} style={{ fontSize: '10px' }}>{slot.slotStatus}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        {!selectedSlot ? <div className="empty-state"><div className="empty-state-icon">🎭</div><h3>Select a Show</h3><p style={{ fontSize: '13px' }}>Pick a show to see seat status</p></div>
                        : seatsLoading ? <div className="loading-center"><div className="spinner" /></div>
                        : (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', flex: 1 }}>
                                <StatBox label="Total" value={totalCount} color="var(--text-primary)" />
                                <StatBox label="Booked" value={bookedCount} color="var(--red)" />
                                <StatBox label="Available" value={availableCount} color="var(--green)" />
                              </div>
                              <button onClick={handleSync} disabled={syncing} className="btn btn-secondary" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                                {syncing ? '⏳ Syncing...' : '🔄 Sync New Seats'}
                              </button>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                              <span style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ width: 20, height: 18, background: 'rgba(185,28,28,0.08)', border: '2px solid var(--red)', borderRadius: '4px 4px 2px 2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 900 }}>✕</span>Booked
                              </span>
                              <span style={{ width: '1px', height: '16px', background: 'var(--border)', display: 'inline-block' }} />
                              {Object.entries(SEAT_TYPE_COLOR).map(([type, color]) => (
                                <span key={type} style={{ fontSize: '12px', color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ width: 8, height: 8, background: color, borderRadius: '50%', display: 'inline-block' }} />{type}
                                </span>
                              ))}
                            </div>
                            <div className="card" style={{ padding: '24px' }}>
                              <div style={{ textAlign: 'center', marginBottom: '16px', padding: '9px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '7px', textTransform: 'uppercase', fontWeight: 600 }}>── SCREEN ──</div>
                              {seatSlots.length === 0 ? <div className="empty-state" style={{ padding: '24px' }}><p style={{ fontSize: '13px' }}>No seat data for this slot</p></div> : (() => {
                                const slotRows = {};
                                seatSlots.forEach((ss) => { const r = ss.seat?.rowLetter || 'A'; if (!slotRows[r]) slotRows[r] = []; slotRows[r].push(ss); });
                                return Object.keys(slotRows).sort().map((row) => (
                                  <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                    <span style={{ width: '20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', flexShrink: 0, fontWeight: 600 }}>{row}</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                      {slotRows[row].sort((a,b)=>(parseInt(a.seat?.seatNo)||0)-(parseInt(b.seat?.seatNo)||0)).map((ss) => {
                                        const isBooked = ss.availability === 'BOOKED'; const isLocked = ss.availability === 'LOCKED';
                                        const typeColor = SEAT_TYPE_COLOR[ss.seat?.seatType] || 'var(--text-secondary)';
                                        let bg, border, textColor;
                                        if (isBooked)      { bg='rgba(185,28,28,0.1)';  border='var(--red)';  textColor='var(--red)'; }
                                        else if (isLocked) { bg='rgba(201,125,26,0.1)'; border='var(--gold)'; textColor='var(--gold)'; }
                                        else               { bg=`${typeColor}15`;        border=typeColor;     textColor=typeColor; }
                                        return (
                                          <div key={ss.seatSlotId} style={{ position:'relative', flexShrink:0 }}>
                                            <button disabled title={`${ss.seat?.rowLetter}${ss.seat?.seatNo} | ${ss.seat?.seatType} | ₹${ss.price} | ${ss.availability}`}
                                              style={{ width:'34px', height:'30px', borderRadius:'5px 5px 2px 2px', border:`2px solid ${border}`, background:bg, color:textColor, fontSize:'10px', fontWeight:700, cursor:'not-allowed', fontFamily:'var(--font-mono)', position:'relative' }}>
                                              {ss.seat?.seatNo}
                                              {isBooked && <span style={{ position:'absolute', top:'1px', right:'2px', fontSize:'7px', color:'var(--red)', fontWeight:900, lineHeight:1 }}>✕</span>}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                            {bookedCount > 0 && (
                              <div style={{ marginTop: '20px' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '12px' }}>Booked Seats ({bookedCount})</h3>
                                <div className="table-wrap">
                                  <table>
                                    <thead><tr><th>Seat</th><th>Type</th><th>Price</th><th>Status</th></tr></thead>
                                    <tbody>
                                      {seatSlots.filter((ss)=>ss.availability==='BOOKED').sort((a,b)=>(a.seat?.rowLetter+String(a.seat?.seatNo).padStart(3,'0')).localeCompare(b.seat?.rowLetter+String(b.seat?.seatNo).padStart(3,'0'))).map((ss) => (
                                        <tr key={ss.seatSlotId}>
                                          <td style={{ fontFamily:'var(--font-mono)', fontWeight:700 }}>{ss.seat?.rowLetter}{ss.seat?.seatNo}</td>
                                          <td><span style={{ color:SEAT_TYPE_COLOR[ss.seat?.seatType], fontWeight:600, fontSize:'12px' }}>{ss.seat?.seatType}</span></td>
                                          <td>₹{parseFloat(ss.price||0).toFixed(2)}</td>
                                          <td><span className="badge badge-danger">BOOKED</span></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Single Seat Modal */}
      {seatModal && (
        <div className="modal-overlay" onClick={() => setSeatModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">{editSeat ? 'EDIT SEAT' : 'ADD SINGLE SEAT'}</h3><button className="modal-close" onClick={() => setSeatModal(false)}>✕</button></div>
            <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
              🎭 <strong>Seating order:</strong> Front rows (A, B) → REGULAR &nbsp;·&nbsp; Middle → PREMIUM &nbsp;·&nbsp; Back rows → VIP
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group"><label className="form-label">Seat Number *</label><input className="form-input" value={seatForm.seatNo} onChange={(e) => setSeatForm((f) => ({ ...f, seatNo: e.target.value }))} placeholder="1, 2, 3..." /></div>
              <div className="form-group"><label className="form-label">Row Letter *</label><input className="form-input" maxLength={1} value={seatForm.rowLetter} onChange={(e) => { const r = e.target.value.toUpperCase().charAt(0) || 'A'; setSeatForm((f) => ({ ...f, rowLetter: r, seatType: getSuggestedType(r, allRowLetters) })); }} placeholder="A = front, Z = back" /></div>
              <div className="form-group"><label className="form-label">Seat Type</label><select className="form-input" value={seatForm.seatType} onChange={(e) => setSeatForm((f) => ({ ...f, seatType: e.target.value }))}><option value="REGULAR">REGULAR — Front rows</option><option value="PREMIUM">PREMIUM — Middle rows</option><option value="VIP">VIP — Back rows</option></select></div>
              <div className="form-group"><label className="form-label">Base Price (₹) *</label><input type="number" className="form-input" value={seatForm.basePrice} onChange={(e) => setSeatForm((f) => ({ ...f, basePrice: e.target.value }))} placeholder="150" /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setSeatModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={saveSeat} disabled={saving} className="btn btn-primary" style={{ flex: 2 }}>{saving ? 'Saving...' : editSeat ? 'Update Seat' : 'Add Seat'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Seat Modal */}
      {bulkModal && (
        <div className="modal-overlay" onClick={() => setBulkModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">BULK ADD SEATS</h3><button className="modal-close" onClick={() => setBulkModal(false)}>✕</button></div>
            <div style={{ padding: '12px 14px', background: 'var(--blue-dim)', borderRadius: '8px', border: '1px solid rgba(37,99,168,0.2)', marginBottom: '20px', fontSize: '13px', color: 'var(--blue)' }}>
              <strong>📋 How bulk add works:</strong>
              <ul style={{ marginTop: '6px', paddingLeft: '18px', lineHeight: 1.8, fontSize: '12px' }}>
                <li>Seats are added starting after the last existing seat in that row</li>
                <li>e.g. Row A already has A1–A10 → adding 5 will create A11–A15</li>
                <li>All seats get the same type and price (you can edit individually later)</li>
              </ul>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Row Letter *</label>
                <input className="form-input" maxLength={1} value={bulkForm.rowLetter} onChange={(e) => { const r = e.target.value.toUpperCase().charAt(0) || 'A'; setBulkForm((f) => ({ ...f, rowLetter: r, seatType: getSuggestedType(r, allRowLetters) })); }} placeholder="A, B, C..." />
                {bulkForm.rowLetter && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Row {bulkForm.rowLetter.toUpperCase()} currently has <strong>{seats.filter((s) => s.rowLetter === bulkForm.rowLetter.toUpperCase()).length}</strong> seats</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Number of Seats to Add *</label>
                <input type="number" className="form-input" min={1} max={100} value={bulkForm.count} onChange={(e) => setBulkForm((f) => ({ ...f, count: e.target.value }))} placeholder="e.g. 10" />
                {bulkForm.count && bulkForm.rowLetter && (() => { const row = bulkForm.rowLetter.toUpperCase(); const existing = seats.filter((s) => s.rowLetter === row).map((s) => parseInt(s.seatNo) || 0); const start = existing.length > 0 ? Math.max(...existing) + 1 : 1; const end = start + parseInt(bulkForm.count) - 1; return <span style={{ fontSize: '11px', color: 'var(--green)', marginTop: '4px', fontWeight: 600 }}>Will create: {row}{start} – {row}{end}</span>; })()}
              </div>
              <div className="form-group"><label className="form-label">Seat Type</label><select className="form-input" value={bulkForm.seatType} onChange={(e) => setBulkForm((f) => ({ ...f, seatType: e.target.value }))}><option value="REGULAR">REGULAR — Front rows</option><option value="PREMIUM">PREMIUM — Middle rows</option><option value="VIP">VIP — Back rows</option></select></div>
              <div className="form-group"><label className="form-label">Base Price (₹) *</label><input type="number" className="form-input" value={bulkForm.basePrice} onChange={(e) => setBulkForm((f) => ({ ...f, basePrice: e.target.value }))} placeholder="150" /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setBulkModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={saveBulkSeats} disabled={bulkSaving} className="btn btn-primary" style={{ flex: 2 }}>{bulkSaving ? `Adding seats... (${bulkForm.count})` : `Add ${bulkForm.count || '?'} Seats to Row ${bulkForm.rowLetter?.toUpperCase() || '?'}`}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Venue Modal — ADD + EDIT ── */}
      {locModal && (
        <div className="modal-overlay" onClick={closeLocModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editLocId ? 'EDIT VENUE' : 'ADD VENUE'}</h3>
              <button className="modal-close" onClick={closeLocModal}>✕</button>
            </div>
            <div className="form-group"><label className="form-label">Venue Name *</label><input className="form-input" value={locForm.locName} onChange={(e) => setLocForm((f) => ({ ...f, locName: e.target.value }))} placeholder="PVR Cinemas, Chennai" /></div>
            <div className="form-group"><label className="form-label">Address *</label><input className="form-input" value={locForm.address} onChange={(e) => setLocForm((f) => ({ ...f, address: e.target.value }))} placeholder="Full address" /></div>
            <div className="form-group"><label className="form-label">Total Seating Capacity</label><input type="number" className="form-input" value={locForm.totalSeats} onChange={(e) => setLocForm((f) => ({ ...f, totalSeats: e.target.value }))} placeholder="200" /></div>
            <div className="form-group"><label className="form-label">Facilities</label><input className="form-input" value={locForm.facilities} onChange={(e) => setLocForm((f) => ({ ...f, facilities: e.target.value }))} placeholder="Parking, AC, Dolby..." /></div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={closeLocModal} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={saveLocation} disabled={saving} className="btn btn-primary" style={{ flex: 2 }}>{saving ? 'Saving...' : editLocId ? 'Update Venue' : 'Create Venue'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, color }) => (
  <div className="card" style={{ padding: '16px', textAlign: 'center', borderTop: `3px solid ${color}` }}>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color }}>{value}</div>
    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '4px' }}>{label}</div>
  </div>
);

export default AdminSeatsPage;