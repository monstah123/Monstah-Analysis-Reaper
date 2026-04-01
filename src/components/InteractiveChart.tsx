import React, { useEffect, useRef } from 'react';

// Using the TradingView Advanced Real-Time Chart Widget for full candlesticks + tools
interface ChartProps {
  tvSymbol: string;
}

const InteractiveChart: React.FC<ChartProps> = ({ tvSymbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && container.current) {
        new (window as any).TradingView.widget({
          "autosize": true,
          "symbol": tvSymbol,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "container_id": "tradingview_advanced_widget",
          "save_image": false,
          "backgroundColor": "#090c12",
          "gridColor": "rgba(42, 46, 57, 0.06)",
        });
      }
    };
    document.head.appendChild(script);
  }, [tvSymbol]);

  return (
    <div className='tradingview-widget-container' style={{ height: '100%', width: '100%' }}>
      <div id='tradingview_advanced_widget' ref={container} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default InteractiveChart;
