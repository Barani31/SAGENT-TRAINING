import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterEvents, getAllLocations } from '../../api/api';
import toast from 'react-hot-toast';

const TYPES    = ['ALL','MOVIE','CONCERT','EVENT'];
const GENRES   = ['ALL','Action','Drama','Comedy','Romance','Horror','Thriller','Pop','Rock','Classical','Festival','Sports','Cultural','Music','Other'];
const LANGS    = ['ALL','English','Tamil','Hindi','Telugu','Malayalam','Kannada'];
const STATUSES = ['ALL','ACTIVE','COMPLETED','CANCELLED'];

const PRICE_RANGES = [
  { label: 'Any Price',       min: null,  max: null  },
  { label: 'Under ₹200',     min: 0,     max: 200   },
  { label: '₹200 – ₹500',   min: 200,   max: 500   },
  { label: '₹500 – ₹1000',  min: 500,   max: 1000  },
  { label: '₹1000 – ₹2000', min: 1000,  max: 2000  },
  { label: 'Above ₹2000',   min: 2000,  max: null  },
];

const TYPE_ICON  = { MOVIE: '🎬', CONCERT: '🎵', EVENT: '🎪' };
const TYPE_COLOR = { MOVIE: '#2563a8', CONCERT: '#c97d1a', EVENT: '#1a8f63' };

/* ── Reusable FilterDropdown ─────────────────────────────────────────────── */
const FilterDropdown = ({ icon, label, activeLabel, children, hasValue }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 16px', borderRadius: '10px', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
          border: `1.5px solid ${hasValue ? 'var(--accent)' : 'var(--border)'}`,
          background: hasValue ? 'var(--accent-dim)' : 'white',
          color: hasValue ? 'var(--accent)' : 'var(--text-secondary)',
          transition: 'var(--transition)', whiteSpace: 'nowrap',
          boxShadow: open ? 'var(--shadow)' : 'none',
        }}
      >
        <span>{icon}</span>
        <span>{activeLabel || label}</span>
        <span style={{ fontSize: '9px', opacity: 0.5, marginLeft: '2px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: 'white', border: '1.5px solid var(--border)',
          borderRadius: '12px', boxShadow: 'var(--shadow-lg)',
          minWidth: '200px', overflow: 'hidden',
          animation: 'fadeDown 0.15s ease',
        }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

/* ── Simple list inside dropdown ─────────────────────────────────────────── */
const DropList = ({ items, value, onSelect, close }) => (
  <div style={{ padding: '6px', maxHeight: '260px', overflowY: 'auto' }}>
    {items.map((item) => {
      const isActive = item.value === value;
      return (
        <button key={item.value}
          onClick={() => { onSelect(item.value); close(); }}
          style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '9px 12px', borderRadius: '8px', border: 'none',
            cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? 700 : 500,
            background: isActive ? 'var(--accent-dim)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
        >
          {isActive && <span style={{ marginRight: '6px' }}>✓</span>}
          {item.label}
        </button>
      );
    })}
  </div>
);

/* ── Date range inside dropdown ──────────────────────────────────────────── */
const DateRangePicker = ({ dateFrom, dateTo, onChange, close }) => (
  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '240px' }}>
    <div>
      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>From</label>
      <input type="date" className="form-input" value={dateFrom}
        onChange={(e) => onChange('dateFrom', e.target.value)}
        style={{ fontSize: '13px' }} />
    </div>
    <div>
      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>To</label>
      <input type="date" className="form-input" value={dateTo}
        onChange={(e) => onChange('dateTo', e.target.value)}
        style={{ fontSize: '13px' }} />
    </div>
    {(dateFrom || dateTo) && (
      <button onClick={() => { onChange('dateFrom', ''); onChange('dateTo', ''); }}
        style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        ✕ Clear dates
      </button>
    )}
    <button onClick={close}
      style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
      Apply
    </button>
  </div>
);

