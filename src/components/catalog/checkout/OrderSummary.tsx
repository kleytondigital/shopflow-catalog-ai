
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
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  totalAmount,
  shippingCost,
  finalTotal,
  isProcessing,
  isDisabled,
  onSubmit
}) => {
  return (
    <div className="lg:col-span-1 border-l bg-gray-50/50">
      <div className="h-full flex flex-col">
        <div className="shrink-0 bg-gradient-to-r from-primary to-accent text-white p-4">
          <h3 className="text-xl font-bold text-center">Resumo do Pedido</h3>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm bg-white p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-gray-600">
                      {item.quantity}x R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-primary ml-2">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="shrink-0 bg-white border-t p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="font-medium">Subtotal:</span>
              <span className="font-bold">R$ {totalAmount.toFixed(2)}</span>
            </div>
            
            {shippingCost > 0 && (
              <div className="flex justify-between text-lg">
                <span className="font-medium">Frete:</span>
                <span className="font-bold text-blue-600">R$ {shippingCost.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xl font-bold border-t pt-3">
              <span>Total:</span>
              <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={onSubmit}
            disabled={isDisabled}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 text-lg rounded-xl shadow-lg transition-all"
            size="lg"
          >
            {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
