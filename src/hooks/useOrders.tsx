
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variation?: string;
}

export interface Order {
  id: string;
  order_number?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  order_type: 'retail' | 'wholesale';
  total_amount: number;
  shipping_cost?: number;
  discount_amount?: number;
  items: OrderItem[];
  shipping_address?: {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zip_code: string;
  };
  shipping_method?: string;
  tracking_code?: string;
  notes?: string;
  payment_method?: string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  due_date?: string;
  store_id: string;
}

export interface OrderFilters {
  status?: string;
  order_type?: string;
  payment_status?: string;
  search?: string;
  tab?: string;
}

export const useOrders = (filters: OrderFilters = {}) => {
  const { profile, isSuperadmin } = useAuth();
  const queryClient = useQueryClient();

  // Função para buscar pedidos
  const fetchOrders = async (): Promise<Order[]> => {
    if (!profile) return [];

    console.log('Buscando pedidos com filtros:', filters);

    let query = supabase.from('orders').select('*');

    // Se não for superadmin, filtrar por loja
    if (!isSuperadmin && profile.store_id) {
      query = query.eq('store_id', profile.store_id);
    }

    // Aplicar filtros
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.order_type && filters.order_type !== 'all') {
      query = query.eq('order_type', filters.order_type);
    }

    // Filtro de busca por texto
    if (filters.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
    }

    // Filtros por aba
    if (filters.tab === 'unpaid') {
      // Mock do filtro de não pagos - adaptar conforme estrutura real
      query = query.eq('status', 'pending');
    } else if (filters.tab === 'pending') {
      query = query.in('status', ['pending', 'confirmed']);
    } else if (filters.tab === 'shipped') {
      query = query.in('status', ['shipped', 'delivered']);
    }

    // Ordenar por data mais recente
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }

    console.log('Pedidos encontrados:', data?.length || 0);
    return data || [];
  };

  // Query para buscar pedidos
  const ordersQuery = useQuery({
    queryKey: ['orders', profile?.store_id, filters],
    queryFn: fetchOrders,
    enabled: !!profile,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Mutation para atualizar status do pedido
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      console.log('Atualizando status do pedido:', orderId, status);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar cache para refrescar a lista
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  // Mutation para criar novo pedido
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: Partial<Order>) => {
      console.log('Criando novo pedido:', orderData);
      
      if (!profile?.store_id) {
        throw new Error('Store ID não encontrado');
      }

      const newOrder = {
        ...orderData,
        store_id: profile.store_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar pedido:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  // Função para buscar pedido por ID
  const getOrderById = async (orderId: string): Promise<Order | null> => {
    console.log('Buscando pedido por ID:', orderId);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Erro ao buscar pedido:', error);
      return null;
    }

    return data;
  };

  return {
    // Dados
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    
    // Funções
    updateOrderStatus: updateOrderStatusMutation.mutate,
    isUpdatingStatus: updateOrderStatusMutation.isPending,
    createOrder: createOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    getOrderById,
    refetch: ordersQuery.refetch,
    
    // Filtros derivados
    unpaidOrders: (ordersQuery.data || []).filter(order => 
      order.status === 'pending' || order.payment_status === 'pending'
    )
  };
};
