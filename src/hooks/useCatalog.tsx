
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStoreSettings } from './useStoreSettings';

export type CatalogType = 'retail' | 'wholesale';

export interface Store {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
}

// Exportar CatalogStore como alias para Store
export type CatalogStore = Store;

// Exportar CatalogSettings interface
export interface CatalogSettings {
  id: string;
  store_id: string;
  business_hours: any;
  payment_methods: any;
  shipping_options: any;
  whatsapp_number: string | null;
  whatsapp_integration_active: boolean | null;
  retail_catalog_active: boolean | null;
  wholesale_catalog_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

// Função para verificar se é um UUID válido
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useCatalog = (identifier?: string) => {
  const [catalogType, setCatalogType] = useState<CatalogType>('retail');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  // Query para buscar loja por ID ou slug
  const storeQuery = useQuery({
    queryKey: ['store', identifier],
    queryFn: async (): Promise<Store | null> => {
      if (!identifier) {
        console.log('useCatalog: Nenhum identificador fornecido');
        return null;
      }

      console.log('useCatalog: Buscando loja para identificador:', identifier);

      let query = supabase
        .from('stores')
        .select('id, name, description, logo_url, is_active')
        .eq('is_active', true);

      // Determinar se é UUID (buscar por ID) ou string (buscar por slug)
      if (isValidUUID(identifier)) {
        console.log('useCatalog: Identificador é UUID, buscando por ID');
        query = query.eq('id', identifier);
      } else {
        console.log('useCatalog: Identificador é slug, buscando por url_slug');
        query = query.eq('url_slug', identifier);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('useCatalog: Erro ao buscar loja:', error);
        throw error;
      }

      if (!data) {
        console.log('useCatalog: Loja não encontrada');
        return null;
      }

      console.log('useCatalog: Loja encontrada:', data.name);
      return data;
    },
    enabled: !!identifier,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Hook para configurações da loja
  const { settings: storeSettings, loading: settingsLoading } = useStoreSettings(storeQuery.data?.id);

  // Query para buscar produtos da loja
  const productsQuery = useQuery({
    queryKey: ['catalog-products', storeQuery.data?.id, catalogType],
    queryFn: async () => {
      if (!storeQuery.data?.id) {
        console.log('useCatalog: Store ID não disponível para buscar produtos');
        return [];
      }

      console.log('useCatalog: Buscando produtos para store_id:', storeQuery.data.id, 'tipo:', catalogType);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeQuery.data.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useCatalog: Erro ao buscar produtos:', error);
        throw error;
      }

      console.log('useCatalog: Produtos encontrados:', data?.length || 0);
      return data || [];
    },
    enabled: !!storeQuery.data?.id,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Filtrar produtos com base na busca e filtros
  const filteredProducts = useMemo(() => {
    if (!productsQuery.data) return [];

    let filtered = productsQuery.data;

    // Filtro por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
      );
    }

    // Filtro por categoria
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Filtro por preço
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => product.retail_price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.retail_price <= filters.maxPrice!);
    }

    // Filtro por estoque
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    return filtered;
  }, [productsQuery.data, searchQuery, filters]);

  // Função para inicializar catálogo
  const initializeCatalog = async (storeId: string, type: CatalogType): Promise<boolean> => {
    console.log('useCatalog: Inicializando catálogo:', storeId, type);
    setCatalogType(type);
    
    // Refetch dados se necessário
    if (storeQuery.data?.id !== storeId) {
      await storeQuery.refetch();
    }
    
    await productsQuery.refetch();
    
    return true;
  };

  // Função para buscar produtos
  const searchProducts = (query: string) => {
    console.log('useCatalog: Buscando produtos com query:', query);
    setSearchQuery(query);
  };

  // Função para filtrar produtos
  const filterProducts = (filterOptions: FilterOptions) => {
    console.log('useCatalog: Aplicando filtros:', filterOptions);
    setFilters(filterOptions);
  };

  const loading = storeQuery.isLoading || productsQuery.isLoading;

  return {
    // Store data
    store: storeQuery.data,
    storeLoading: storeQuery.isLoading,
    storeError: storeQuery.error,
    
    // Products data
    products: productsQuery.data || [],
    filteredProducts,
    productsLoading: productsQuery.isLoading,
    productsError: productsQuery.error,
    
    // Settings data
    storeSettings,
    settingsLoading,
    
    // Catalog type
    catalogType,
    setCatalogType,
    
    // Search and filter
    searchQuery,
    filters,
    loading,
    
    // Actions
    initializeCatalog,
    searchProducts,
    filterProducts,
    
    // Refetch functions
    refetchStore: storeQuery.refetch,
    refetchProducts: productsQuery.refetch
  };
};
