
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
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

const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'primary',
  onClick 
}: DashboardCardProps) => {
  const getCardClass = () => {
    switch (variant) {
      case 'primary':
        return 'card-gradient-primary';
      case 'secondary':
        return 'card-gradient-secondary';
      case 'success':
        return 'card-gradient-success';
      case 'warning':
        return 'card-gradient-warning';
      default:
        return 'card-gradient-primary';
    }
  };

  return (
    <div 
      className={`${getCardClass()} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            {trend && (
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-white/70 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className="ml-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Icon size={24} className="text-white" />
          </div>
        </div>
      </div>
      
      {trend && (
        <div className="mt-4">
          <div className="progress-bar bg-white/20">
            <div 
              className={`progress-fill ${trend.isPositive ? 'bg-green-300' : 'bg-red-300'}`}
              style={{ width: `${Math.min(Math.abs(trend.value), 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
