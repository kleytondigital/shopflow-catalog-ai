
import React from 'react';
import { BenefitGate } from '@/components/billing/BenefitGate';
import AppLayout from '@/components/layout/AppLayout';

const ProtectedDeliveries = () => {
  const breadcrumbs = [
    { href: '/', label: 'Dashboard' },
    { label: 'Entrega', current: true }
  ];

  return (
    <AppLayout 
      title="Gestão de Entregas"
      subtitle="Configure opções de frete e entrega"
      breadcrumbs={breadcrumbs}
    >
      <BenefitGate 
        benefitKey="shipping_calculator"
        customMessage="A calculadora de frete está disponível apenas no plano Premium. Automatize o cálculo de frete para seus clientes!"
      >
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Calculadora de Frete</h3>
            <p className="text-gray-600 mb-4">
              Configure as opções de entrega e cálculo automático de frete para seus clientes.
            </p>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Correios</h4>
                <p className="text-sm text-gray-600">Integração com API dos Correios para cálculo automático</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Frete Fixo</h4>
                <p className="text-sm text-gray-600">Configure um valor fixo para toda sua região</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Retirada na Loja</h4>
                <p className="text-sm text-gray-600">Permita que clientes retirem pedidos na sua loja</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Zonas de Entrega</h3>
            <p className="text-gray-600 mb-4">
              Defina diferentes regiões e valores de entrega para otimizar seus custos logísticos.
            </p>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-gray-600">Configure suas zonas de entrega e valores específicos por região</p>
            </div>
          </div>
        </div>
      </BenefitGate>
    </AppLayout>
  );
};

export default ProtectedDeliveries;
