
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, CheckCircle, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CartItemThumbnail from './CartItemThumbnail';
import OrderPreviewCard from './OrderPreviewCard';
import { CartItem } from '@/hooks/useCart';

interface EnhancedWhatsAppCheckoutProps {
  whatsappNumber: string;
  onConfirmOrder: () => void;
  isProcessing: boolean;
  customerData: {
    name: string;
    phone: string;
    email?: string;
  };
  items: CartItem[];
  totalAmount: number;
  shippingCost?: number;
  notes?: string;
}

const EnhancedWhatsAppCheckout: React.FC<EnhancedWhatsAppCheckoutProps> = ({
  whatsappNumber,
  onConfirmOrder,
  isProcessing,
  customerData,
  items,
  totalAmount,
  shippingCost = 0,
  notes
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const finalTotal = totalAmount + shippingCost;

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return `+55${cleaned}`;
  };

  const orderData = {
    customer_name: customerData.name,
    customer_phone: customerData.phone,
    customer_email: customerData.email,
    total_amount: finalTotal,
    items: items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      variation: item.variations ? 
        `${item.variations.size || ''} ${item.variations.color || ''}`.trim() : 
        undefined
    })),
    shipping_method: 'pickup',
    shipping_cost: shippingCost,
    notes: notes
  };

  const canConfirm = customerData.name.length >= 2 && 
                    /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(customerData.phone);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg text-green-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold">2</span>
            </div>
            Finalizar via WhatsApp
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
              Plano Básico
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Como funciona */}
          <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
            <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Como funciona:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Criar Pedido</p>
                  <p className="text-xs text-gray-600">Seu pedido será registrado em nosso sistema</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Enviar WhatsApp</p>
                  <p className="text-xs text-gray-600">Resumo enviado automaticamente</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Confirmar</p>
                  <p className="text-xs text-gray-600">A loja entrará em contato</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da loja */}
          <div className="bg-green-100 p-4 rounded-xl border border-green-300">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">WhatsApp da Loja:</span>
            </div>
            <p className="text-green-700 font-mono text-lg">{formatPhoneNumber(whatsappNumber)}</p>
          </div>

          {/* Resumo visual dos itens */}
          <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              Seus Itens ({items.length}):
            </h4>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <CartItemThumbnail 
                    imageUrl={item.product.image_url}
                    productName={item.product.name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-600">
                      {item.quantity}x R$ {item.price.toFixed(2)}
                    </p>
                    {item.variations && (
                      <p className="text-xs text-gray-500">
                        {item.variations.size} {item.variations.color}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>R$ {totalAmount.toFixed(2)}</span>
              </div>
              {shippingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Frete:</span>
                  <span>R$ {shippingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-green-800 pt-2 border-t">
                <span>Total:</span>
                <span>R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full bg-white hover:bg-green-50 border-green-300 text-green-700"
            >
              {showPreview ? 'Ocultar' : 'Ver'} Preview da Mensagem
            </Button>

            <Button
              onClick={onConfirmOrder}
              disabled={isProcessing || !canConfirm}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg transition-all"
              size="lg"
            >
              {isProcessing ? (
                <>Criando pedido...</>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Confirmar Pedido
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {!canConfirm && (
              <p className="text-xs text-center text-red-600">
                Complete seus dados acima para continuar
              </p>
            )}
          </div>

          <p className="text-xs text-center text-gray-600">
            🔒 Ao confirmar, você será redirecionado automaticamente para o WhatsApp
          </p>
        </CardContent>
      </Card>

      {/* Preview da mensagem */}
      {showPreview && (
        <div className="animate-fade-in">
          <OrderPreviewCard orderData={orderData} />
        </div>
      )}
    </div>
  );
};

export default EnhancedWhatsAppCheckout;
