
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlanBenefitsManager } from '@/components/admin/PlanBenefitsManager';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

export const PlanBenefitsSelector = () => {
  const { plans, loading } = useSubscriptionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Carregando planos...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um plano para configurar os benefícios" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - {plan.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPlan && (
        <PlanBenefitsManager
          planId={selectedPlan.id}
          planName={selectedPlan.name}
        />
      )}
    </div>
  );
};
