
import React from 'react';
import { BenefitGate } from '@/components/billing/BenefitGate';
import WhatsAppSettings from './WhatsAppSettings';

const ProtectedWhatsAppSettings = () => {
  return (
    <BenefitGate 
      benefitKey="whatsapp_integration"
      customMessage="A integração completa com WhatsApp está disponível apenas no plano Premium."
      silent={false}
    >
      <WhatsAppSettings />
    </BenefitGate>
  );
};

export default ProtectedWhatsAppSettings;
