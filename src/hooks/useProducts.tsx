import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStockMovements } from '@/hooks/useStockMovements';

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string | null;
  retail_price: number;
  wholesale_price: number | null;
  stock: number;
  reserved_stock: number;
  min_wholesale_qty: number | null;
  image_url: string | null;
  is_active: boolean;
  allow_negative_stock: boolean;
  stock_alert_threshold: number | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  seo_slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  store_id: string;
  name: string;
  description?: string;
  category?: string;
  retail_price: number;
  wholesale_price?: number;
  stock: number;
  min_wholesale_qty?: number;
  image_url?: string;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  seo_slug?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export const useProducts = (storeId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { createStockMovement } = useStockMovements();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('products').select('*');
      
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular estoque disponível
  const getAvailableStock = (product: Product): number => {
    return product.stock - (product.reserved_stock || 0);
  };

  // Função para verificar se estoque está baixo
  const isLowStock = (product: Product): boolean => {
    const threshold = product.stock_alert_threshold || 5;
    return getAvailableStock(product) <= threshold;
  };

  // Função para atualizar estoque com movimentação
  const updateStock = async (productId: string, newStock: number, notes?: string) => {
    try {
      console.log('Atualizando estoque do produto:', productId, 'para:', newStock);

      createStockMovement({
        product_id: productId,
        movement_type: 'adjustment',
        quantity: newStock,
        notes: notes || 'Ajuste manual de estoque'
      });

      await fetchProducts();
      return { data: true, error: null };
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      return { data: null, error };
    }
  };

  // Função para reservar estoque
  const reserveStock = async (productId: string, quantity: number, orderId?: string, expiresInHours: number = 24) => {
    try {
      console.log('Reservando estoque:', productId, quantity);

      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      const availableStock = getAvailableStock(product);
      if (availableStock < quantity && !product.allow_negative_stock) {
        throw new Error(`Estoque insuficiente. Disponível: ${availableStock}`);
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      createStockMovement({
        product_id: productId,
        order_id: orderId,
        movement_type: 'reservation',
        quantity: quantity,
        expires_at: expiresAt.toISOString(),
        notes: `Reserva para pedido ${orderId || 'manual'}`
      });

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro ao reservar estoque:', error);
      return { data: null, error };
    }
  };

  // Função para confirmar venda (baixa definitiva)
  const confirmSale = async (productId: string, quantity: number, orderId?: string) => {
    try {
      console.log('Confirmando venda:', productId, quantity);

      createStockMovement({
        product_id: productId,
        order_id: orderId,
        movement_type: 'sale',
        quantity: quantity,
        notes: `Venda confirmada para pedido ${orderId || 'manual'}`
      });

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro ao confirmar venda:', error);
      return { data: null, error };
    }
  };

  // Função para retornar produto ao estoque
  const returnStock = async (productId: string, quantity: number, orderId?: string, notes?: string) => {
    try {
      console.log('Retornando produto ao estoque:', productId, quantity);

      createStockMovement({
        product_id: productId,
        order_id: orderId,
        movement_type: 'return',
        quantity: quantity,
        notes: notes || `Devolução do pedido ${orderId || 'manual'}`
      });

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro ao retornar produto:', error);
      return { data: null, error };
    }
  };

  const createProduct = async (productData: CreateProductData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          store_id: profile?.store_id || productData.store_id
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return { data: null, error };
    }
  };

  const updateProduct = async (productData: UpdateProductData) => {
    try {
      const { id, ...updates } = productData;
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProducts();
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      return { error };
    }
  };

  const getProduct = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    if (profile) {
      fetchProducts();
    }
  }, [profile, storeId]);

  // Produtos com estoque baixo
  const lowStockProducts = products.filter(isLowStock);

  return {
    products,
    loading,
    lowStockProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    
    // Funções de estoque
    getAvailableStock,
    isLowStock,
    updateStock,
    reserveStock,
    confirmSale,
    returnStock
  };
};
