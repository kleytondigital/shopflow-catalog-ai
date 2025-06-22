
import React from 'react';
import { LucideIcon } from 'lucide-react';

// Componente legado - redireciona para o novo AppleDashboardCard
import AppleDashboardCard from './AppleDashboardCard';

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
  icon, 
  trend, 
  variant = 'primary',
  onClick 
}: DashboardCardProps) => {
  // Mapear variantes antigas para as novas
  const mapVariant = (oldVariant: string) => {
    switch (oldVariant) {
      case 'primary': return 'blue';
      case 'secondary': return 'purple';
      case 'success': return 'green';
      case 'warning': return 'orange';
      default: return 'blue';
    }
  };

  return (
    <AppleDashboardCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={icon}
      trend={trend}
      variant={mapVariant(variant)}
      onClick={onClick}
    />
  );
};

export default DashboardCard;
