
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, QrCode, FileText, MessageCircle } from 'lucide-react';
import { useCheckoutContext } from '../context/CheckoutProvider';

const PaymentMethodSelector: React.FC = () => {
  const {
    paymentMethod,
    setPaymentMethod,
    availablePaymentMethods,
    checkoutType
  } = useCheckoutContext();

  // Se não há métodos disponíveis ou é checkout apenas WhatsApp, não mostrar
  if (!availablePaymentMethods.length || checkoutType === 'whatsapp_only') {
    return null;
  }

  const getIcon = (iconName: string) => {
    const icons = {
      MessageCircle,
      QrCode,
      CreditCard,
      FileText
    };
    return icons[iconName as keyof typeof icons] || CreditCard;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Método de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="space-y-4"
        >
          {availablePaymentMethods.map((method) => {
            const IconComponent = getIcon(method.icon);
            return (
              <div
                key={method.id}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                  <IconComponent className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-medium">{method.name}</div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
