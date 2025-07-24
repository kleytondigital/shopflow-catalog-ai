import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface IndustrialTemplateProps {
  product: Product;
  catalogSettings?: any;
}

const IndustrialTemplate: React.FC<IndustrialTemplateProps> = ({ product, catalogSettings }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    console.log('🏭 INDUSTRIAL - Adicionando produto ao carrinho:', product);
    
    // Use product directly since it already matches the Product interface
    addToCart(product, 1);
    
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-100 rounded-md overflow-hidden shadow-md">
      <img
        className="w-full h-48 object-cover object-center"
        src={product.image_url}
        alt={product.name}
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="mt-2 text-sm text-gray-600">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-gray-900">R$ {product.retail_price}</span>
          <Button size="sm" onClick={() => handleAddToCart(product)}>
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IndustrialTemplate;
