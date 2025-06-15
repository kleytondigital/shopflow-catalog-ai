
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/hooks/useCart';

interface OrderSummaryProps {
  items: CartItem[];
  totalAmount: number;
  shippingCost: number;
  finalTotal: number;
  isProcessing: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
  isMobile?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  totalAmount,
  shippingCost,
  finalTotal,
  isProcessing,
  isDisabled,
  onSubmit,
  isMobile = false
}) => {
  return (
    <div className={`h-full flex flex-col ${isMobile ? 'max-h-80' : ''}`}>
      <div className={`${isMobile ? 'bg-primary text-white p-3' : 'bg-gradient-to-r from-primary to-accent text-white p-4'} shrink-0`}>
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-center`}>
          Resumo do Pedido
        </h3>
      </div>

      <div className={`flex-1 ${isMobile ? 'min-h-0' : 'overflow-hidden'}`}>
        <ScrollArea className="h-full">
          <div className={`${isMobile ? 'p-3 space-y-2' : 'p-4 space-y-3'}`}>
            {items.map((item) => (
              <div key={item.id} className={`flex justify-between items-start ${isMobile ? 'text-xs' : 'text-sm'} bg-white p-3 rounded-lg border`}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-gray-600">
                    {item.quantity}x R$ {item.price.toFixed(2)}
                  </p>
                </div>
                <p className={`font-bold text-primary ml-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className={`shrink-0 bg-white border-t ${isMobile ? 'p-3 space-y-3' : 'p-4 space-y-4'}`}>
        <div className="space-y-3">
          <div className={`flex justify-between ${isMobile ? 'text-base' : 'text-lg'}`}>
            <span className="font-medium">Subtotal:</span>
            <span className="font-bold">R$ {totalAmount.toFixed(2)}</span>
          </div>
          
          {shippingCost > 0 && (
            <div className={`flex justify-between ${isMobile ? 'text-base' : 'text-lg'}`}>
              <span className="font-medium">Frete:</span>
              <span className="font-bold text-blue-600">R$ {shippingCost.toFixed(2)}</span>
            </div>
          )}
          
          <div className={`flex justify-between ${isMobile ? 'text-lg' : 'text-xl'} font-bold border-t pt-3`}>
            <span>Total:</span>
            <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <Button
          onClick={onSubmit}
          disabled={isDisabled}
          className={`w-full bg-gradient-to-r from-primary to-accent hover:from-blue-700 hover:to-purple-700 text-white font-bold ${isMobile ? 'py-3 text-base' : 'py-3 text-lg'} rounded-xl shadow-lg transition-all`}
          size="lg"
        >
          {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;
