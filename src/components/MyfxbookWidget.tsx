import React, { useEffect, useRef } from 'react';

/**
 * MyfxbookWidget: Renders the official Myfxbook Outlook table visually.
 */
const MyfxbookWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Inject the Myfxbook Script
    const script = document.createElement('script');
    script.className = 'powered';
    script.type = 'text/javascript';
    script.src = 'https://widgets.myfxbook.com/scripts/fxOutlook.js?type=1&symbols=,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20,21,22,23,24,25,26,27,28,29,31,34,36,37,38,40,41,42,43,45,46,47,48,49,50,51,103,107,131,137,1233,1234,1236,1245,1246,1247,1815,1863,1893,2012,2076,2090,2114,2115,2119,2521,2603,2872,3005,3240,3473,5079,5435,5779';
    script.onerror = () => console.warn('[MyfxbookWidget] Script failed to load');
    
    // Run initializer only after script loads
    script.onload = () => {
      try {
        if (typeof (window as any).showOutlookWidget === 'function') {
          (window as any).showOutlookWidget();
        }
      } catch (e) {
        console.warn('[MyfxbookWidget] Init error:', e);
      }
    };

    containerRef.current.innerHTML = ''; // Clear previous
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div ref={containerRef} className="myfxbook-widget-wrapper">
      {/* Table will render here */}
    </div>
  );
};

export default MyfxbookWidget;
