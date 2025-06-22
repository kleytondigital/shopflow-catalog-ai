
import React from 'react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DataPoint {
  value: number;
  label?: string;
}

interface MiniChartProps {
  data: DataPoint[];
  type?: 'line' | 'area';
  color?: string;
  height?: number;
  strokeWidth?: number;
  isPositive?: boolean;
}

const MiniChart: React.FC<MiniChartProps> = ({
  data,
  type = 'line',
  color,
  height = 40,
  strokeWidth = 2,
  isPositive = true
}) => {
  // Determinar cor baseada no trend se não especificada
  const chartColor = color || (isPositive ? '#10b981' : '#ef4444');

  // Dados de exemplo se vazio
  const chartData = data.length > 0 ? data : [
    { value: 20 }, { value: 35 }, { value: 25 }, { value: 45 }, 
    { value: 40 }, { value: 55 }, { value: 60 }
  ];

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColor}
            fill={chartColor}
            fillOpacity={0.2}
            strokeWidth={strokeWidth}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={chartColor}
          strokeWidth={strokeWidth}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MiniChart;
