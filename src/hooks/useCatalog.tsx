
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/useProducts';

export interface CatalogStore {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogSettings {
  id: string;
  store_id: string;
  retail_catalog_active: boolean | null;
  wholesale_catalog_active: boolean | null;
  whatsapp_number: string | null;
  whatsapp_integration_active: boolean | null;
  payment_methods: {
    pix: boolean;
    bank_slip: boolean;
    credit_card: boolean;
  } | null;
  shipping_options: {
    pickup: boolean;
    delivery: boolean;
    shipping: boolean;
  } | null;
  business_hours: any;
  created_at: string;
  updated_at: string;
}

export type CatalogType = 'retail' | 'wholesale';
export type CheckoutType = 'whatsapp' | 'online' | 'fluid';

export const useCatalog = (storeId?: string) => {
  const [store, setStore] = useState<CatalogStore | null>(null);
  const [settings, setSettings] = useState<CatalogSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const fetchStore = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setStore(data);
    } catch (error) {
      console.error('Erro ao buscar loja:', error);
    }
  };

  const fetchSettings = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', id)
        .single();

      if (error) throw error;
      
      // Converter e validar os dados JSON
      const processedSettings: CatalogSettings = {
        ...data,
        payment_methods: data.payment_methods ? {
          pix: (data.payment_methods as any)?.pix || false,
          bank_slip: (data.payment_methods as any)?.bank_slip || false,
          credit_card: (data.payment_methods as any)?.credit_card || false,
        } : {
          pix: false,
          bank_slip: false,
          credit_card: false,
        },
        shipping_options: data.shipping_options ? {
          pickup: (data.shipping_options as any)?.pickup || false,
          delivery: (data.shipping_options as any)?.delivery || false,
          shipping: (data.shipping_options as any)?.shipping || false,
        } : {
          pickup: true,
          delivery: false,
          shipping: false,
        }
      };

      setSettings(processedSettings);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const fetchProducts = async (id: string, catalogType: CatalogType) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filtrar produtos baseado no tipo de catálogo
      const filtered = data?.filter(product => {
        if (catalogType === 'wholesale') {
          return product.wholesale_price && product.min_wholesale_qty;
        }
        return true;
      }) || [];

      setProducts(filtered);
      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      product.category?.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredProducts(filtered);
  };

  const filterProducts = (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }) => {
    let filtered = products;

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.retail_price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.retail_price <= filters.maxPrice!);
    }

    if (filters.inStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    if (storeId) {
      fetchStore(storeId);
      fetchSettings(storeId);
    }
  }, [storeId]);

  return {
    store,
    settings,
    products,
    filteredProducts,
    loading,
    fetchProducts,
    searchProducts,
    filterProducts
  };
};
