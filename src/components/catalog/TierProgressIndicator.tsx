
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface TierProgressIndicatorProps {
  currentTier?: string;
  nextTier?: string;
  progress?: number;
  className?: string;
}

const TierProgressIndicator: React.FC<TierProgressIndicatorProps> = ({
  currentTier = "Varejo",
  nextTier,
  progress = 0,
  className = ""
}) => {
  if (!nextTier) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="text-xs">
          {currentTier}
        </Badge>
        <span className="text-xs text-gray-500">Nível máximo atingido</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline">{currentTier}</Badge>
        <span className="text-gray-500">→ {nextTier}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-gray-500">
        {Math.round(progress)}% para próximo nível
      </p>
    </div>
  );
};

export default TierProgressIndicator;
