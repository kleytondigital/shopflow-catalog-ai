
import React from 'react';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useShoppingCart } from '@/hooks/useShoppingCart';

interface FloatingCartProps {
  isVisible: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({
  isVisible,
  onClose,
  onToggle
}) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useShoppingCart();

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {totalItems > 0 && (
          <Button
            onClick={onToggle}
            className="rounded-full w-14 h-14 shadow-lg relative"
            size="lg"
          >
            <ShoppingCart className="h-6 w-6" />
            <Badge 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs"
              variant="secondary"
            >
              {totalItems}
            </Badge>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <div className="bg-card border rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho ({totalItems})
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Items */}
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Seu carrinho está vazio
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-between items-center font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                Finalizar Pedido
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Ver Carrinho Completo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingCart;
