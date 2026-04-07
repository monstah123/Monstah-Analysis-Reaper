import React, { useEffect, useRef } from 'react';

const ReaperSnatcher: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const snatcherRef = useRef<any>(null);

  useEffect(() => {
    // 1. Inject the Myfxbook Script
    const script = document.createElement('script');
    script.className = 'powered';
    script.type = 'text/javascript';
    script.src = 'https://widgets.myfxbook.com/scripts/fxOutlook.js?type=1&symbols=,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20,21,22,23,24,25,26,27,28,29,31,34,36,37,38,40,41,42,43,45,46,47,48,49,50,51,103,107,131,137,1233,1234,1236,1245,1246,1247,1815,1863,1893,2012,2076,2090,2114,2115,2119,2521,2603,2872,3005,3240,3473,5079,5435,5779';
    
    const initializer = document.createElement('script');
    initializer.type = 'text/javascript';
    initializer.innerHTML = 'if(typeof showOutlookWidget === "function") { showOutlookWidget(); }';

    if (containerRef.current) {
      containerRef.current.appendChild(script);
      containerRef.current.appendChild(initializer);
    }

    // 2. The "Reaper Snatcher" Logic
    // Periodically checks the rendered table for new retail sentiment numbers
    const snatchData = () => {
      if (!containerRef.current) return;
      
      const rows = containerRef.current.querySelectorAll('tr');
      const batch: Record<string, { long: number, short: number }> = {};
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const rawSymbol = cells[0].innerText.trim().replace('/', ''); 
          const shortText = cells[2].innerText.replace('%', '').trim();
          // const longText = cells[3]?.innerText.replace('%', '').trim(); 

          if (rawSymbol && shortText) {
            const shortVal = parseInt(shortText);
            if (!isNaN(shortVal)) {
              batch[rawSymbol] = { 
                short: shortVal, 
                long: 100 - shortVal 
              };
            }
          }
        }
      });

      // Update the main app context if we found valid data
      if (Object.keys(batch).length > 0) {
        // Since we are in the bridge, we'll manually dispatch a custom event or update context
        window.dispatchEvent(new CustomEvent('myfxbook_sync', { detail: batch }));
      }
    };

    snatcherRef.current = setInterval(snatchData, 10000); // Fast snatch 10s

    return () => {
      if (snatcherRef.current) clearInterval(snatcherRef.current);
    };
  }, []);

  return (
    <div id="reaper_snatcher_stealth" ref={containerRef} style={{ display: 'none' }}></div>
  );
};

export default ReaperSnatcher;
