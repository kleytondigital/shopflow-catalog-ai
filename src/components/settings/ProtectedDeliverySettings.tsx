
import React from 'react';
import { BenefitGate } from '@/components/billing/BenefitGate';
import DeliverySettings from './DeliverySettings';

const ProtectedDeliverySettings = () => {
  return (
    <BenefitGate 
      benefitKey="shipping_calculator"
      customMessage="As configurações avançadas de entrega estão disponíveis apenas no plano Premium."
      silent={false}
    >
      <DeliverySettings />
    </BenefitGate>
  );
};

export default ProtectedDeliverySettings;
