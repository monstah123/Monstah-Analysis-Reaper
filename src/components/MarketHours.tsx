import React, { useEffect, useState } from 'react';

interface Session {
  name: string;
  id: string;
  startUTC: number; // 0-23
  endUTC: number;   // 0-23
  color: string;
  flag: string;
}

const SESSIONS: Session[] = [
  { name: 'Sydney', id: 'sydney', startUTC: 22, endUTC: 7, color: '#3b82f6', flag: '🇦🇺' },
  { name: 'Tokyo', id: 'tokyo', startUTC: 0, endUTC: 9, color: '#ec4899', flag: '🇯🇵' },
  { name: 'London', id: 'london', startUTC: 7, endUTC: 16, color: '#0ea5e9', flag: '🇬🇧' },
  { name: 'New York', id: 'new-york', startUTC: 12, endUTC: 21, color: '#22c55e', flag: '🇺🇸' },
];

const MarketHours: React.FC = () => {
  const [nowUTC, setNowUTC] = useState(new Date());
  const [hoverFraction, setHoverFraction] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'golden' | 'worst' | 'none'>('golden');
  const resetTimerRef = React.useRef<any>(null);

  useEffect(() => {
    // 1-second pulse for real-time institutional countdown
    const timer = setInterval(() => setNowUTC(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getUTCFraction = (date: Date) => {
    return date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  };

  const getTimeRemaining = (targetHour: number, currentHour: number) => {
    let diff = (targetHour - currentHour + 24) % 24;
    const h = Math.floor(diff);
    const m = Math.floor((diff % 1) * 60);
    const s = Math.floor(((diff * 60) % 1) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  const currentFraction = getUTCFraction(nowUTC);
  // Shift the fraction so 22:00 UTC is '0' on the chart
  const getShiftedFraction = (f: number) => (f - 22 + 24) % 24;
  
  const displayFraction = hoverFraction !== null ? hoverFraction : currentFraction;
  const shiftedDisplayFraction = getShiftedFraction(displayFraction);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const timelineLeft = rect.left + 150; // increased for longer countdown labels
    const timelineWidth = rect.width - 150 - 80;
    const x = e.clientX - timelineLeft;
    
    if (x >= 0 && x <= timelineWidth) {
      const fractionAtX = (x / timelineWidth) * 24;
      const realUTC = (fractionAtX + 22) % 24;
      setHoverFraction(realUTC);

      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setHoverFraction(null);
      }, 5000);
    }
  };

  const isSessionOpen = (start: number, end: number, current: number) => {
    if (start < end) {
      return current >= start && current < end;
    } else {
      return current >= start || current < end;
    }
  };

  const getDisplayTime = (fraction: number) => {
    const hours = Math.floor(fraction);
    const mins = Math.floor((fraction % 1) * 60);
    const d = new Date(nowUTC);
    d.setUTCHours(hours, mins, 0, 0);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #1e2d48',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      cursor: 'crosshair'
    }}
    onMouseMove={handleMouseMove}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
            GLOBAL LIQUIDITY CLOCK
          </h3>
          <p style={{ fontSize: '0.75rem', color: hoverFraction !== null ? '#6366f1' : '#64748b', fontWeight: 600 }}>
            {hoverFraction !== null ? '⚡ FORECAST MODE: PREDICTING VOLUME' : 'MONSTAH REAL-TIME MARKET CONVERTER'}
          </p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ borderRight: '1px solid #1e2d48', paddingRight: '1.5rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'monospace' }}>
              {nowUTC.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>LOCAL DESK</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3b82f6', fontFamily: 'monospace' }}>
              {nowUTC.getUTCHours().toString().padStart(2, '0')}:{nowUTC.getUTCMinutes().toString().padStart(2, '0')}:{nowUTC.getUTCSeconds().toString().padStart(2, '0')} <span style={{ fontSize: '0.7rem' }}>UTC</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>GLOBAL STANDARD</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', height: '280px', marginTop: '1rem', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '150px', marginBottom: '10px' }}>
          {[22, 2, 6, 10, 14, 18, 22].map(h => (
            <span key={h} style={{ fontSize: '10px', color: '#475569', fontWeight: 800 }}>{(h % 24).toString().padStart(2, '0')}:00</span>
          ))}
        </div>

        {/* Backdrop highlights for Golden/Worst zones */}
        <div style={{ position: 'absolute', left: '150px', right: '80px', top: '30px', bottom: '0', display: 'flex', zIndex: 0 }}>
          {Array.from({ length: 48 }).map((_, i) => {
            const h = (i / 2 + 22) % 24;
            let bgColor = 'transparent';
            if (viewMode === 'golden') {
              if (h >= 12 && h < 16) bgColor = 'rgba(234, 179, 8, 0.15)'; // Overlap #1
              if (h >= 7 && h < 9) bgColor = 'rgba(234, 179, 8, 0.1)';   // London Open #2
              if (h >= 22 || h < 0) bgColor = 'rgba(234, 179, 8, 0.05)'; // Sydney Open #3
            } else if (viewMode === 'worst') {
              if (h >= 21 && h < 22) bgColor = 'rgba(239, 68, 68, 0.2)'; // NY Close / Rollover
            }
            return <div key={i} style={{ flex: 1, background: bgColor, borderLeft: bgColor !== 'transparent' ? '1px solid rgba(255,255,255,1.5%)' : 'none' }} />;
          })}
        </div>

        <div 
          className={hoverFraction === null ? "pulsing-laser" : ""}
          style={{
            position: 'absolute',
            left: `calc(150px + (100% - 150px - 80px) * (${shiftedDisplayFraction} / 24))`,
            top: '20px',
            bottom: '0',
            width: '2px',
            background: hoverFraction !== null ? '#6366f1' : 'linear-gradient(to bottom, #818cf8, #6366f1, transparent)',
            zIndex: 10,
            transition: hoverFraction === null ? 'left 1.5s cubic-bezier(0.19, 1, 0.22, 1)' : 'none',
            boxShadow: hoverFraction !== null ? '0 0 10px #6366f1' : 'none'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: hoverFraction !== null ? '#1f2937' : 'linear-gradient(135deg, #818cf8, #6366f1)',
            padding: '4px 8px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: hoverFraction !== null ? '0 4px 15px rgba(0,0,0,0.5)' : '0 4px 15px rgba(99, 102, 241, 0.6)',
            border: hoverFraction !== null ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.2)',
            minWidth: '70px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: 'white' }}>{getDisplayTime(displayFraction)}</div>
            <div style={{ fontSize: '7px', fontWeight: 700, color: hoverFraction !== null ? '#6366f1' : 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>
              {hoverFraction !== null ? 'FORECAST' : 'LIVE'}
            </div>
            <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid ${hoverFraction !== null ? '#1f2937' : '#6366f1'}` }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
          {SESSIONS.map(session => {
            const isOpen = isSessionOpen(session.startUTC, session.endUTC, currentFraction);
            const shiftedStart = getShiftedFraction(session.startUTC);
            const left = (shiftedStart / 24) * 100;
            const duration = (session.endUTC - session.startUTC + 24) % 24;
            const width = (duration / 24) * 100;
            
            const countdown = isOpen 
              ? `closes in ${getTimeRemaining(session.endUTC, currentFraction)}`
              : `opens in ${getTimeRemaining(session.startUTC, currentFraction)}`;

            return (
              <div key={session.id} style={{ display: 'flex', alignItems: 'center', height: '28px' }}>
                <div style={{ width: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{session.flag}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: isOpen ? 900 : 700, color: isOpen ? '#f8fafc' : '#475569', letterSpacing: '0.02em' }}>{session.name}</span>
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: isOpen ? (session.id === 'new-york' ? '#4ade80' : '#3b82f6') : '#94a3b8', 
                    fontWeight: 900, 
                    marginLeft: '22px', 
                    fontFamily: 'monospace',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    opacity: isOpen ? 1 : 0.8
                  }}>
                    {countdown}
                  </div>
                </div>
                <div style={{ flex: 1, height: '10px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '10px', position: 'relative', overflow: 'hidden', marginRight: '80px' }}>
                  <div style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, height: '100%', background: session.color, opacity: isOpen ? 1 : 0.2, borderRadius: '10px', transition: 'all 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '20px', paddingLeft: '150px', paddingRight: '80px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institutional Money Flow</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '60px', gap: '2px', position: 'relative' }}>
            {Array.from({ length: 48 }).map((_, i) => {
              const h = (i / 2 + 22) % 24;
              const vol = (Math.exp(-Math.pow(h - 10, 2) / 6) * 1.8) + (Math.exp(-Math.pow(h - 14.5, 2) / 4) * 2.6) + (Math.exp(-Math.pow(h - 18, 2) / 8) * 1.4) + (Math.exp(-Math.pow(h - 2, 2) / 6) * 0.6) + 0.2;
              const isCurrent = Math.abs((i / 2) - shiftedDisplayFraction) < 0.25;
              const height = (vol / 3.0) * 100;

              let barColor = vol > 1.4 ? 'rgba(99, 102, 241, 0.6)' : 'rgba(71, 85, 105, 0.3)';
              if (viewMode === 'golden' && ((h >= 12 && h < 16) || (h >= 7 && h < 9))) {
                barColor = 'rgba(234, 179, 8, 0.6)';
              } else if (viewMode === 'worst' && (h >= 21 && h < 22)) {
                barColor = 'rgba(239, 68, 68, 0.6)';
              }
              if (isCurrent) barColor = viewMode === 'golden' ? '#eab308' : (viewMode === 'worst' ? '#ef4444' : '#6366f1');

              return (
                <div key={i} style={{ flex: 1, height: `${height}%`, background: barColor, borderRadius: '1px', position: 'relative', transition: 'all 0.3s ease' }}>
                  {isCurrent && (
                    <div style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', background: '#1e2d48', border: `1px solid ${barColor}`, padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: '4px', boxShadow: `0 0 15px ${barColor}`, zIndex: 20 }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, color: 'white' }}>${(vol * 1.6).toFixed(2)} Trillion</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '1px', background: 'rgba(30, 41, 59, 0.5)', padding: '2px', borderRadius: '8px', width: 'fit-content', border: '1px solid #1e2d48' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setViewMode('golden'); }}
            style={{ 
              background: viewMode === 'golden' ? '#1e293b' : 'transparent', 
              border: 'none', color: viewMode === 'golden' ? '#eab308' : '#64748b', 
              padding: '8px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, 
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            👍 Golden time
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setViewMode('worst'); }}
            style={{ 
              background: viewMode === 'worst' ? '#1e293b' : 'transparent', 
              border: 'none', color: viewMode === 'worst' ? '#ef4444' : '#64748b', 
              padding: '8px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, 
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            👎 Worst time
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {viewMode === 'golden' && (
            <>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: '#eab308', fontWeight: 900, fontSize: '0.75rem', width: '24px' }}>#1</span>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                  <strong style={{ color: '#f8fafc' }}>London/New York Overlap</strong> has the highest trading volumes and volatility. Therefore it tends to also have the tightest spreads. The bigger the trading volume the bigger the price movements, thus more pips can be made.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: '#eab308', fontWeight: 900, fontSize: '0.75rem', width: '24px' }}>#2</span>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                  The most active session is London's session. The first hour after a major market opens is considered very important and often indicates how the session might develop.
                </p>
              </div>
            </>
          )}
          {viewMode === 'worst' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: '#ef4444', fontWeight: 900, fontSize: '0.75rem', width: '24px' }}>!!</span>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                <strong style={{ color: '#f8fafc' }}>The Rollover / Gap Zone</strong> is the period after NY close and before Tokyo picks up. Spreads widen significantly and liquidity is thin. High risk of slippage.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketHours;
