import React, { useEffect, useRef } from 'react';

const MyfxbookWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear the container
    containerRef.current.innerHTML = '';

    // 1. Target Div for the Widget
    const widgetBox = document.createElement('div');
    
    // 2. The script must be INSIDE a div according to the user's code
    const script = document.createElement('script');
    script.className = "powered";
    script.type = "text/javascript";
    script.src = "https://widgets.myfxbook.com/scripts/fxOutlook.js?type=1&symbols=,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20,21,22,23,24,25,26,27,28,29,31,34,36,37,38,40,41,42,43,45,46,47,48,49,50,51,103,107,131,137,1233,1234,1236,1245,1246,1247,1815,1863,1893,2012,2076,2090,2114,2115,2119,2521,2603,2872,3005,3240,3473,5079,5435,5779";
    widgetBox.appendChild(script);

    // 3. Attribution Link
    const attrDiv = document.createElement('div');
    attrDiv.style.fontSize = '10px';
    attrDiv.style.marginTop = '4px';
    attrDiv.innerHTML = `
      <a href="https://www.myfxbook.com" title="" class="myfxbookLink" target="_self" rel="noopener" style="color: #94a3b8; text-decoration: none;">
        Powered by Myfxbook.com
      </a>
    `;

    // 4. Trigger Script
    // We use a small timeout to ensure the script has finished loading/registering its global function
    const trigger = document.createElement('script');
    trigger.type = "text/javascript";
    trigger.text = `
      function loadWidget() {
        if(typeof showOutlookWidget === 'function') {
          showOutlookWidget();
        } else {
          setTimeout(loadWidget, 200);
        }
      }
      loadWidget();
    `;

    // Final Assembly
    containerRef.current.appendChild(widgetBox);
    containerRef.current.appendChild(attrDiv);
    containerRef.current.appendChild(trigger);

  }, []);

  return (
    <div className="myfxbook-widget-outer" style={{ width: '100%', minHeight: '650px', background: 'transparent' }}>
      <div ref={containerRef} />
    </div>
  );
};

export default MyfxbookWidget;
