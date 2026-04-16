import React from 'react';

/**
 * MyfxbookWidget: Renders the official Myfxbook Outlook table visually.
 * Uses an iframe to completely isolate the buggy third-party script from crashing the React component tree via parentNode errors.
 */
const MyfxbookWidget: React.FC = () => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #1a2333;
            color: #f8fafc;
            overflow-y: hidden;
            overflow-x: auto;
          }
          a.myfxbookLink { color: #94a3b8; text-decoration: none; }
          a.myfxbookLink:hover { color: #3b82f6; }
        </style>
      </head>
      <body>
        <div>
            <script class="powered" type="text/javascript"
                    src="https://widgets.myfxbook.com/scripts/fxOutlook.js?type=1&symbols=,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20,21,22,23,24,25,26,27,28,29,31,34,36,37,38,40,41,42,43,45,46,47,48,49,50,51,103,107,131,137,1233,1234,1236,1245,1246,1247,1815,1863,1893,2012,2076,2090,2114,2115,2119,2521,2603,2872,3005,3240,3473,5079,5435,5779"></script>
        </div>
        <script type="text/javascript">
          // Wait for script to load before calling showOutlookWidget
          setTimeout(function() {
            if(typeof showOutlookWidget === "function") {
               showOutlookWidget();
            }
          }, 500);
        </script>
      </body>
    </html>
  `;

  return (
    <div className="myfxbook-widget-wrapper" style={{ width: '100%', height: '550px' }}>
      <iframe
        title="Myfxbook Outlook Widget"
        srcDoc={htmlContent}
        style={{ width: '100%', height: '100%', border: 'none', backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default MyfxbookWidget;
