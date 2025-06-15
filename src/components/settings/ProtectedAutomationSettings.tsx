
import React from 'react';
import { BenefitGate } from '@/components/billing/BenefitGate';
import AutomationSettings from './AutomationSettings';

const ProtectedAutomationSettings = () => {
  return (
    <BenefitGate 
      benefitKey="api_access"
      customMessage="As automações avançadas e integração com N8N estão disponíveis apenas no plano Premium."
      silent={false}
    >
      <AutomationSettings />
    </BenefitGate>
  );
};

export default ProtectedAutomationSettings;
