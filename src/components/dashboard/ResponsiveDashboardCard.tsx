import React from "react";
import { LucideIcon } from "lucide-react";
import MiniChart from "./MiniChart";

interface ResponsiveDashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "primary" | "secondary" | "success" | "warning";
  onClick?: () => void;
  showChart?: boolean;
  chartData?: Array<{ value: number; label?: string }>;
}

const ResponsiveDashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "primary",
  onClick,
  showChart = false,
  chartData = [],
}: ResponsiveDashboardCardProps) => {
  const getCardClasses = () => {
    const baseClasses =
      "relative overflow-hidden rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 ease-out h-full flex flex-col";
    const interactiveClasses = onClick
      ? "cursor-pointer hover:transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
      : "";

    let variantClasses = "";
    switch (variant) {
      case "primary":
        variantClasses =
          "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25";
        break;
      case "secondary":
        variantClasses =
          "bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-500/25";
        break;
      case "success":
        variantClasses =
          "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25";
        break;
      case "warning":
        variantClasses =
          "bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25";
        break;
    }

    return `${baseClasses} ${variantClasses} ${interactiveClasses}`;
  };

  const getIconContainerClass = () => {
    return "flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center shadow-sm border border-white/20 transition-all duration-300 ease-out hover:bg-white/30";
  };

  return (
    <div
      className={getCardClasses()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1 min-w-0 mr-2">
          <p className="text-white/90 text-xs md:text-sm font-medium line-clamp-2 leading-tight">
            {title}
          </p>
        </div>
        <div className={getIconContainerClass()}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>

      {/* Valor principal */}
      <div className="mb-2 md:mb-3 flex-grow">
        <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-bold leading-none tracking-tight">
          {typeof value === "string" && value.length > 10 ? (
            <span className="text-lg md:text-xl lg:text-2xl">{value}</span>
          ) : (
            value
          )}
        </h3>
      </div>

      {/* Trend e Subtitle em linha */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        {subtitle && (
          <p className="text-white/80 text-xs md:text-sm font-medium flex-1 line-clamp-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center ml-2">
            <span
              className={`text-xs md:text-sm font-bold flex items-center gap-1 ${
                trend.isPositive ? "text-green-200" : "text-red-200"
              }`}
            >
              {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>

      {/* Mini-gráfico - apenas em telas maiores */}
      {showChart && chartData.length > 0 && (
        <div className="hidden md:block mb-3">
          <MiniChart
            data={chartData}
            type="area"
            color="rgba(255, 255, 255, 0.8)"
            height={24}
            isPositive={trend?.isPositive}
          />
        </div>
      )}

      {/* Progress bar para trend */}
      {trend && (
        <div className="w-full h-1.5 md:h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              trend.isPositive
                ? "bg-gradient-to-r from-green-300 to-emerald-400"
                : "bg-gradient-to-r from-red-300 to-rose-400"
            }`}
            style={{
              width: `${Math.min(Math.abs(trend.value), 100)}%`,
            }}
          />
        </div>
      )}

      {/* Click indicator - apenas em desktop */}
      {onClick && (
        <div className="absolute top-3 right-3 opacity-0 hover:opacity-100 transition-opacity duration-200 hidden md:block">
          <div className="bg-white/20 rounded-full p-1">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Overlay Hover Effect */}
      {onClick && (
        <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-all duration-300 rounded-xl md:rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};

export default ResponsiveDashboardCard;
