
import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { useCart } from '@/hooks/useCart';

const FloatingCart = () => {
  const { 
    items, 
    totalItems, 
    totalAmount, 
    isOpen, 
    toggleCart, 
    closeCart,
    updateQuantity,
    removeItem 
  } = useCart();

  if (totalItems === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        size="lg"
      >
        <div className="relative">
          <ShoppingCart size={24} />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
            {totalItems}
          </Badge>
        </div>
      </Button>

      {/* Cart Drawer */}
      <Drawer open={isOpen} onOpenChange={closeCart}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-bold">
                Meu Carrinho ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X size={20} />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg border">
                  <img
                    src={item.product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.catalogType === 'wholesale' ? 'Atacado' : 'Varejo'}
                    </p>
                    <p className="font-bold text-blue-600">
                      R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8"
                      >
                        <Minus size={14} />
                      </Button>
                      
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Footer */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
              onClick={() => {
                // TODO: Implementar navegação para checkout
                console.log('Ir para checkout');
              }}
            >
              Finalizar Pedido
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default FloatingCart;
