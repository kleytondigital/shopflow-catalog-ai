
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Product } from '@/hooks/useProducts';
import { CatalogType } from '@/hooks/useCatalog';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  catalogType: CatalogType;
  price: number;
  variations?: {
    size?: string;
    color?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, catalogType: CatalogType, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('catalog-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('catalog-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, catalogType: CatalogType, quantity = 1) => {
    const price = catalogType === 'wholesale' && product.wholesale_price 
      ? product.wholesale_price 
      : product.retail_price;
    
    const minQuantity = catalogType === 'wholesale' && product.min_wholesale_qty 
      ? product.min_wholesale_qty 
      : 1;
    
    const finalQuantity = Math.max(quantity, minQuantity);
    
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && item.catalogType === catalogType
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + finalQuantity }
            : item
        );
      }
      
      const newItem: CartItem = {
        id: `${product.id}-${catalogType}-${Date.now()}`,
        product,
        quantity: finalQuantity,
        catalogType,
        price
      };
      
      return [...prev, newItem];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const minQuantity = item.catalogType === 'wholesale' && item.product.min_wholesale_qty 
          ? item.product.min_wholesale_qty 
          : 1;
        return { ...item, quantity: Math.max(quantity, minQuantity) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    setIsOpen(false);
  };

  const toggleCart = () => setIsOpen(!isOpen);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
      isOpen,
      toggleCart,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
};
