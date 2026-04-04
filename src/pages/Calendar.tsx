import React, { useEffect, useRef } from 'react';

interface CalendarResult {
  symbol: string;
  event: string;
  actual: string;
  forecast: string;
  previous: string;
  impact: 'better' | 'worse' | 'inline';
}

const RECENT_RESULTS: CalendarResult[] = [
  { symbol: 'USD', event: 'Avg. Hourly Earnings (MoM)', actual: '0.1%', forecast: '0.3%', previous: '0.1%', impact: 'worse' },
  { symbol: 'USD', event: 'Nonfarm Payrolls', actual: '303K', forecast: '200K', previous: '270K', impact: 'better' },
  { symbol: 'USD', event: 'Unemployment Rate', actual: '3.8%', forecast: '3.9%', previous: '3.9%', impact: 'better' },
  { symbol: 'CAD', event: 'Employment Change', actual: '-2.2K', forecast: '25.0K', previous: '40.7K', impact: 'worse' },
  { symbol: 'EUR', event: 'Services PMI', actual: '51.5', forecast: '51.1', previous: '50.2', impact: 'better' },
  { symbol: 'GBP', event: 'Construction PMI', actual: '50.2', forecast: '49.7', previous: '49.7', impact: 'better' },
  { symbol: 'JPY', event: 'Household Spending', actual: '-0.5%', forecast: '-3.0%', previous: '-6.3%', impact: 'better' },
];

const Calendar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget if re-rendered
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

      {/* Result Tracker Section (New Requested Design) */}
      <div className="settings-card" style={{ marginTop: '20px', padding: '1.25rem' }}>
        <h2 className="settings-section-title" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📊</span> Latest Impactful Results
        </h2>
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
               {RECENT_RESULTS.map((res, i) => (
                 <tr key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                   <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{res.symbol}</td>
                   <td style={{ padding: '0.75rem 1rem' }}>{res.event}</td>
                   <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div className={`result-box ${res.impact}`}>
                        {res.actual}
                      </div>
                   </td>
                   <td style={{ padding: '0.75rem 1rem', textAlign: 'center', opacity: 0.7 }}>{res.forecast}</td>
                   <td style={{ padding: '0.75rem 1rem', textAlign: 'center', opacity: 0.7 }}>{res.previous}</td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
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
