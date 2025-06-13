
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface ShippingMethodCardProps {
  shippingMethods: ShippingMethod[];
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const ShippingMethodCard: React.FC<ShippingMethodCardProps> = ({
  shippingMethods,
  selectedMethod,
  onMethodChange
}) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold">2</span>
          </div>
          Método de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange} className="space-y-3">
          {shippingMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <div key={method.id} className="flex items-center space-x-4 p-4 border-2 rounded-xl hover:bg-blue-50 hover:border-primary transition-all cursor-pointer">
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <IconComponent size={20} className="text-primary" />
                    <label htmlFor={method.id} className="font-semibold cursor-pointer text-lg">
                      {method.name}
                    </label>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      method.cost === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {method.cost === 0 ? 'Grátis' : `R$ ${method.cost.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ShippingMethodCard;
