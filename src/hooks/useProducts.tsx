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
      
      // SEGURANÇA CRÍTICA: Determinar store_id válido
      const targetStoreId = storeId || profile?.store_id;
      
      // BLOQUEAR COMPLETAMENTE se não há store_id
      if (!targetStoreId) {
        console.log('🚨 [SECURITY] Tentativa de buscar produtos sem store_id válido - BLOQUEADO');
        setProducts([]);
        setLoading(false);
        return;
      }

      console.log('🔒 [SECURITY] Buscando produtos para store_id:', targetStoreId);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', targetStoreId) // SEMPRE filtrar por store_id
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🚨 [SECURITY] Erro ao buscar produtos:', error);
        throw error;
      }

      console.log('✅ [SECURITY] Produtos carregados com segurança:', data?.length || 0);
      setProducts(data || []);
    } catch (error) {
      console.error('🚨 [SECURITY] Erro crítico ao buscar produtos:', error);
      setProducts([]); // Limpar produtos em caso de erro
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
    const availableStock = product.stock - (product.reserved_stock || 0);
    return availableStock <= threshold;
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

  const createProduct = async (productData: CreateProductData & { variations?: any[] }) => {
    try {
      // VALIDAÇÃO CRÍTICA: Verificar store_id
      const targetStoreId = profile?.store_id || productData.store_id;
      
      if (!targetStoreId) {
        console.log('🚨 [SECURITY] Tentativa de criar produto sem store_id - BLOQUEADO');
        return { data: null, error: 'Store ID é obrigatório' };
      }

      // Remover variations dos dados do produto principal
      const { variations, ...productOnlyData } = productData;

      console.log('Criando produto com dados:', productOnlyData);

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productOnlyData,
          store_id: targetStoreId // SEMPRE usar store_id validado
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
      }

      console.log('Produto criado com sucesso:', data);

      // Se há variações, criar separadamente
      if (variations && variations.length > 0 && data.id) {
        console.log('Criando variações para produto:', data.id);
        
        const variationsData = variations.map(variation => ({
          ...variation,
          product_id: data.id
        }));

        const { error: variationsError } = await supabase
          .from('product_variations')
          .insert(variationsData);

        if (variationsError) {
          console.error('Erro ao criar variações:', variationsError);
          // Produto foi criado, mas variações falharam
        }
      }

      await fetchProducts();
      return { data, error: null };
    } catch (error) {
      console.error('🚨 [SECURITY] Erro ao criar produto:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  const updateProduct = async (productData: UpdateProductData & { variations?: any[] }) => {
    try {
      // VALIDAÇÃO: Verificar se o produto pertence à loja do usuário
      if (!profile?.store_id) {
        console.log('🚨 [SECURITY] Tentativa de atualizar produto sem store_id - BLOQUEADO');
        return { data: null, error: 'Store ID é obrigatório' };
      }

      const { id, variations, ...updates } = productData;
      
      console.log('Atualizando produto:', id, 'com dados:', updates);

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('store_id', profile.store_id) // VALIDAR ownership
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
      }

      // Se há variações, atualizar separadamente
      if (variations && variations.length > 0) {
        console.log('Atualizando variações para produto:', id);
        
        // Primeiro, remover variações existentes
        await supabase
          .from('product_variations')
          .delete()
          .eq('product_id', id);

        // Depois, inserir novas variações
        const variationsData = variations.map(variation => ({
          ...variation,
          product_id: id
        }));

        const { error: variationsError } = await supabase
          .from('product_variations')
          .insert(variationsData);

        if (variationsError) {
          console.error('Erro ao atualizar variações:', variationsError);
        }
      }

      await fetchProducts();
      return { data, error: null };
    } catch (error) {
      console.error('🚨 [SECURITY] Erro ao atualizar produto:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      if (!profile?.store_id) {
        console.log('🚨 [SECURITY] Tentativa de deletar produto sem store_id - BLOQUEADO');
        return { error: 'Store ID é obrigatório' };
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('store_id', profile.store_id); // VALIDAR ownership

      if (error) throw error;
      await fetchProducts();
      return { error: null };
    } catch (error) {
      console.error('🚨 [SECURITY] Erro ao deletar produto:', error);
      return { error };
    }
  };

  const getProduct = async (id: string) => {
    try {
      if (!profile?.store_id) {
        console.log('🚨 [SECURITY] Tentativa de buscar produto sem store_id - BLOQUEADO');
        return { data: null, error: 'Store ID é obrigatório' };
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('store_id', profile.store_id) // VALIDAR ownership
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('🚨 [SECURITY] Erro ao buscar produto:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    // SEMPRE verificar se há profile antes de buscar
    if (profile?.store_id || storeId) {
      fetchProducts();
    } else {
      console.log('🔒 [SECURITY] Aguardando store_id válido...');
      setLoading(false);
    }
  }, [profile?.store_id, storeId]);

  // Produtos com estoque baixo
  const lowStockProducts = products.filter(product => {
    const threshold = product.stock_alert_threshold || 5;
    const availableStock = product.stock - (product.reserved_stock || 0);
    return availableStock <= threshold;
  });

  return {
    products,
    loading,
    lowStockProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct: async (id: string) => {
      try {
        if (!profile?.store_id) {
          console.log('🚨 [SECURITY] Tentativa de deletar produto sem store_id - BLOQUEADO');
          return { error: 'Store ID é obrigatório' };
        }

        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
          .eq('store_id', profile.store_id);

        if (error) throw error;
        await fetchProducts();
        return { error: null };
      } catch (error) {
        console.error('🚨 [SECURITY] Erro ao deletar produto:', error);
        return { error: error instanceof Error ? error.message : 'Erro desconhecido' };
      }
    },
    getProduct: async (id: string) => {
      try {
        if (!profile?.store_id) {
          console.log('🚨 [SECURITY] Tentativa de buscar produto sem store_id - BLOQUEADO');
          return { data: null, error: 'Store ID é obrigatório' };
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('store_id', profile.store_id)
          .single();

        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        console.error('🚨 [SECURITY] Erro ao buscar produto:', error);
        return { data: null, error: error instanceof Error ? error.message : 'Erro desconhecido' };
      }
    },
    
    // Funções de estoque
    getAvailableStock,
    isLowStock,
    updateStock,
    reserveStock,
    confirmSale,
    returnStock
  };
};
