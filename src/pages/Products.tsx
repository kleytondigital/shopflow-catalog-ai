
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProductList from '@/components/products/ProductList';

const Products = () => {
  return (
    <AppLayout title="Produtos" subtitle="Gerencie o catálogo de produtos da sua loja">
      <ProductList />
    </AppLayout>
  );
};

export default Products;
