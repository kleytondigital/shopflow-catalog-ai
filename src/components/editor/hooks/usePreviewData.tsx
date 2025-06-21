
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

export const usePreviewData = () => {
  const { profile } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  // Produtos de exemplo para preview quando não há produtos reais
  const mockProducts = [
    {
      id: '1',
      name: 'Produto Exemplo 1',
      retail_price: 29.90,
      wholesale_price: 24.90,
      image_url: null,
      description: 'Descrição do produto exemplo',
      category: 'Categoria Exemplo',
      stock: 10,
      is_active: true
    },
    {
      id: '2',
      name: 'Produto Exemplo 2',
      retail_price: 49.90,
      wholesale_price: 39.90,
      image_url: null,
      description: 'Descrição do segundo produto',
      category: 'Categoria Exemplo',
      stock: 5,
      is_active: true
    },
    {
      id: '3',
      name: 'Produto Exemplo 3',
      retail_price: 79.90,
      wholesale_price: 64.90,
      image_url: null,
      description: 'Descrição do terceiro produto',
      category: 'Outra Categoria',
      stock: 8,
      is_active: true
    }
  ];

  const mockCategories = [
    { id: '1', name: 'Categoria Exemplo', description: 'Exemplo de categoria' },
    { id: '2', name: 'Outra Categoria', description: 'Outra categoria de exemplo' }
  ];

  // Usar produtos reais se disponíveis, senão usar mock
  const previewProducts = (products && products.length > 0) ? products.slice(0, 6) : mockProducts;
  const previewCategories = (categories && categories.length > 0) ? categories.slice(0, 4) : mockCategories;

  return {
    products: previewProducts,
    categories: previewCategories,
    loading: productsLoading || categoriesLoading,
    hasRealData: !!(products && products.length > 0)
  };
};
