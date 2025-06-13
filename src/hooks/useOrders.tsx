
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variation?: string;
}

// Usar os tipos do Supabase para garantir compatibilidade
type DatabaseOrder = Database['public']['Tables']['orders']['Row'];
type OrderStatus = Database['public']['Enums']['order_status'];
type CatalogType = Database['public']['Enums']['catalog_type'];

export interface Order {
  id: string;
  order_number?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  status: OrderStatus;
  order_type: CatalogType;
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

// Função helper para converter Json para OrderItem[]
const convertJsonToOrderItems = (items: any): OrderItem[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item: any) => ({
    id: item.id || '',
    name: item.name || '',
    quantity: Number(item.quantity) || 0,
    price: Number(item.price) || 0,
    variation: item.variation || undefined
  }));
};

// Função helper para converter OrderItem[] para Json
const convertOrderItemsToJson = (items: OrderItem[]): any => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    variation: item.variation || null
  }));
};

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
      query = query.eq('status', filters.status as OrderStatus);
    }

    if (filters.order_type && filters.order_type !== 'all') {
      query = query.eq('order_type', filters.order_type as CatalogType);
    }

    // Filtro de busca por texto
    if (filters.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
    }

    // Filtros por aba
    if (filters.tab === 'unpaid') {
      query = query.eq('status', 'pending' as OrderStatus);
    } else if (filters.tab === 'pending') {
      query = query.in('status', ['pending', 'confirmed'] as OrderStatus[]);
    } else if (filters.tab === 'shipped') {
      query = query.in('status', ['shipping', 'delivered'] as OrderStatus[]);
    }

    // Ordenar por data mais recente
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }

    console.log('Pedidos encontrados:', data?.length || 0);
    
    // Converter dados do banco para nossa interface
    return (data || []).map((order: DatabaseOrder): Order => ({
      id: order.id,
      customer_name: order.customer_name,
      customer_email: order.customer_email || undefined,
      customer_phone: order.customer_phone || undefined,
      status: order.status,
      order_type: order.order_type,
      total_amount: Number(order.total_amount),
      items: convertJsonToOrderItems(order.items),
      shipping_address: order.shipping_address ? order.shipping_address as Order['shipping_address'] : undefined,
      created_at: order.created_at,
      updated_at: order.updated_at,
      store_id: order.store_id
    }));
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
        .update({ 
          status: status as OrderStatus, 
          updated_at: new Date().toISOString() 
        })
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

      // Preparar dados para inserção no formato esperado pelo banco
      const newOrderData = {
        customer_name: orderData.customer_name || '',
        customer_email: orderData.customer_email || null,
        customer_phone: orderData.customer_phone || null,
        status: (orderData.status || 'pending') as OrderStatus,
        order_type: (orderData.order_type || 'retail') as CatalogType,
        total_amount: orderData.total_amount || 0,
        items: convertOrderItemsToJson(orderData.items || []),
        shipping_address: orderData.shipping_address || null,
        store_id: profile.store_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(newOrderData)
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

    // Converter dados do banco para nossa interface
    const order: Order = {
      id: data.id,
      customer_name: data.customer_name,
      customer_email: data.customer_email || undefined,
      customer_phone: data.customer_phone || undefined,
      status: data.status,
      order_type: data.order_type,
      total_amount: Number(data.total_amount),
      items: convertJsonToOrderItems(data.items),
      shipping_address: data.shipping_address ? data.shipping_address as Order['shipping_address'] : undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
      store_id: data.store_id
    };

    return order;
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
