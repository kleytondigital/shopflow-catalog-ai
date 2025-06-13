
import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export interface CatalogFilters {
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  inStock?: boolean;
  search?: string;
}

export const useCatalog = (storeId: string, catalogType: 'retail' | 'wholesale' = 'retail') => {
  const { products, loading: productsLoading } = useProducts();
  const { settings, loading: settingsLoading } = useStoreSettings();
  
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Aplicar filtros e busca aos produtos
  const filteredProducts = useMemo(() => {
    console.log('useCatalog: Aplicando filtros:', filters);
    console.log('useCatalog: Produtos disponíveis:', products.length);
    
    if (!products.length) return [];

    let filtered = products.filter(product => {
      // Filtrar apenas produtos ativos
      if (!product.is_active) return false;

      // Filtro de categoria
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Determinar preço baseado no tipo de catálogo
      const price = catalogType === 'wholesale' 
        ? (product.wholesale_price || product.retail_price)
        : product.retail_price;

      // Filtro de preço mínimo
      if (filters.minPrice !== null && filters.minPrice !== undefined) {
        if (price < filters.minPrice) return false;
      }

      // Filtro de preço máximo
      if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        if (price > filters.maxPrice) return false;
      }

      // Filtro de estoque
      if (filters.inStock) {
        const availableStock = (product.stock || 0) - (product.reserved_stock || 0);
        if (availableStock <= 0) return false;
      }

      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(searchLower);
        const matchesDescription = product.description?.toLowerCase().includes(searchLower);
        const matchesCategory = product.category?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesDescription && !matchesCategory) {
          return false;
        }
      }

      return true;
    });

    console.log('useCatalog: Produtos após filtros:', filtered.length);
    return filtered;
  }, [products, filters, searchTerm, catalogType]);

  // Obter categorias únicas dos produtos
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(
      products
        .filter(product => product.is_active && product.category)
        .map(product => product.category!)
    ));
    
    return uniqueCategories.sort();
  }, [products]);

  // Função para atualizar filtros com validação
  const updateFilters = (newFilters: Partial<CatalogFilters>) => {
    console.log('useCatalog: Atualizando filtros:', newFilters);
    
    // Sanitizar filtros para evitar valores undefined
    const sanitizedFilters: CatalogFilters = {};
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        sanitizedFilters[key as keyof CatalogFilters] = value;
      }
    });

    setFilters(prev => ({
      ...prev,
      ...sanitizedFilters
    }));
  };

  // Função para limpar filtros
  const clearFilters = () => {
    console.log('useCatalog: Limpando todos os filtros');
    setFilters({});
    setSearchTerm('');
  };

  // Verificar se o catálogo está ativo nas configurações
  const isCatalogActive = useMemo(() => {
    if (!settings) return true; // Default para ativo se não há configurações
    
    return catalogType === 'retail' 
      ? settings.retail_catalog_active !== false
      : settings.wholesale_catalog_active === true;
  }, [settings, catalogType]);

  const loading = productsLoading || settingsLoading;

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    filters,
    searchTerm,
    loading,
    settings,
    isCatalogActive,
    updateFilters,
    setSearchTerm,
    clearFilters,
    hasActiveFilters: Object.keys(filters).length > 0 || searchTerm.length > 0
  };
};
