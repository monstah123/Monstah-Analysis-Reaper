import React, { useEffect, useRef } from 'react';

const MyfxbookWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run this once on mount
    if (!containerRef.current) return;

    // Clear the container to avoid duplicates
    containerRef.current.innerHTML = '';

    // Create the div that Myfxbook script targets
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'myfxbook_outlook_matrix';
    containerRef.current.appendChild(widgetDiv);

    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://widgets.myfxbook.com/scripts/fxOutlook.js?type=1&symbols=1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,31,32,34,35,36,37,38,40,41,42,43,45,46,47,48,49,50,51,103,107,131,137,2012,2076,2119,2521,2603,2872,3005,3240,3473,5079,5435,5779,5953,5954';
    script.className = 'powered';
    script.async = true;

    // Append the script to the target element (or head, but Myfxbook usually wants it near the div)
    containerRef.current.appendChild(script);

    // Add the "Powered by" link as required by Myfxbook
    const attribution = document.createElement('div');
    attribution.style.marginTop = '10px';
    attribution.innerHTML = `
      <a href="https://www.myfxbook.com" title="" class="myfxbookLink" target="_self" rel="noopener" style="color: #94a3b8; text-decoration: none; font-size: 11px; opacity: 0.6;">
        Powered by Myfxbook.com
      </a>
    `;
    containerRef.current.appendChild(attribution);

  }, []);

  return (
    <div className="myfxbook-widget-wrapper" style={{ minHeight: '650px', width: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} />
    </div>
  );
};

export default MyfxbookWidget;
