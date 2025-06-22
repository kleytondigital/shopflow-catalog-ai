
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ResponsiveDashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  onClick?: () => void;
}

const ResponsiveDashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'primary',
  onClick 
}: ResponsiveDashboardCardProps) => {
  return (
    <div 
      className={`dashboard-card-${variant} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          <p className="text-white/90 text-sm font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {title}
          </p>
        </div>
        <div className="dashboard-card-icon">
          <Icon size={28} className="text-white drop-shadow-sm" />
        </div>
      </div>

      {/* Valor principal e trend */}
      <div className="flex items-end justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-4xl font-bold leading-none tracking-tight overflow-hidden text-ellipsis whitespace-nowrap drop-shadow-sm">
            {value}
          </h3>
        </div>
        {trend && (
          <div className="flex items-center ml-3">
            <span className={`text-sm font-bold drop-shadow-sm ${
              trend.isPositive ? 'text-green-400/90' : 'text-red-400/90'
            }`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-white/80 text-sm font-medium mb-5 overflow-hidden text-ellipsis whitespace-nowrap">
          {subtitle}
        </p>
      )}
      
      {/* Progress bar para trend */}
      {trend && (
        <div className="dashboard-progress-bar">
          <div 
            className={`dashboard-progress-fill ${
              trend.isPositive ? 'dashboard-progress-positive' : 'dashboard-progress-negative'
            }`}
            style={{ 
              width: `${Math.min(Math.abs(trend.value), 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ResponsiveDashboardCard;
