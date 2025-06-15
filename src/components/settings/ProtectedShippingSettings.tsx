
import React from 'react';
import { BenefitGate } from '@/components/billing/BenefitGate';
import ShippingSettings from './ShippingSettings';

const ProtectedShippingSettings = () => {
  return (
    <BenefitGate 
      benefitKey="shipping_calculator"
      customMessage="A calculadora de frete automática está disponível apenas no plano Premium."
      silent={false}
    >
      <ShippingSettings />
    </BenefitGate>
  );
};

export default ProtectedShippingSettings;
