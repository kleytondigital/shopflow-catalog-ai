
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProductList from '@/components/products/ProductList';
import { useProducts } from '@/hooks/useProducts';

const Products = () => {
  const { products } = useProducts();

  const handleEditProduct = (product: any) => {
    // Implementar edição posteriormente
    console.log('Editar produto:', product);
  };

  const handleDeleteProduct = (id: string) => {
    // Implementar exclusão posteriormente
    console.log('Excluir produto:', id);
  };

  const handleGenerateDescription = (id: string) => {
    // Implementar geração de descrição com IA posteriormente
    console.log('Gerar descrição IA para produto:', id);
  };

  // Converter produtos para o formato esperado pelo ProductList
  const formattedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category || '',
    price: product.retail_price,
    stock: product.stock,
    status: product.is_active ? 'active' as const : 'inactive' as const,
    image: product.image_url || '/placeholder.svg',
    wholesalePrice: product.wholesale_price || undefined
  }));

  return (
    <AppLayout title="Produtos" subtitle="Gerencie o catálogo de produtos da sua loja">
      <ProductList 
        products={formattedProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onGenerateDescription={handleGenerateDescription}
      />
    </AppLayout>
  );
};

export default Products;
