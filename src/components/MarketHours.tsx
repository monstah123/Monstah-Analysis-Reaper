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
  { name: 'London', id: 'london', startUTC: 8, endUTC: 17, color: '#0ea5e9', flag: '🇬🇧' },
  { name: 'New York', id: 'new-york', startUTC: 13, endUTC: 22, color: '#22c55e', flag: '🇺🇸' },
];

const MarketHours: React.FC = () => {
  const [nowUTC, setNowUTC] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowUTC(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getUTCFraction = (date: Date) => {
    return date.getUTCHours() + date.getUTCMinutes() / 60;
  };

  const currentFraction = getUTCFraction(nowUTC);

  const isSessionOpen = (start: number, end: number, current: number) => {
    if (start < end) {
      return current >= start && current < end;
    } else {
      // Over-midnight (e.g., 22:00 to 07:00)
      return current >= start || current < end;
    }
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
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
            GLOBAL LIQUIDITY CLOCK
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>MONSTAH REAL-TIME MARKET CONVERTER</p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* Local Desk Time */}
          <div style={{ borderRight: '1px solid #1e2d48', paddingRight: '1.5rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'monospace' }}>
              {nowUTC.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>LOCAL DESK</div>
          </div>
          {/* UTC Standard */}
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3b82f6', fontFamily: 'monospace' }}>
              {nowUTC.getUTCHours().toString().padStart(2, '0')}:{nowUTC.getUTCMinutes().toString().padStart(2, '0')} <span style={{ fontSize: '0.7rem' }}>UTC</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>GLOBAL STANDARD</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', height: '240px', marginTop: '1rem' }}>
        {/* Hour markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '120px', marginBottom: '10px' }}>
          {[0, 4, 8, 12, 16, 20, 24].map(h => (
            <span key={h} style={{ fontSize: '10px', color: '#475569', fontWeight: 800 }}>{h.toString().padStart(2, '0')}:00</span>
          ))}
        </div>

        {/* Live Indicator Laser */}
        <div 
          className="pulsing-laser"
          style={{
            position: 'absolute',
            left: `calc(120px + (100% - 120px) * (${currentFraction} / 24))`,
            top: '20px',
            bottom: '0',
            width: '2px',
            background: 'linear-gradient(to bottom, #818cf8, #6366f1, transparent)',
            zIndex: 10,
            transition: 'left 1s linear',
          }}
        >
          {/* The Purple Time Bubble */}
          <div style={{
            position: 'absolute',
            top: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            padding: '4px 8px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
            minWidth: '60px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: 'white' }}>
              {nowUTC.getUTCHours().toString().padStart(2, '0')}:{nowUTC.getUTCMinutes().toString().padStart(2, '0')}
            </div>
            <div style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>UTC</div>
            
            {/* Pointer triangle */}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #6366f1'
            }} />
          </div>
        </div>

        {/* Sessions Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SESSIONS.map(session => {
            const isOpen = isSessionOpen(session.startUTC, session.endUTC, currentFraction);
            const left = (session.startUTC / 24) * 100;
            const width = session.startUTC < session.endUTC 
              ? ((session.endUTC - session.startUTC) / 24) * 100
              : ((24 - session.startUTC + session.endUTC) / 24) * 100;

            return (
              <div key={session.id} style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{session.flag}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: isOpen ? 800 : 600, color: isOpen ? '#f8fafc' : '#475569' }}>{session.name}</span>
                </div>
                <div style={{ flex: 1, height: '10px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
                  {session.startUTC < session.endUTC ? (
                    <div style={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${width}%`,
                      height: '100%',
                      background: session.color,
                      opacity: isOpen ? 1 : 0.2,
                      borderRadius: '10px',
                      transition: 'all 0.5s ease'
                    }} />
                  ) : (
                    <>
                      <div style={{ position: 'absolute', left: `${left}%`, width: `${100 - left}%`, height: '100%', background: session.color, opacity: isOpen ? 1 : 0.2, borderRadius: '10px 0 0 10px' }} />
                      <div style={{ position: 'absolute', left: '0', width: `${(session.endUTC / 24) * 100}%`, height: '100%', background: session.color, opacity: isOpen ? 1 : 0.2, borderRadius: '0 10px 10px 0' }} />
                    </>
                  )}
                </div>
                <div style={{ width: '80px', textAlign: 'right' }}>
                  <span style={{ 
                    fontSize: '8px', 
                    fontWeight: 900, 
                    padding: '1px 5px', 
                    borderRadius: '4px',
                    background: isOpen ? `${session.color}22` : 'rgba(71, 85, 105, 0.1)',
                    color: isOpen ? session.color : '#475569',
                    border: `1px solid ${isOpen ? `${session.color}44` : 'transparent'}`
                  }}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* TRADING VOLUME GRAPH */}
        <div style={{ marginTop: '20px', paddingLeft: '120px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institutional Money Flow (Daily Turnover)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '60px', gap: '2px', position: 'relative' }}>
            {Array.from({ length: 48 }).map((_, i) => {
              const h = i / 2;
              // Recalibrated Liquidity Model
              // High points: 9-11 (LDN Surge), 13-16 (Overlap Peak), 16-19 (US Surge)
              const vol = 
                (Math.exp(-Math.pow(h - 10, 2) / 6) * 1.1) + // London Heavy Session
                (Math.exp(-Math.pow(h - 14.5, 2) / 4) * 1.4) + // Peak Overlap Surge
                (Math.exp(-Math.pow(h - 18, 2) / 8) * 0.9) + // US Afternoon Session
                (Math.exp(-Math.pow(h - 2, 2) / 6) * 0.4) +  // Tokyo/Asia
                0.15; // Global Baseline
              
              const isCurrent = Math.abs(h - currentFraction) < 0.25;
              const height = (vol / 1.5) * 100;

              return (
                <div key={i} style={{
                  flex: 1,
                  height: `${height}%`,
                  background: isCurrent ? '#6366f1' : (vol > 0.8 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(71, 85, 105, 0.2)'),
                  borderRadius: '1px',
                  position: 'relative'
                }}>
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '-35px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1e2d48',
                      border: '1px solid #3b82f6',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '4px',
                      boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
                      zIndex: 20
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, color: 'white' }}>${Math.min(2.5, (vol * 0.9)).toFixed(2)} Trillion</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overlap Highlights */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        {isSessionOpen(8, 17, currentFraction) && isSessionOpen(13, 22, currentFraction) && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            padding: '4px 10px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="live-dot live" style={{ width: '6px', height: '6px' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#22c55e' }}>PEAK LIQUIDITY: LONDON/NY OVERLAP</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketHours;
