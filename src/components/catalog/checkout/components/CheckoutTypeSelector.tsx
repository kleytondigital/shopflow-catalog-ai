
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MessageCircle, CreditCard, Smartphone } from 'lucide-react';
import { useCheckoutContext } from '../context/CheckoutProvider';

const CheckoutTypeSelector: React.FC = () => {
  const {
    checkoutType,
    setCheckoutType,
    isWhatsappOnly,
    canUseOnlinePayment,
    hasWhatsAppConfigured,
    settings
  } = useCheckoutContext();

  // Se só tem uma opção disponível, não mostrar o seletor
  const availableTypes = [];
  
  if (hasWhatsAppConfigured) {
    availableTypes.push('whatsapp_only');
  }
  
  if (canUseOnlinePayment) {
    availableTypes.push('online_payment');
  }

  // Se só tem uma opção ou configurado para forçar um tipo específico
  if (availableTypes.length <= 1 || isWhatsappOnly) {
    return null;
  }

  const checkoutTypeConfig = settings?.checkout_type || 'both';
  
  // Se configurado para apenas um tipo específico, não mostrar seletor
  if (checkoutTypeConfig === 'whatsapp' || checkoutTypeConfig === 'online') {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Como você gostaria de finalizar seu pedido?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={checkoutType}
          onValueChange={(value: 'whatsapp_only' | 'online_payment') => setCheckoutType(value)}
          className="space-y-4"
        >
          {hasWhatsAppConfigured && (
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="whatsapp_only" id="whatsapp" />
              <Label htmlFor="whatsapp" className="flex items-center gap-3 flex-1 cursor-pointer">
                <MessageCircle className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-medium">Finalizar via WhatsApp</div>
                  <div className="text-sm text-gray-600">
                    Envie seu pedido direto para nosso WhatsApp e converse com nossa equipe
                  </div>
                </div>
              </Label>
            </div>
          )}
          
          {canUseOnlinePayment && (
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="online_payment" id="online" />
              <Label htmlFor="online" className="flex items-center gap-3 flex-1 cursor-pointer">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-medium">Pagamento Online</div>
                  <div className="text-sm text-gray-600">
                    Pague agora com PIX, cartão ou boleto de forma segura
                  </div>
                </div>
              </Label>
            </div>
          )}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default CheckoutTypeSelector;
