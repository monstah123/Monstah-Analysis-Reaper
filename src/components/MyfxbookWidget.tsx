import React, { useEffect, useRef } from 'react';

const MyfxbookWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear the container
    containerRef.current.innerHTML = '';

    // Create a container for the widget to prevent global side-effects from nuking the app
    const widgetBox = document.createElement('div');
    widgetBox.id = "myfxbook_outlook_wrapper";
    
    // 1. DIV with Script (Exactly as provided)
    const scriptDiv = document.createElement('div');
    const script = document.createElement('script');
    script.className = "powered";
    script.type = "text/javascript";
    script.src = "https://widgets.myfxbook.com/scripts/fxOutlook.js?type=0&symbols=,";
    scriptDiv.appendChild(script);

    // 2. Attribution Link (Exactly as provided)
    const attrDiv = document.createElement('div');
    attrDiv.style.fontSize = '10px';
    attrDiv.innerHTML = `
      <a href="https://www.myfxbook.com" title="" class="myfxbookLink" target="_self" rel="noopener" style="color: #94a3b8; text-decoration: none;">
        Powered by Myfxbook.com
      </a>
    `;

    // 3. Trigger Script (Exactly as provided)
    const trigger = document.createElement('script');
    trigger.type = "text/javascript";
    trigger.text = "if(typeof showOutlookWidget === 'function') { showOutlookWidget(); } else { setTimeout(function(){ if(typeof showOutlookWidget === 'function') showOutlookWidget(); }, 1500); }";

    // Append to wrapper
    widgetBox.appendChild(scriptDiv);
    widgetBox.appendChild(attrDiv);
    widgetBox.appendChild(trigger);
    
    containerRef.current.appendChild(widgetBox);

  }, []);

  return (
    <div className="myfxbook-widget-outer" style={{ width: '100%', minHeight: '600px', background: '#0f1623', borderRadius: '8px' }}>
      <div ref={containerRef} />
    </div>
  );
};

export default MyfxbookWidget;
