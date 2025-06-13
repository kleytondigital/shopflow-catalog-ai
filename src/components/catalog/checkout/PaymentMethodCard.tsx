
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface PaymentMethodCardProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethods,
  selectedMethod,
  onMethodChange
}) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold">4</span>
          </div>
          Método de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange} className="space-y-3">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <div key={method.id} className="flex items-center space-x-4 p-4 border-2 rounded-xl hover:bg-blue-50 hover:border-primary transition-all cursor-pointer">
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex items-center gap-3">
                  <IconComponent size={20} className="text-primary" />
                  <label htmlFor={method.id} className="font-semibold cursor-pointer text-lg">
                    {method.name}
                  </label>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;
