import React from 'react';
import { useNavigate } from 'react-router-dom';

const TYPE_STYLES = {
  MOVIE:   { bg:'var(--blue-dim)',   color:'var(--blue)',   border:'rgba(37,99,168,0.2)',  icon:'🎬' },
  CONCERT: { bg:'var(--gold-dim)',   color:'var(--gold)',   border:'rgba(201,125,26,0.2)', icon:'🎵' },
  EVENT:   { bg:'var(--green-dim)',  color:'var(--green)',  border:'rgba(26,143,99,0.2)',  icon:'🎪' },
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const ts = TYPE_STYLES[event.type] || TYPE_STYLES.EVENT;

  return (
    <div className="card card-glow" onClick={() => navigate(`/events/${event.eventId}`)}
      style={{ cursor:'pointer', overflow:'hidden', padding:0 }}>
      {/* Top color strip */}
      <div style={{ height:'5px', background:ts.color, opacity:0.7 }} />

      <div style={{ padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 10px', borderRadius:'99px', fontSize:'11px', fontWeight:700, background:ts.bg, color:ts.color, border:`1px solid ${ts.border}`, textTransform:'uppercase', letterSpacing:'0.4px' }}>
            {ts.icon} {event.type}
          </span>
          <span className={`badge ${event.status==='ACTIVE'?'badge-success':event.status==='CANCELLED'?'badge-danger':'badge-muted'}`}>
            {event.status}
          </span>
        </div>

        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:400, color:'var(--text-primary)', marginBottom:'10px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {event.name}
        </h3>

        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'10px' }}>
          {event.genre && <MetaTag icon="🎭" label={event.genre} />}
          {event.language && <MetaTag icon="🌐" label={event.language} />}
          {event.duration && <MetaTag icon="⏱" label={event.duration} />}
        </div>

        {event.summary && (
          <p style={{ fontSize:'13px', color:'var(--text-muted)', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {event.summary}
          </p>
        )}

        <div style={{ marginTop:'16px', paddingTop:'14px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'12px', color:'var(--text-muted)', fontWeight:500 }}>
            {event.categoryName || 'General'}
          </span>
          <span style={{ fontSize:'13px', fontWeight:700, color:'var(--accent)', display:'flex', alignItems:'center', gap:'4px' }}>
            Book Now <span>→</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const MetaTag = ({ icon, label }) => (
  <span style={{ fontSize:'12px', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'4px', fontWeight:500 }}>
    {icon} {label}
  </span>
);

export default EventCard;
