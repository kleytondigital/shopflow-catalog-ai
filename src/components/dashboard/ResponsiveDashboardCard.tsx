
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
  const getCardClass = () => {
    const baseClasses = "card-modern-dashboard";
    const variantClasses = {
      primary: 'card-variant-primary',
      secondary: 'card-variant-secondary', 
      success: 'card-variant-success',
      warning: 'card-variant-warning'
    };
    
    return `${baseClasses} ${variantClasses[variant]}`;
  };

  const getIconContainerClass = () => {
    return "icon-container-modern";
  };

  return (
    <div 
      className={`${getCardClass()} ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''} 
                  transition-all duration-300 ease-out transform-gpu touch-target`}
      onClick={onClick}
    >
      {/* Header com título e ícone */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1 min-w-0">
          <p className="card-title-text truncate">
            {title}
          </p>
        </div>
        <div className={getIconContainerClass()}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>

      {/* Valor principal e trend */}
      <div className="flex items-end justify-between mb-2 md:mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="card-value-text truncate">
            {value}
          </h3>
        </div>
        {trend && (
          <div className="flex items-center ml-3">
            <span className={`card-trend-text ${
              trend.isPositive ? 'text-green-200' : 'text-red-200'
            }`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="card-subtitle-text truncate mb-3 md:mb-4">
          {subtitle}
        </p>
      )}
      
      {/* Progress bar para trend */}
      {trend && (
        <div className="card-progress-container">
          <div 
            className={`card-progress-bar ${
              trend.isPositive ? 'bg-green-300' : 'bg-red-300'
            }`}
            style={{ 
              width: `${Math.min(Math.abs(trend.value), 100)}%`,
              transition: 'width 0.6s ease-out'
            }}
          />
        </div>
      )}

      {/* Efeito de hover overlay */}
      {onClick && (
        <div className="card-hover-overlay" />
      )}
    </div>
  );
};

export default ResponsiveDashboardCard;
