import React, { useEffect, useRef } from 'react';

const MyfxbookWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear out any old instances
    containerRef.current.innerHTML = '';

    // 1. Create the Link
    const linkDiv = document.createElement('div');
    linkDiv.style.fontSize = '10px';
    linkDiv.innerHTML = `
      <a href="https://www.myfxbook.com" title="" class="myfxbookLink" target="_self" rel="noopener" style="color: #94a3b8; text-decoration: none;">
        Powered by Myfxbook.com
      </a>
    `;

    // 2. Load the Script
    const script = document.createElement('script');
    script.className = "powered";
    script.type = "text/javascript";
    script.src = "https://widgets.myfxbook.com/scripts/fxOutlook.js?type=1&symbols=,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20,21,22,23,24,25,26,27,28,29,31,34,36,37,38,40,41,42,43,45,46,47,48,49,50,51,103,107,131,137,1233,1234,1236,1245,1246,1247,1815,1863,1893,2012,2076,2090,2114,2115,2119,2521,2603,2872,3005,3240,3473,5079,5435,5779";
    
    // 3. Trigger the Widget
    const runScript = document.createElement('script');
    runScript.type = "text/javascript";
    runScript.innerHTML = "if(typeof showOutlookWidget === 'function') { showOutlookWidget(); } else { setTimeout(function(){ if(typeof showOutlookWidget === 'function') showOutlookWidget(); }, 1000); }";

    containerRef.current.appendChild(script);
    containerRef.current.appendChild(linkDiv);
    containerRef.current.appendChild(runScript);

  }, []);

  return (
    <div className="myfxbook-widget-wrapper" style={{ width: '100%', minHeight: '550px' }}>
      <div ref={containerRef} id="myfxbook-original-container" />
    </div>
  );
};

export default MyfxbookWidget;
