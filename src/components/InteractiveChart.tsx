import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle } from 'lightweight-charts';

interface ChartProps {
  data: { date: string; value: number }[];
  positive?: boolean;
}

const InteractiveChart: React.FC<ChartProps> = ({ data, positive = true }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const color = positive ? '#3b82f6' : '#ef4444';
  const bgColor = '#090c12';

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    const parseDateToUnix = (dateStr: string) => {
      // Basic parse: "Jan 1" string mapping to current year for mock data
      const d = new Date(`${dateStr}, ${new Date().getFullYear()}`);
      return Math.floor(d.getTime() / 1000);
    };

    const formattedData = data.map((d) => {
      // if it's the mock string format ("Jan 1") we handle it, if unix we keep it
      // For lightweight-charts, time must be Unix timestamp in seconds or a YYYY-MM-DD string
      let timeStr;
      if (d.date.includes('-')) { // e.g. 2026-03-31
        timeStr = d.date;
      } else {
        timeStr = new Date(parseDateToUnix(d.date) * 1000).toISOString().split('T')[0];
      }
      return { time: timeStr, value: d.value };
    }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // Deduplicate exact same dates if necessary
    const uniqueData = Array.from(new Map(formattedData.map(item => [item.time, item])).values());

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: '#8b9ab8',
      },
      grid: {
        vertLines: { color: '#1e2d48', style: LineStyle.Dotted },
        horzLines: { color: '#1e2d48', style: LineStyle.Dotted },
      },
      crosshair: {
        vertLine: { color: '#6366f1', labelBackgroundColor: '#6366f1' },
        horzLine: { color: '#6366f1', labelBackgroundColor: '#6366f1' },
      },
      rightPriceScale: {
        borderColor: '#1e2d48',
      },
      timeScale: {
        borderColor: '#1e2d48',
      },
      handleScroll: {
        vertTouchDrag: false,
      },
      autoSize: true, // Requires installing the package or just responsive resizing
    });

    // We use Area series for a beautiful gradient curve look
    // @ts-ignore
    const areaSeries = chart.addAreaSeries({
      lineColor: color,
      topColor: `${color}80`, // Hex opacity
      bottomColor: `${color}00`,
      lineWidth: 2,
    });

    areaSeries.setData(uniqueData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, color]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default InteractiveChart;
