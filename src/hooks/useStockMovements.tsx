
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StockMovement {
  id: string;
  product_id: string;
  order_id?: string;
  movement_type: 'reservation' | 'sale' | 'return' | 'adjustment' | 'release';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes?: string;
  created_at: string;
  expires_at?: string;
  store_id: string;
}

export interface CreateStockMovementData {
  product_id: string;
  order_id?: string;
  movement_type: StockMovement['movement_type'];
  quantity: number;
  notes?: string;
  expires_at?: string;
}

export const useStockMovements = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Buscar movimentações de estoque
  const fetchStockMovements = async (productId?: string): Promise<StockMovement[]> => {
    if (!profile?.store_id) return [];

    console.log('Buscando movimentações de estoque para produto:', productId);

    let query = supabase
      .from('stock_movements')
      .select('*')
      .eq('store_id', profile.store_id)
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar movimentações:', error);
      throw error;
    }

    return data || [];
  };

  // Query para buscar movimentações
  const stockMovementsQuery = useQuery({
    queryKey: ['stock_movements', profile?.store_id],
    queryFn: () => fetchStockMovements(),
    enabled: !!profile?.store_id,
    refetchOnWindowFocus: false
  });

  // Mutation para criar movimentação de estoque
  const createStockMovementMutation = useMutation({
    mutationFn: async (movementData: CreateStockMovementData) => {
      if (!profile?.store_id) {
        throw new Error('Store ID não encontrado');
      }

      console.log('Criando movimentação de estoque:', movementData);

      // Buscar estoque atual do produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock, reserved_stock')
        .eq('id', movementData.product_id)
        .single();

      if (productError) {
        console.error('Erro ao buscar produto:', productError);
        throw productError;
      }

      const currentStock = product.stock;
      const reservedStock = product.reserved_stock || 0;
      let newStock = currentStock;
      let newReservedStock = reservedStock;

      // Calcular novo estoque baseado no tipo de movimentação
      switch (movementData.movement_type) {
        case 'reservation':
          newReservedStock = reservedStock + movementData.quantity;
          break;
        case 'sale':
          newStock = currentStock - movementData.quantity;
          newReservedStock = Math.max(0, reservedStock - movementData.quantity);
          break;
        case 'return':
          newStock = currentStock + movementData.quantity;
          break;
        case 'adjustment':
          newStock = movementData.quantity; // Quantidade é o novo valor total
          break;
        case 'release':
          newReservedStock = Math.max(0, reservedStock - movementData.quantity);
          break;
      }

      // Criar registro de movimentação
      const movementRecord = {
        product_id: movementData.product_id,
        order_id: movementData.order_id || null,
        movement_type: movementData.movement_type,
        quantity: movementData.quantity,
        previous_stock: currentStock,
        new_stock: newStock,
        notes: movementData.notes || null,
        expires_at: movementData.expires_at || null,
        store_id: profile.store_id
      };

      const { data: movement, error: movementError } = await supabase
        .from('stock_movements')
        .insert(movementRecord)
        .select()
        .single();

      if (movementError) {
        console.error('Erro ao criar movimentação:', movementError);
        throw movementError;
      }

      // Atualizar estoque do produto
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          reserved_stock: newReservedStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', movementData.product_id);

      if (updateError) {
        console.error('Erro ao atualizar estoque:', updateError);
        throw updateError;
      }

      return movement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  // Mutation para liberar reservas expiradas
  const releaseExpiredReservationsMutation = useMutation({
    mutationFn: async () => {
      console.log('Liberando reservas expiradas...');

      const { data, error } = await supabase.rpc('release_expired_reservations');

      if (error) {
        console.error('Erro ao liberar reservas:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (releasedCount) => {
      console.log(`${releasedCount} reservas liberadas`);
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  return {
    // Dados
    stockMovements: stockMovementsQuery.data || [],
    isLoading: stockMovementsQuery.isLoading,
    error: stockMovementsQuery.error,

    // Funções
    createStockMovement: createStockMovementMutation.mutate,
    isCreatingMovement: createStockMovementMutation.isPending,
    releaseExpiredReservations: releaseExpiredReservationsMutation.mutate,
    isReleasingReservations: releaseExpiredReservationsMutation.isPending,
    refetch: stockMovementsQuery.refetch,

    // Funções auxiliares
    fetchMovementsByProduct: (productId: string) => fetchStockMovements(productId)
  };
};
