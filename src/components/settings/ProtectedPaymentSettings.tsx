
import React from 'react';
import { BenefitGate } from '@/components/billing/BenefitGate';
import PaymentSettings from './PaymentSettings';

const ProtectedPaymentSettings = () => {
  return (
    <BenefitGate 
      benefitKey="payment_credit_card"
      customMessage="As configurações avançadas de pagamento (cartão de crédito) estão disponíveis apenas no plano Premium."
      silent={false}
    >
      <PaymentSettings />
    </BenefitGate>
  );
};

export default ProtectedPaymentSettings;