/* ── Main Page ───────────────────────────────────────────────────────────── */
const BrowsePage = () => {
  const navigate = useNavigate();
  const [rawEvents,  setRawEvents]  = useState([]);
  const [locations,  setLocations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [activeType, setActiveType] = useState('ALL');

  const [filters, setFilters] = useState({ genre: '', language: '', status: '' });

  const [smartFilters, setSmartFilters] = useState({
    locationId:    '',
    priceRangeIdx: -1,
    dateFrom:      '',
    dateTo:        '',
  });

  /* Fetch locations once */
  useEffect(() => {
    getAllLocations()
      .then((res) => {
        const locs = Array.isArray(res.data?.data) ? res.data.data : [];
        console.log('[BrowsePage] locations sample:', locs[0]);
        setLocations(locs);
      })
      .catch(() => {});
  }, []);

  /* ── Load from API ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeType !== 'ALL') params.type     = activeType;
      if (filters.genre)        params.genre     = filters.genre;
      if (filters.language)     params.language  = filters.language;
      if (filters.status)       params.status    = filters.status;
      if (search.trim())        params.name      = search.trim();

      const res = await filterEvents(params);
      const events = Array.isArray(res.data?.data) ? res.data.data : [];
      console.log('[BrowsePage] events sample:', events[0]);
      setRawEvents(events);
    } catch {
      toast.error('Failed to load events');
      setRawEvents([]);
    } finally {
      setLoading(false);
    }
  }, [activeType, filters, search]);

  useEffect(() => { load(); }, [load]);

  /* ── Client-side filtering ── */
  const displayedEvents = React.useMemo(() => {
    let result = rawEvents;

    // 1. VENUE FILTER
    if (smartFilters.locationId) {
      const selectedLoc = locations.find(
        (l) => String(l.locationId ?? l.id ?? l.location_id ?? '') === smartFilters.locationId
      );

      result = result.filter((ev) => {
        // ── Try ID-based match first ──
        const evLocId = String(
          ev.locationId   ??
          ev.location_id  ??
          ev.venueId      ??
          ev.venue_id     ??
          ev.locId        ??
          ev.loc_id       ??
          ''
        );

        if (evLocId && evLocId !== '' && evLocId === smartFilters.locationId) {
          return true;
        }

        // ── Fall back to name-based match ──
        if (selectedLoc) {
          const selectedName = (
            selectedLoc.locName   ??
            selectedLoc.name      ??
            selectedLoc.venueName ??
            ''
          ).toLowerCase().trim();

          if (!selectedName) return false;

          // ✅ FIX: added ev.summary to the list
          const evVenueStr = [
            ev.venue,
            ev.locName,
            ev.location,
            ev.venueName,
            ev.venue_name,
            ev.venueList,
            ev.address,
            ev.categoryName,
            ev.summary,      // ← FIXED: was missing before
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return evVenueStr.includes(selectedName);
        }

        return false;
      });
    }

    // 2. PRICE FILTER
    const pr = smartFilters.priceRangeIdx >= 0 ? PRICE_RANGES[smartFilters.priceRangeIdx] : null;
    if (pr && (pr.min !== null || pr.max !== null)) {
      result = result.filter((ev) => {
        const raw =
          ev.price       ??
          ev.minPrice    ??
          ev.min_price   ??
          ev.basePrice   ??
          ev.base_price  ??
          ev.ticketPrice ??
          ev.ticket_price;

        if (raw == null) return true;
        const price = Number(raw);
        if (isNaN(price)) return true;
        if (pr.min !== null && price < pr.min) return false;
        if (pr.max !== null && price > pr.max) return false;
        return true;
      });
    }

    // 3. DATE FILTER
    if (smartFilters.dateFrom || smartFilters.dateTo) {
      const from = smartFilters.dateFrom ? new Date(smartFilters.dateFrom) : null;
      const to   = smartFilters.dateTo   ? new Date(smartFilters.dateTo)   : null;
      if (to) to.setHours(23, 59, 59, 999);

      result = result.filter((ev) => {
        const rawDate =
          ev.startDate   ??
          ev.start_date  ??
          ev.showDate    ??
          ev.show_date   ??
          ev.date        ??
          ev.eventDate   ??
          ev.event_date;

        if (!rawDate) return true;
        const evDate = new Date(rawDate);
        if (isNaN(evDate)) return true;
        if (from && evDate < from) return false;
        if (to   && evDate > to)   return false;
        return true;
      });
    }

    return result;
  }, [rawEvents, smartFilters, locations]);

  /* ── Helpers ── */
  const setFilter = (key, val) =>
    setFilters((f) => ({ ...f, [key]: val === 'ALL' ? '' : val }));

  const setSmart = (key, val) =>
    setSmartFilters((f) => ({ ...f, [key]: val }));

  const clearAll = () => {
    setFilters({ genre: '', language: '', status: '' });
    setActiveType('ALL');
    setSmartFilters({ locationId: '', priceRangeIdx: -1, dateFrom: '', dateTo: '' });
    setSearch('');
  };

  const selectedPriceRange = smartFilters.priceRangeIdx >= 0
    ? PRICE_RANGES[smartFilters.priceRangeIdx]
    : null;

  const venueLabel = smartFilters.locationId
    ? locations.find(
        (l) => String(l.locationId ?? l.id ?? l.location_id ?? '') === smartFilters.locationId
      )?.locName ?? locations.find(
        (l) => String(l.locationId ?? l.id ?? l.location_id ?? '') === smartFilters.locationId
      )?.name
    : null;

  const dateLabel = (smartFilters.dateFrom || smartFilters.dateTo)
    ? [
        smartFilters.dateFrom && `From ${smartFilters.dateFrom}`,
        smartFilters.dateTo   && `To ${smartFilters.dateTo}`,
      ].filter(Boolean).join(' · ')
    : null;

  const sidebarFilterCount = Object.values(filters).filter(Boolean).length;
  const smartFilterCount   =
    (smartFilters.locationId ? 1 : 0) +
    (smartFilters.priceRangeIdx >= 0 ? 1 : 0) +
    ((smartFilters.dateFrom || smartFilters.dateTo) ? 1 : 0);
  const totalFilters = sidebarFilterCount + smartFilterCount + (activeType !== 'ALL' ? 1 : 0);

  const venueItems = [
    { value: '', label: 'All Venues' },
    ...locations.map((l) => ({
      value: String(l.locationId ?? l.id ?? l.location_id ?? ''),
      label: l.locName ?? l.name ?? l.venueName ?? 'Unknown Venue',
    })),
  ];

  const priceItems = PRICE_RANGES.map((p, i) => ({ value: String(i), label: p.label }));

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg,#fff8f5 0%,#fef2ea 100%)', borderBottom: '1.5px solid var(--border)', padding: '36px 0 28px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 400, marginBottom: '6px' }}>
            Discover <span style={{ color: 'var(--accent)' }}>Events</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '20px' }}>
            Movies, Concerts &amp; Live Events — book your seat today
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '520px', marginBottom: '20px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
            <input className="form-input" placeholder="Search events, movies, concerts..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '44px', fontSize: '15px', borderRadius: '10px', boxShadow: 'var(--shadow)' }} />
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TYPES.map((t) => {
              const isActive = activeType === t;
              const color    = TYPE_COLOR[t] || 'var(--accent)';
              const icon     = TYPE_ICON[t]  || '';
              return (
                <button key={t} onClick={() => setActiveType(t)}
                  style={{
                    padding: '9px 22px', borderRadius: '99px', border: '1.5px solid',
                    cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700,
                    fontSize: '13px', transition: 'var(--transition)',
                    borderColor: isActive ? (t === 'ALL' ? 'var(--accent)' : color) : 'var(--border)',
                    background:  isActive ? (t === 'ALL' ? 'var(--accent-dim)' : `${color}18`) : 'white',
                    color:       isActive ? (t === 'ALL' ? 'var(--accent)' : color) : 'var(--text-secondary)',
                    boxShadow:   isActive ? 'var(--shadow)' : 'none',
                  }}>
                  {icon && <span style={{ marginRight: '5px' }}>{icon}</span>}
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '28px', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* ── Sidebar ── */}
          <div style={{ width: '200px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '84px' }}>
              {totalFilters > 0 && (
                <button onClick={clearAll} style={{
                  width: '100%', marginBottom: '16px', padding: '8px', borderRadius: '8px',
                  border: '1px solid var(--accent)', background: 'var(--accent-dim)',
                  color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                }}>
                  ✕ Clear {totalFilters} filter{totalFilters > 1 ? 's' : ''}
                </button>
              )}
              <FilterSection title="Genre">
                {GENRES.map((g) => (
                  <FilterChip key={g} label={g}
                    active={filters.genre === (g === 'ALL' ? '' : g)}
                    onClick={() => setFilter('genre', g)} />
                ))}
              </FilterSection>
              <FilterSection title="Language">
                {LANGS.map((l) => (
                  <FilterChip key={l} label={l}
                    active={filters.language === (l === 'ALL' ? '' : l)}
                    onClick={() => setFilter('language', l)} />
                ))}
              </FilterSection>
              <FilterSection title="Status">
                {STATUSES.map((s) => (
                  <FilterChip key={s} label={s}
                    active={filters.status === (s === 'ALL' ? '' : s)}
                    onClick={() => setFilter('status', s)} />
                ))}
              </FilterSection>
            </div>
          </div>

          {/* ── Results area ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ── Smart Filter Bar ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '16px', flexWrap: 'wrap',
              padding: '14px 18px', background: 'white',
              border: '1.5px solid var(--border)', borderRadius: '14px',
              boxShadow: 'var(--shadow)',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: '4px' }}>
                Filter by
              </span>

              {/* Venue dropdown */}
              <FilterDropdown icon="📍" label="Venue" activeLabel={venueLabel} hasValue={!!smartFilters.locationId}>
                {(close) => (
                  <DropList items={venueItems} value={smartFilters.locationId}
                    onSelect={(val) => setSmart('locationId', val)} close={close} />
                )}
              </FilterDropdown>

              {/* Price Range dropdown */}
              <FilterDropdown
                icon="💰" label="Price Range"
                activeLabel={selectedPriceRange && selectedPriceRange.label !== 'Any Price' ? selectedPriceRange.label : null}
                hasValue={smartFilters.priceRangeIdx >= 0}
              >
                {(close) => (
                  <DropList items={priceItems} value={String(smartFilters.priceRangeIdx)}
                    onSelect={(val) => setSmart('priceRangeIdx', Number(val))} close={close} />
                )}
              </FilterDropdown>

              {/* Date Range dropdown */}
              <FilterDropdown icon="📅" label="Show Date" activeLabel={dateLabel}
                hasValue={!!(smartFilters.dateFrom || smartFilters.dateTo)}>
                {(close) => (
                  <DateRangePicker dateFrom={smartFilters.dateFrom} dateTo={smartFilters.dateTo}
                    onChange={(key, val) => setSmart(key, val)} close={close} />
                )}
              </FilterDropdown>

              {/* Result count */}
              <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {loading ? 'Loading...' : `${displayedEvents.length} result${displayedEvents.length !== 1 ? 's' : ''}`}
              </span>
            </div>

            {/* ── Active filter pills ── */}
            {totalFilters > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Active:</span>
                {activeType !== 'ALL' && (
                  <ActiveTag label={`${TYPE_ICON[activeType]} ${activeType}`} onRemove={() => setActiveType('ALL')} />
                )}
                {filters.genre && (
                  <ActiveTag label={`🎭 ${filters.genre}`} onRemove={() => setFilter('genre', 'ALL')} />
                )}
                {filters.language && (
                  <ActiveTag label={`🌐 ${filters.language}`} onRemove={() => setFilter('language', 'ALL')} />
                )}
                {filters.status && (
                  <ActiveTag label={`● ${filters.status}`} onRemove={() => setFilter('status', 'ALL')} />
                )}
                {smartFilters.locationId && venueLabel && (
                  <ActiveTag label={`📍 ${venueLabel}`} onRemove={() => setSmart('locationId', '')} />
                )}
                {smartFilters.priceRangeIdx >= 0 && selectedPriceRange?.label !== 'Any Price' && (
                  <ActiveTag label={`💰 ${selectedPriceRange?.label}`} onRemove={() => setSmart('priceRangeIdx', -1)} />
                )}
                {smartFilters.dateFrom && (
                  <ActiveTag label={`From ${smartFilters.dateFrom}`} onRemove={() => setSmart('dateFrom', '')} />
                )}
                {smartFilters.dateTo && (
                  <ActiveTag label={`To ${smartFilters.dateTo}`} onRemove={() => setSmart('dateTo', '')} />
                )}
              </div>
            )}

            {/* Results grid */}
            {loading ? (
              <div className="loading-center"><div className="spinner" /><span>Loading events...</span></div>
            ) : displayedEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎭</div>
                <h3>No Events Found</h3>
                <p style={{ fontSize: '13px' }}>Try adjusting your filters or search term</p>
                {totalFilters > 0 && (
                  <button onClick={clearAll} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-3 animate-fadeUp">
                {displayedEvents.map((event) => (
                  <EventCard key={event.eventId} event={event}
                    onClick={() => navigate(`/events/${event.eventId}`, {
                      state: {
                        advFilters: {
                          locationId: smartFilters.locationId,
                          priceMin:   selectedPriceRange?.min ?? '',
                          priceMax:   selectedPriceRange?.max ?? '',
                          dateFrom:   smartFilters.dateFrom,
                          dateTo:     smartFilters.dateTo,
                        }
                      }
                    })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ── Event Card ─────────────────────────────────────────────────────────── */
const EventCard = ({ event, onClick }) => {
  const color = TYPE_COLOR[event.type] || '#9c9285';
  const icon  = TYPE_ICON[event.type]  || '🎪';

  return (
    <div className="card" onClick={onClick}
      style={{ cursor: 'pointer', borderTop: `3px solid ${color}`, transition: 'var(--transition)', overflow: 'hidden' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color, background: `${color}15`, padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {icon} {event.type}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px',
            background: event.status === 'ACTIVE' ? '#e8fff5' : event.status === 'COMPLETED' ? '#f0f0f0' : '#fff0f3',
            color:      event.status === 'ACTIVE' ? '#1a8f63' : event.status === 'COMPLETED' ? '#888'    : '#e8305a',
          }}>
            {event.status}
          </span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '8px', lineHeight: 1.3 }}>
          {event.name}
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {event.genre    && event.genre.split(',').map((g) => <Meta key={g}>🎭 {g.trim()}</Meta>)}
          {event.language && event.language.split(',').map((l) => <Meta key={l}>🌐 {l.trim()}</Meta>)}
          {event.duration && <Meta>⏱ {event.duration}</Meta>}
        </div>

        {event.summary && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {event.summary}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{event.categoryName || ''}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>Book Now →</span>
        </div>
      </div>
    </div>
  );
};

/* ── Shared helpers ──────────────────────────────────────────────────────── */
const Meta = ({ children }) => (
  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '20px', border: '1px solid var(--border)' }}>
    {children}
  </span>
);

const FilterSection = ({ title, children }) => (
  <div style={{ marginBottom: '24px' }}>
    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{children}</div>
  </div>
);

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick}
    style={{ padding: '7px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: active ? 700 : 500, background: active ? 'var(--accent-dim)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-secondary)', transition: 'var(--transition)' }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >{label}</button>
);

const ActiveTag = ({ label, onRemove }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '99px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
    {label}
    <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '12px', padding: 0, lineHeight: 1 }}>✕</button>
  </span>
);

export default BrowsePage;