
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WhatsAppCheckoutProps {
  whatsappNumber: string;
  onConfirmOrder: () => void;
  isProcessing: boolean;
  customerData: {
    name: string;
    phone: string;
  };
  totalAmount: number;
  itemsCount: number;
}

const WhatsAppCheckout: React.FC<WhatsAppCheckoutProps> = ({
  whatsappNumber,
  onConfirmOrder,
  isProcessing,
  customerData,
  totalAmount,
  itemsCount
}) => {
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return `+55${cleaned}`;
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-white border-green-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg text-green-800">
          <MessageCircle className="h-6 w-6 text-green-600" />
          Finalizar via WhatsApp
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Plano Básico
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3">Como funciona:</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Seu pedido será criado em nosso sistema
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Um resumo será enviado automaticamente para o WhatsApp da loja
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                A loja entrará em contato para confirmar o pedido e forma de pagamento
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">WhatsApp da Loja:</span>
          </div>
          <p className="text-green-700 font-mono">{formatPhoneNumber(whatsappNumber)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-2">Resumo do Pedido:</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Cliente:</span>
              <span className="font-medium">{customerData.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Telefone:</span>
              <span className="font-medium">{customerData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Total de itens:</span>
              <span className="font-medium">{itemsCount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
              <span>Total:</span>
              <span>R$ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onConfirmOrder}
          disabled={isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg transition-all"
          size="lg"
        >
          {isProcessing ? (
            <>Criando pedido...</>
          ) : (
            <>
              <MessageCircle className="h-5 w-5 mr-2" />
              Confirmar Pedido via WhatsApp
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-600">
          Ao confirmar, você será redirecionado para o WhatsApp da loja automaticamente
        </p>
      </CardContent>
    </Card>
  );
};

export default WhatsAppCheckout;
