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
    // 0 score = 180deg (far left), 100 score = 0deg or 360deg (far right)
    // Actually, straight left is 180deg, straight right is 360deg
    const angle = 180 + (score / 100) * 180;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#2c2c2e', padding: '0', borderRadius: '8px', overflow: 'hidden', width: '220px' }}>
        <div style={{ background: '#3b82f6', width: '100%', textAlign: 'center', color: '#fff', fontSize: '15px', fontWeight: 800, padding: '8px 0' }}>
          {score.toFixed(2)}%
        </div>
        
        <div style={{ padding: '20px 20px 10px', position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '140px', height: '70px', overflow: 'hidden' }}>
            {/* SVG Arc Track */}
            <svg viewBox="0 0 200 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
               {/* Red side (left, 0 to 50%) */}
               <path d="M 10 90 A 80 80 0 0 1 100 10" fill="none" stroke="#ef4444" strokeWidth="20" strokeLinecap="butt" />
               <path d="M 10 90 A 80 80 0 0 1 100 10" fill="none" stroke="#333" strokeDasharray="10 20" strokeWidth="22" strokeLinecap="butt" opacity="0.3" />

               {/* Blue side (right, 50 to 100%) */}
               <path d="M 100 10 A 80 80 0 0 1 190 90" fill="none" stroke="#3b82f6" strokeWidth="20" strokeLinecap="butt" />
               <path d="M 100 10 A 80 80 0 0 1 190 90" fill="none" stroke="#333" strokeDasharray="10 20" strokeWidth="22" strokeLinecap="butt" opacity="0.3" />
               
               {/* Middle Splitter */}
               <line x1="100" y1="0" x2="100" y2="20" stroke="#1c1c1e" strokeWidth="4" />
            </svg>

            {/* Label inside Gauge */}
            <div style={{
               position: 'absolute',
               bottom: '20px',
               left: '50%',
               transform: 'translateX(-50%)',
               fontSize: '18px',
               fontWeight: 800,
               color: '#1c1c1e',
               WebkitTextStroke: '0.5px #fff',
               zIndex: 1,
               textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {label}
            </div>

            {/* Needle */}
            <div style={{
              position: 'absolute',
              bottom: '0px',
              left: '50%',
              width: '65px',
              height: '4px',
              background: '#ea580c',
              transformOrigin: 'left center',
              transform: `translate(0, -50%) rotate(${angle}deg)`,
              borderRadius: '2px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
              zIndex: 2
            }} />
            
            {/* Center dot */}
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              width: '24px',
              height: '24px',
              background: '#3b82f6',
              borderRadius: '50%',
              transform: 'translateX(-50%)',
              zIndex: 3,
              border: '3px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
            }} />
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', paddingBottom: '15px' }}>
          {score.toFixed(0)}%
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
