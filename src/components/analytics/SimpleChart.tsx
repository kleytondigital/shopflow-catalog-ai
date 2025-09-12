import React from "react";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  type?: "bar" | "line";
  height?: number;
  showValues?: boolean;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  type = "bar",
  height = 200,
  showValues = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const percentage =
            range > 0 ? ((item.value - minValue) / range) * 100 : 50;
          const barHeight = (percentage / 100) * (height - 40);

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              {showValues && (
                <div className="text-xs text-gray-600 mb-1">
                  {item.value.toLocaleString()}
                </div>
              )}
              <div
                className={`w-full rounded-t ${
                  type === "line" ? "rounded-full" : "rounded-t"
                } transition-all duration-300 hover:opacity-80`}
                style={{
                  height: Math.max(barHeight, 4),
                  backgroundColor: item.color || "#3B82F6",
                  minHeight: "4px",
                }}
                title={`${item.label}: ${item.value.toLocaleString()}`}
              />
              <div className="text-xs text-gray-500 mt-2 text-center">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

