import React, { useEffect, useRef, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

const Calendar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { macroData, lastRefresh, isRefreshing } = useApp();

  // Create a structured list of major indicators from our real-time macro data
  const results = useMemo(() => {
    if (!macroData.gdp) return []; // Only show if data is loaded

    const getScore = (key: string, val: number) => {
       if (key === 'inflation') return val <= 2.5 ? 'better' : val >= 3.5 ? 'worse' : 'inline';
       if (key === 'gdp') return val >= 2.0 ? 'better' : val < 0 ? 'worse' : 'inline';
       if (key === 'unemployment') return val < 3.8 ? 'better' : val > 4.2 ? 'worse' : 'inline';
       if (key === 'payrolls') return val >= 250 ? 'better' : val < 100 ? 'worse' : 'inline';
       return 'inline';
    };

    return [
      { country: 'USD', title: 'Nonfarm Payrolls', actual: `${macroData.payrolls > 0 ? '+' : ''}${macroData.payrolls}K`, score: getScore('payrolls', macroData.payrolls), label: 'Employment' },
      { country: 'USD', title: 'Inflation Rate (YoY)', actual: `${macroData.inflation.toFixed(1)}%`, score: getScore('inflation', macroData.inflation), label: 'CPI' },
      { country: 'USD', title: 'GDP Growth', actual: `${macroData.gdp.toFixed(1)}%`, score: getScore('gdp', macroData.gdp), label: 'Growth' },
      { country: 'USD', title: 'Unemployment Rate', actual: `${macroData.unemployment.toFixed(1)}%`, score: getScore('unemployment', macroData.unemployment), label: 'Labor' },
      { country: 'USD', title: 'Retail Sales', actual: `${macroData.retailSales.toFixed(1)}%`, score: 'inline', label: 'Consumption' }
    ];
  }, [macroData]);

  useEffect(() => {
    // Load TradingView Widget (Institutional Stream)
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
          <p>Institutional Market Results & Daily News Feed</p>
        </div>
      </header>

      {/* Institutional High-Impact Results Tracking (The "Boxed" Request) */}
      <div className="settings-card" style={{ marginTop: '20px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
           <h2 className="settings-section-title" style={{ color: 'var(--accent)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span>📊</span> Institutional Results Tracker
           </h2>
           <div style={{ fontSize: '0.65rem', color: '#8b9ab8', fontWeight: 600, display: 'flex', gap: '1rem' }}>
              <span>SYNCED VIA FRED API</span>
              {lastRefresh && <span>LAST TICK: {lastRefresh.toLocaleTimeString()}</span>}
           </div>
        </div>

        {isRefreshing && !results.length ? (
           <div style={{ padding: '2rem', textAlign: 'center', fontStyle: 'italic', opacity: 0.5 }}>Syncing live market results…</div>
        ) : !results.length ? (
           <div style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>🔑 Connect your **FRED API Key** in Settings to view live results with impact tracking.</p>
           </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderSpacing: '0 8px', borderCollapse: 'separate' }}>
               <thead>
                 <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                   <th style={{ padding: '0 1rem' }}>Sector</th>
                   <th style={{ padding: '0 1rem' }}>Major Indicator</th>
                   <th style={{ padding: '0 1rem', textAlign: 'right' }}>Latest Result</th>
                   <th style={{ padding: '0 1rem', textAlign: 'center' }}>Institution</th>
                 </tr>
               </thead>
               <tbody>
                 {results.map((res, i) => (
                   <tr key={res.title} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '4px', animation: `fadeInRow 0.3s ease forwards ${i * 0.05}s`, opacity: 0 }}>
                     <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#8b9ab8', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{res.label}</span>
                     </td>
                     <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{res.title}</td>
                     <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                           <div className={`result-box ${res.score}`} style={{ minWidth: '80px', borderRadius: '4px', fontSize: '0.85rem' }}>
                              {res.actual}
                           </div>
                        </div>
                     </td>
                     <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#8b9ab8', fontSize: '0.7rem', fontWeight: 700 }}>USA / FRB</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* TradingView Stream (Full Calendar Feed) */}
      <div className="settings-card" style={{ marginTop: '20px', height: '600px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <div className="calendar-header" style={{ display: 'flex', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          <div style={{ width: '50px' }}>Time</div>
          <div className="hide-mobile" style={{ width: '40px', textAlign: 'center' }}>Flag</div>
          <div style={{ flex: 1, paddingLeft: '10px' }}>Institutional News Stream (Full Feed)</div>
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
