
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface BenefitPropagationIndicatorProps {
  benefitName: string;
  plansAffected: number;
  storesAffected: number;
  totalStores: number;
  lastUpdated?: Date;
}

export const BenefitPropagationIndicator: React.FC<BenefitPropagationIndicatorProps> = ({
  benefitName,
  plansAffected,
  storesAffected,
  totalStores,
  lastUpdated
}) => {
  const propagationRate = totalStores > 0 ? (storesAffected / totalStores) * 100 : 0;
  
  const getStatusIcon = () => {
    if (propagationRate >= 90) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (propagationRate >= 50) {
      return <Activity className="h-4 w-4 text-blue-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    if (propagationRate >= 90) return 'text-green-600';
    if (propagationRate >= 50) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium text-sm">{benefitName}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <Progress value={propagationRate} className="h-2" />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {storesAffected}/{totalStores}
              </Badge>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {propagationRate.toFixed(0)}%
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p><strong>{benefitName}</strong></p>
            <p>Planos afetados: {plansAffected}</p>
            <p>Lojas impactadas: {storesAffected} de {totalStores}</p>
            <p>Taxa de propagação: {propagationRate.toFixed(1)}%</p>
            {lastUpdated && (
              <p className="text-xs opacity-75">
                Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
