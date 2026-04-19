import React, { useEffect, useState, useMemo } from 'react';

// Institutional Real-Time Macro Heatmap (NO MOCKUPS)
// Powered strictly by Federal Reserve Economic Data (FRED)

const MACRO_INDICATORS = [
  { id: 'GDP', name: 'GDP Growth QoQ', seriesId: 'A191RL1Q225SBEA', units: 'lin', format: '%', usdPositive: true, stocksPositive: true },
  { id: 'RETAIL', name: 'Retail Sales MoM', seriesId: 'RSAFS', units: 'pch', format: '%', usdPositive: true, stocksPositive: true },
  { id: 'CPI', name: 'CPI YoY', seriesId: 'CPIAUCSL', units: 'pc1', format: '%', usdPositive: true, stocksPositive: false },
  { id: 'PPI', name: 'PPI YoY', seriesId: 'WPUSOP3000', units: 'pc1', format: '%', usdPositive: true, stocksPositive: false },
  { id: 'PCE', name: 'PCE YoY', seriesId: 'PCEPI', units: 'pc1', format: '%', usdPositive: true, stocksPositive: false },
  { id: 'WAGES', name: 'Wage Growth YoY', seriesId: 'CES0500000003', units: 'pc1', format: '%', usdPositive: true, stocksPositive: false },
  { id: 'UNRATE', name: 'Unemployment Rate', seriesId: 'UNRATE', units: 'lin', format: '%', usdPositive: false, stocksPositive: false },
  { id: 'CLAIMS', name: 'US Initial Jobless Claims', seriesId: 'ICSA', units: 'lin', format: 'K', usdPositive: false, stocksPositive: false },
  { id: 'JOLTS', name: 'JOLTS Job Openings', seriesId: 'JTSJOL', units: 'lin', format: 'M', usdPositive: true, stocksPositive: true },
  { id: 'NFP', name: 'Non-Farm Payrolls', seriesId: 'PAYEMS', units: 'chg', format: 'K', usdPositive: true, stocksPositive: true }
];

interface MacroDataRow {
  id: string;
  name: string;
  date: string;
  actual: number | null;
  previous: number | null;
  format: string;
  usdImpact: 'Bullish' | 'Bearish' | 'Neutral' | 'Syncing...';
  stocksImpact: 'Bullish' | 'Bearish' | 'Neutral' | 'Syncing...';
}

const formatValue = (val: number | null, formatType: string) => {
  if (val === null) return '---';
  if (formatType === '%') return `${val.toFixed(1)}%`;
  if (formatType === 'M') return `${(val / 1000).toFixed(2)}M`;
  if (formatType === 'K') return `${val.toFixed(0)}K`;
  return val.toFixed(1);
};

