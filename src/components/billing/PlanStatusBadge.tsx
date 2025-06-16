
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Clock, AlertCircle, Zap } from 'lucide-react';

export const PlanStatusBadge = () => {
  const { profile } = useAuth();
  const { subscription, loading, isTrialing, getTrialDaysLeft, getPlanDisplayName } = useSubscription();

  if (profile?.role === 'superadmin') {
    return (
      <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">
        <Crown className="h-3 w-3 mr-1" />
        Superadmin
      </Badge>
    );
  }

  if (loading) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600">
        Carregando...
      </Badge>
    );
  }

  if (!subscription) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600">
        <AlertCircle className="h-3 w-3 mr-1" />
        Sem Plano
      </Badge>
    );
  }

  const planName = getPlanDisplayName();
  const trialDays = getTrialDaysLeft();

  if (isTrialing()) {
    return (
      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
        <Clock className="h-3 w-3 mr-1" />
        {planName} (Trial - {trialDays}d)
      </Badge>
    );
  }

  if (subscription.status === 'active') {
    return (
      <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
        <Zap className="h-3 w-3 mr-1" />
        {planName}
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
      <AlertCircle className="h-3 w-3 mr-1" />
      {planName} (Inativo)
    </Badge>
  );
};
