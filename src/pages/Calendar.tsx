import React, { useEffect, useRef } from 'react';

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
      
      <div className="settings-card" style={{ marginTop: '20px', height: '80vh', padding: '10px' }}>
        <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};

export default Calendar;
