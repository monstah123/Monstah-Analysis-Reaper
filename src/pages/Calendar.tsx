import React, { useEffect, useRef, useState } from 'react';

interface CalendarResult {
  country: string;
  title: string;
  actual: string;
  forecast: string;
  previous: string;
  score: 'better' | 'worse' | 'inline';
}

const Calendar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<CalendarResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch Live Institutional Results from our API proxy
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/calendar');
        const json = await res.json();
        if (json.success && json.results) {
          setResults(json.results);
          setError(null);
        } else {
          throw new Error('News feed currently unavailable.');
        }
      } catch (err: any) {
        console.warn('[Calendar API] Fetch failed:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();

    // 2. Load TradingView Widget
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: true,
      width: '100%',
      height: '100%',
      locale: 'en',
      importanceFilter: '-1,0,1',
      currencyFilter: 'USD,EUR,GBP,JPY,AUD,CAD,NZD,CHF'
    });
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>📅 Economic Calendar</h1>
          <p>High-Impact News Events & Macro Data Drops</p>
        </div>
      </header>

      {/* Live Result Tracker Section */}
      <div className="settings-card" style={{ marginTop: '20px', padding: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
           <h2 className="settings-section-title" style={{ color: 'var(--accent)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span>📊</span> Latest High-Impact Results
           </h2>
           <span style={{ fontSize: '0.65rem', color: '#8b9ab8', fontWeight: 600 }}>LIVE INSTITUTIONAL FEED</span>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', fontStyle: 'italic', opacity: 0.5 }}>Syncing live market data…</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#fca5a5' }}>Feed Error: {error} (Check local key or connection)</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderSpacing: '0 8px', borderCollapse: 'separate' }}>
               <thead>
                 <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                   <th style={{ padding: '0 1rem' }}>CCY</th>
                   <th style={{ padding: '0 1rem' }}>Event</th>
                   <th style={{ padding: '0 1rem', textAlign: 'center' }}>Actual</th>
                   <th style={{ padding: '0 1rem', textAlign: 'center' }}>Forecast</th>
                   <th style={{ padding: '0 1rem', textAlign: 'center' }}>Previous</th>
                 </tr>
               </thead>
               <tbody>
                 {results.map((res, i) => (
                   <tr key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                     <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{res.country}</td>
                     <td style={{ padding: '0.75rem 1rem' }}>{res.title}</td>
                     <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div className={`result-box ${res.score}`}>
                          {res.actual}
                        </div>
                     </td>
                     <td style={{ padding: '0.75rem 1rem', textAlign: 'center', opacity: 0.7 }}>{res.forecast || '—'}</td>
                     <td style={{ padding: '0.75rem 1rem', textAlign: 'center', opacity: 0.7 }}>{res.previous || '—'}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Full Institutional Calendar (TradingView) */}
      <div className="settings-card" style={{ marginTop: '20px', height: '80vh', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <div className="calendar-header" style={{ display: 'flex', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          <div style={{ width: '50px' }}>Time</div>
          <div className="hide-mobile" style={{ width: '40px', textAlign: 'center' }}>Flag</div>
          <div style={{ flex: 1, paddingLeft: '10px' }}>Full Event Stream</div>
          <div style={{ width: '60px', textAlign: 'right' }}>Act.</div>
          <div style={{ width: '60px', textAlign: 'right' }}>For.</div>
          <div style={{ width: '60px', textAlign: 'right', paddingRight: '10px' }}>Prev.</div>
        </div>
        <div ref={containerRef} style={{ flex: 1, width: '100%', overflow: 'hidden' }} />
      </div>
    </div>
  );
};

export default Calendar;
