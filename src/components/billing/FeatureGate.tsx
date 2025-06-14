
import React from 'react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { PlanUpgradeModal } from './PlanUpgradeModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradeModal?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradeModal = false
}) => {
  const { hasFeature, subscription } = usePlanPermissions();
  const [showModal, setShowModal] = React.useState(false);

  const hasAccess = hasFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const planName = subscription?.plan.type === 'basic' ? 'Premium' : 'superior';

  return (
    <>
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Funcionalidade Premium</h3>
          <p className="text-muted-foreground mb-4">
            Esta funcionalidade está disponível apenas no plano {planName}.
          </p>
          <Button onClick={() => setShowModal(true)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Fazer Upgrade
          </Button>
        </CardContent>
      </Card>

      {showUpgradeModal && (
        <PlanUpgradeModal 
          open={showModal}
          onOpenChange={setShowModal}
        />
      )}
    </>
  );
};
