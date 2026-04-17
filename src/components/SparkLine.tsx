import React from 'react';
import { AreaChart, Area, Tooltip, YAxis } from 'recharts';

interface SparkLineProps {
  data: { date: string; value: number }[];
  positive?: boolean;
  height?: number;
}

const sparkTooltipFormatter = (v: any) => [v.toFixed(4), 'Price'];
const sparkLabelFormatter = (l: any) => l;

const SparkLine: React.FC<SparkLineProps> = ({ data, positive = true, height = 60 }) => {
  const color = positive ? '#3b82f6' : '#ef4444';

  return (
    <div style={{ width: '100%', minWidth: '100px', height, position: 'relative', overflow: 'hidden' }}>
      <AreaChart width={120} height={height} data={data} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id={`spark-${positive ? 'bull' : 'bear'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={['auto', 'auto']} hide />
        <Tooltip
          contentStyle={{ background: '#0f1623', border: '1px solid #1e2d48', borderRadius: 6, fontSize: 11 }}
          formatter={sparkTooltipFormatter}
          labelFormatter={sparkLabelFormatter}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${positive ? 'bull' : 'bear'})`}
          dot={false}
          activeDot={{ r: 3, fill: color }}
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  );
};

export default SparkLine;
