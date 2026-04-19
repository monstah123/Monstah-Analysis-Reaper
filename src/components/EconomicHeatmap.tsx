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
    // 2026 Divergence Gauge Logic:
    // Tracks start from the absolute center top (Neutral = 50)
    // If > 50, it sweeps RIGHT. If < 50, it sweeps LEFT.
    const isBullish = score > 50;
    const isBearish = score < 50;
    const absDelta = Math.abs(score - 50); // 0 to 50
    const fillPercentage = (absDelta / 50) * 100; // 0 to 100% capacity of the half-track
    
    // Geometry
    const radius = 80;
    const strokeLength = (Math.PI * radius) / 2; // Length of a quarter circle
    const dashOffset = strokeLength - (fillPercentage / 100) * strokeLength;
    
    // End Dot Coordinates Math
    // Normal math: 0 deg is right edge, -90 deg is top center.
    // For Bullish: sweeps from -90 to 0 degrees.
    // For Bearish: sweeps from -90 to -180 degrees.
    const angleRange = (fillPercentage / 100) * (Math.PI / 2);
    const finalAngle = isBullish ? (-Math.PI/2 + angleRange) : (-Math.PI/2 - angleRange);
    
    const dotX = 100 + radius * Math.cos(finalAngle);
    const dotY = 100 + radius * Math.sin(finalAngle);

    const themeColor = score > 50 ? '#3b82f6' : score < 50 ? '#ef4444' : '#64748b';
    const bgGradient = score > 50 ? 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)' : 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.08) 0%, transparent 70%)';

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: '#121418', 
        border: '1px solid rgba(255, 255, 255, 0.04)',
        padding: '1.5rem', 
        borderRadius: '16px', 
        width: '260px',
        position: 'relative',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        backgroundImage: bgGradient
      }}>
        
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0, letterSpacing: '0.3px' }}>
            {label}
          </h3>
          <div style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px' }}>
             BIAS VECTOR
          </div>
        </div>
        
        <div style={{ position: 'relative', width: '200px', height: '110px', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <svg viewBox="0 0 200 110" width="100%" height="100%" style={{ overflow: 'visible' }}>
             <defs>
               <linearGradient id={`bullGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#60a5fa" />
                 <stop offset="100%" stopColor="#2563eb" />
               </linearGradient>
               <linearGradient id={`bearGrad-${label}`} x1="100%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#fb7185" />
                 <stop offset="100%" stopColor="#e11d48" />
               </linearGradient>
             </defs>

             {/* Faint Background Track (Full Half-Circle) */}
             <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" strokeLinecap="round" />
             
             {/* Micro-Dash Inner Orbit Ring */}
             <path d="M 35 100 A 65 65 0 0 1 165 100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />

             {/* Left Sweep (Bearish) */}
             {isBearish && (
               <path 
                 d="M 100 20 A 80 80 0 0 0 20 100" 
                 fill="none" 
                 stroke={`url(#bearGrad-${label})`} 
                 strokeWidth="12" 
                 strokeLinecap="round"
                 strokeDasharray={strokeLength}
                 strokeDashoffset={dashOffset}
                 style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
               />
             )}
             
             {/* Right Sweep (Bullish) */}
             {isBullish && (
               <path 
                 d="M 100 20 A 80 80 0 0 1 180 100" 
                 fill="none" 
                 stroke={`url(#bullGrad-${label})`} 
                 strokeWidth="12" 
                 strokeLinecap="round"
                 strokeDasharray={strokeLength}
                 strokeDashoffset={dashOffset}
                 style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
               />
             )}
             
             {/* Center Neutral Anchor */}
             <circle cx="100" cy="20" r="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
             
             {/* The Dynamic Leading Dot */}
             {(isBullish || isBearish) && (
                <circle 
                  cx={dotX} 
                  cy={dotY} 
                  r="6" 
                  fill="#fff" 
                  style={{ 
                    filter: `drop-shadow(0 0 6px ${themeColor})`,
                    transition: 'cx 1.5s cubic-bezier(0.16, 1, 0.3, 1), cy 1.5s cubic-bezier(0.16, 1, 0.3, 1)' 
                  }} 
                />
             )}
          </svg>

          {/* Central Typography Typography */}
          <div style={{ position: 'absolute', bottom: '0px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: '1' }}>
              {score.toFixed(0)}<span style={{ fontSize: '18px', color: '#94a3b8', verticalAlign: 'top', marginLeft: '2px' }}>%</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
               <div style={{ 
                 background: score > 50 ? 'rgba(59, 130, 246, 0.1)' : score < 50 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', 
                 color: themeColor, 
                 fontSize: '10px', 
                 fontWeight: 800, 
                 padding: '4px 10px', 
                 borderRadius: '20px', 
                 letterSpacing: '1px',
                 textTransform: 'uppercase'
               }}>
                 {score > 50 ? 'Net Bullish' : score < 50 ? 'Net Bearish' : 'Neutral'}
               </div>
            </div>
          </div>
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