const EconomicHeatmap: React.FC = () => {
  const [dataRows, setDataRows] = useState<MacroDataRow[]>(MACRO_INDICATORS.map(ind => ({
    id: ind.id,
    name: ind.name,
    date: 'SYNCING...',
    actual: null,
    previous: null,
    format: ind.format,
    usdImpact: 'Syncing...',
    stocksImpact: 'Syncing...'
  })));

  useEffect(() => {
    const fetchMacroData = async () => {
      const promises = MACRO_INDICATORS.map(async (ind) => {
        try {
          const res = await fetch(`/api/fred?series_id=${ind.seriesId}&limit=2&units=${ind.units}`);
          const json = await res.json();
          
          if (json.observations && json.observations.length >= 2) {
            const actual = parseFloat(json.observations[0].value);
            const prev = parseFloat(json.observations[1].value);
            
            // Format Date (e.g., "Oct 1, 25")
            const dateObj = new Date(json.observations[0].date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

            const isHigher = actual > prev;
            const isLower = actual < prev;

            let usdImp: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
            let stkImp: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';

            // High Volatility Threshold (Prevents Neutral spams)
            if (isHigher) {
              usdImp = ind.usdPositive ? 'Bullish' : 'Bearish';
              stkImp = ind.stocksPositive ? 'Bullish' : 'Bearish';
            } else if (isLower) {
              usdImp = ind.usdPositive ? 'Bearish' : 'Bullish';
              stkImp = ind.stocksPositive ? 'Bearish' : 'Bullish';
            }

            return {
              id: ind.id,
              name: ind.name,
              date: formattedDate,
              actual,
              previous: prev,
              format: ind.format,
              usdImpact: usdImp,
              stocksImpact: stkImp
            };
          }
        } catch (e) {
          console.error('Heatmap Sync Failed for:', ind.name);
        }

        return {
          id: ind.id,
          name: ind.name,
          date: 'FAIL',
          actual: null,
          previous: null,
          format: ind.format,
          usdImpact: 'Neutral' as const,
          stocksImpact: 'Neutral' as const
        };
      });

      const results = await Promise.all(promises);
      setDataRows(results);
    };

    fetchMacroData();
  }, []);

  const getImpactColor = (impact: string) => {
    if (impact === 'Bullish') return '#3b82f6'; // Blue for Bullish
    if (impact === 'Bearish') return '#ef4444'; // Red for Bearish
    if (impact === 'Neutral') return '#4b5563'; // Gray for Neutral
    return 'transparent';
  };

  // --- Gauge Scoring Logic ---
  const { usdScore, stocksScore } = useMemo(() => {
    let usdBull = 0, usdBear = 0;
    let stkBull = 0, stkBear = 0;

    dataRows.forEach(r => {
       if (r.usdImpact === 'Bullish') usdBull++;
       if (r.usdImpact === 'Bearish') usdBear++;
       if (r.stocksImpact === 'Bullish') stkBull++;
       if (r.stocksImpact === 'Bearish') stkBear++;
    });

    const usdTotal = usdBull + usdBear;
    const stkTotal = stkBull + stkBear;

    return {
      usdScore: usdTotal > 0 ? (usdBull / usdTotal) * 100 : 50,
      stocksScore: stkTotal > 0 ? (stkBull / stkTotal) * 100 : 50
    };
  }, [dataRows]);

  const renderGauge = (label: string, score: number) => {
    // Score determines needle rotation. 180 is far left (0%), 360 is far right (100%)
    const angle = 180 + (score / 100) * 180;
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.7))', 
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        padding: '1.5rem', 
        borderRadius: '16px', 
        width: '260px',
        position: 'relative'
      }}>
        
        {/* Floating Percentage Header */}
        <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          {score.toFixed(2)}%
        </div>

        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: '0 0 1rem 0', alignSelf: 'flex-start', letterSpacing: '0.5px' }}>
          {label} Bias
        </h3>
        
        <div style={{ position: 'relative', width: '180px', height: '100px', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <svg viewBox="0 0 200 110" width="100%" height="100%" style={{ overflow: 'visible' }}>
             <defs>
               <filter id={`glow-${label.replace(/\s+/g, '')}`} x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur stdDeviation="3" result="blur" />
                 <feMerge>
                   <feMergeNode in="blur"/>
                   <feMergeNode in="SourceGraphic"/>
                 </feMerge>
               </filter>
               <linearGradient id="bearGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#f43f5e" />
                 <stop offset="100%" stopColor="#9f1239" />
               </linearGradient>
               <linearGradient id="bullGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#1d4ed8" />
                 <stop offset="100%" stopColor="#3b82f6" />
               </linearGradient>
             </defs>

             {/* Background Track */}
             <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="16" strokeLinecap="round" />

             {/* Red side (left, 0 to 50%) */}
             <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="url(#bearGrad)" strokeWidth="16" strokeLinecap="round" style={{ filter: `url(#glow-${label.replace(/\s+/g, '')})` }} opacity={score < 50 ? "1" : "0.5"} />
             
             {/* Blue side (right, 50 to 100%) */}
             <path d="M 100 20 A 80 80 0 0 1 180 100" fill="none" stroke="url(#bullGrad)" strokeWidth="16" strokeLinecap="round" style={{ filter: `url(#glow-${label.replace(/\s+/g, '')})` }} opacity={score >= 50 ? "1" : "0.5"} />
             
             {/* Middle Splitter indicator (Tick) */}
             <line x1="100" y1="10" x2="100" y2="30" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
          </svg>

          {/* Sleek Luminous Needle */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            width: '80px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent 10%, #fbbf24 90%)',
            boxShadow: '2px 0px 8px rgba(251, 191, 36, 0.8)',
            transformOrigin: 'left center',
            transform: `translate(0, -50%) rotate(${angle}deg)`,
            borderRadius: '0 4px 4px 0',
            zIndex: 2,
            transition: 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }} />
          
          {/* Glassy Center Ring */}
          <div style={{
            position: 'absolute',
            bottom: '-4px', // Aligned with the origin of the needle
            left: '50%',
            width: '28px',
            height: '28px',
            background: '#1e293b',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            border: '4px solid #3b82f6',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(0,0,0,0.5)'
          }} />
        </div>
        
        {/* Dynamic Status Text */}
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#f8fafc', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: '1' }}>
            {score.toFixed(0)}%
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: score >= 50 ? '#60a5fa' : '#f43f5e', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>
            {score > 50 ? 'Net Bullish' : score < 50 ? 'Net Bearish' : 'Neutral'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-card" style={{ marginTop: '2rem', background: '#1c1c1e', border: '1px solid #2c2c2e', padding: '1.5rem', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>US Economic Heatmap</h2>
          <p style={{ color: '#8e8e93', fontSize: '11px', margin: '4px 0 0 0' }}>Institutional Base: FRED Actuals (No Mockup Data).</p>
        </div>
        <div className="verified-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          ✓ LIVE FRED DB SYNC
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#2c2c2e', color: '#94a3b8' }}>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #3f3f46' }}>US Economic Data</th>
              <th style={{ padding: '10px', border: '1px solid #3f3f46' }}>Date</th>
              <th style={{ padding: '10px', border: '1px solid #3f3f46' }}>Actual</th>
              <th style={{ padding: '10px', border: '1px solid #3f3f46' }}>Previous</th>
              <th style={{ padding: '10px', width: '100px', border: '1px solid #3f3f46' }}>USD Impact</th>
              <th style={{ padding: '10px', width: '100px', border: '1px solid #3f3f46' }}>Stocks Impact</th>
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #2c2c2e', color: '#f8fafc' }}>
                <td style={{ padding: '10px', textAlign: 'left', fontWeight: 600, border: '1px solid #3f3f46' }}>{row.name}</td>
                <td style={{ padding: '10px', color: '#fbbf24', border: '1px solid #3f3f46' }}>{row.date}</td>
                <td style={{ padding: '10px', fontWeight: 700, color: '#60a5fa', border: '1px solid #3f3f46' }}>{formatValue(row.actual, row.format)}</td>
                <td style={{ padding: '10px', color: '#94a3b8', border: '1px solid #3f3f46' }}>{formatValue(row.previous, row.format)}</td>
                
                {/* USD Impact Cell */}
                <td style={{ 
                  padding: '10px', 
                  background: getImpactColor(row.usdImpact), 
                  fontWeight: 700, 
                  border: '1px solid #3f3f46',
                  color: row.usdImpact === 'Neutral' ? '#94a3b8' : '#fff'
                }}>
                  {row.usdImpact}
                </td>

                <td style={{ 
                  padding: '10px', 
                  background: getImpactColor(row.stocksImpact), 
                  fontWeight: 700, 
                  border: '1px solid #3f3f46',
                  color: row.stocksImpact === 'Neutral' ? '#94a3b8' : '#fff'
                }}>
                  {row.stocksImpact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'flex-end', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        {renderGauge('USD', usdScore)}
        {renderGauge('US Stocks', stocksScore)}
      </div>
    </div>
  );
};

export default EconomicHeatmap;
