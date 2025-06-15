
import React from 'react';
import { useSubscriptionPlans, SubscriptionPlan } from '@/hooks/useSubscriptionPlans';
import { useAuth } from '@/hooks/useAuth';
import { useStoreSubscription } from '@/hooks/useStoreSubscription';
import SmartPlanUpgradeModal from './SmartPlanUpgradeModal';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan: SubscriptionPlan | null;
}

const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  targetPlan
}) => {
  const { user } = useAuth();
  const { getPlanById } = useSubscriptionPlans();
  const { subscription, loading: subscriptionLoading } = useStoreSubscription();

  if (!isOpen) return null;

  return (
    <SmartPlanUpgradeModal
      isOpen={isOpen}
      onClose={onClose}
      selectedPlan={targetPlan}
      currentPlan={subscription?.plan || null}
    />
  );
};

export default PlanUpgradeModal;
