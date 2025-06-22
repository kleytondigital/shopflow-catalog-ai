
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AppleDashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'blue' | 'green' | 'orange' | 'purple';
  onClick?: () => void;
}

const AppleDashboardCard: React.FC<AppleDashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'blue',
  onClick
}) => {
  return (
    <div 
      className={`apple-metric-card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="apple-metric-header">
        <div className="flex-1">
          <p className="apple-metric-label">{title}</p>
          <h3 className="apple-metric-value">{value}</h3>
          {subtitle && (
            <p className="apple-metric-subtitle">{subtitle}</p>
          )}
        </div>
        <div className={`apple-metric-icon ${variant}`}>
          <Icon size={20} />
        </div>
      </div>
      
      {trend && (
        <div className={`apple-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
          <span>{trend.isPositive ? '↗' : '↘'}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
};

export default AppleDashboardCard;
