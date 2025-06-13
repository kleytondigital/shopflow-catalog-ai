
import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, Package } from 'lucide-react';
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
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleCart}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 animate-pulse hover:animate-none border-2 border-white/20"
          size="lg"
        >
          <div className="relative">
            <ShoppingCart size={26} className="text-white" />
            <Badge className="absolute -top-3 -right-3 h-7 w-7 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-2 border-white shadow-lg animate-bounce">
              {totalItems}
            </Badge>
          </div>
        </Button>
      </div>

      {/* Cart Drawer */}
      <Drawer open={isOpen} onOpenChange={closeCart}>
        <DrawerContent className="max-h-[85vh] bg-gradient-to-b from-white to-gray-50">
          <DrawerHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-white" />
                </div>
                <div>
                  <DrawerTitle className="text-xl font-bold text-gray-900">
                    Meu Carrinho
                  </DrawerTitle>
                  <p className="text-sm text-gray-600">
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'} selecionado{totalItems === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                  <X size={20} />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                  <Package size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Carrinho vazio</h3>
                <p className="text-gray-600 text-center">
                  Adicione produtos ao carrinho para continuar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative">
                      <img
                        src={item.product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'}
                        alt={item.product.name}
                        className="w-18 h-18 object-cover rounded-lg"
                      />
                      <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs">
                        {item.catalogType === 'wholesale' ? 'Atacado' : 'Varejo'}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-blue-600 text-lg">
                            R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total: R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 rounded-full"
                          >
                            <Minus size={14} />
                          </Button>
                          
                          <span className="w-12 text-center font-semibold bg-gray-50 rounded-lg py-1">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 rounded-full"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-8 h-8"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</p>
                    <p className="text-3xl font-bold text-gray-900">
                      R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                  onClick={() => {
                    closeCart();
                    // TODO: Abrir checkout
                    console.log('Ir para checkout');
                  }}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Finalizar Pedido
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default FloatingCart;
