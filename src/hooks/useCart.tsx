
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Product } from '@/types/product';
import { ProductVariation } from '@/types/variation';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variation?: ProductVariation;
  price: number;
  originalPrice: number;
  catalogType: string;
  currentTier?: any;
  nextTier?: any;
  nextTierQuantityNeeded?: number;
  nextTierPotentialSavings?: number;
  catalogMode?: string;
  priceModel?: string;
  finalPrice?: number;
  totalSavings?: number;
  savingsPercentage?: number;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart_items', []);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product: Product, quantity: number = 1, variation?: ProductVariation) => {
    const itemId = `${product.id}-${variation?.id || 'default'}`;
    
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === itemId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      
      return [...prev, {
        id: itemId,
        product,
        quantity,
        price: product.retail_price,
        originalPrice: product.retail_price,
        catalogType: 'retail',
        variation
      }];
    });
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    setIsOpen(prev => !prev);
  };

  const openCart = () => {
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  // Cálculos simplificados sem hooks condicionais
  const enrichedItems = useMemo(() => {
    return cartItems.map(item => ({
      ...item,
      catalogMode: 'separated',
      priceModel: 'retail_only',
      finalPrice: item.price,
      totalSavings: 0,
      savingsPercentage: 0
    }));
  }, [cartItems]);

  const totalItems = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalAmount = enrichedItems.reduce((sum, item) => {
    const finalPrice = item.finalPrice || item.price;
    return sum + (finalPrice * item.quantity);
  }, 0);

  const totalSavings = enrichedItems.reduce((sum, item) => {
    return sum + (item.totalSavings || 0);
  }, 0);

  const cartAnalysis = useMemo(() => {
    const itemsWithNextTier = enrichedItems.filter(item => 
      item.nextTierQuantityNeeded && item.nextTierQuantityNeeded > 0
    );
    
    const potentialSavings = itemsWithNextTier.reduce((sum, item) => 
      sum + ((item.nextTierPotentialSavings || 0) * (item.nextTierQuantityNeeded || 0)), 0
    );

    const canGetWholesalePrice = enrichedItems.some(item => 
      item.currentTier?.tier_name === "Varejo" && 
      item.product.wholesale_price &&
      item.quantity < (item.product.min_wholesale_qty || 1)
    );

    return {
      itemsWithUpgradeOpportunity: itemsWithNextTier.length,
      totalPotentialSavings: potentialSavings,
      canGetWholesalePrice,
      averageOrderValue: totalAmount / Math.max(1, enrichedItems.length),
      totalUniqueProducts: enrichedItems.length
    };
  }, [enrichedItems, totalAmount]);

  return {
    items: enrichedItems,
    cartAnalysis,
    totalSavings,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isOpen,
    toggleCart,
    openCart,
    closeCart,
    potentialSavings: cartAnalysis.totalPotentialSavings,
    canGetWholesalePrice: cartAnalysis.canGetWholesalePrice,
    itemsToWholesale: cartAnalysis.itemsWithUpgradeOpportunity,
  };
};
