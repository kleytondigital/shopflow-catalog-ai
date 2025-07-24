import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface ModernTemplateProps {
  product: Product;
  onProductClick?: (product: Product) => void;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ product, onProductClick }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    console.log('🚀 MODERN - Adicionando produto ao carrinho:', product);
    
    // Use product directly since it already matches the Product interface
    addToCart(product, 1);
    
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div 
      className="relative flex flex-col rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
      onClick={() => onProductClick?.(product)}
    >
      {/* Product Image */}
      <div className="aspect-w-4 aspect-h-3">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="object-cover rounded-t-lg" 
        />
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 flex-grow line-clamp-3">
          {product.description}
        </p>

        {/* Price and Add to Cart */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">
              ${product.retail_price}
            </span>
          </div>
          <Button size="sm" onClick={(e) => {
              e.stopPropagation(); // Prevent click from propagating to the parent div
              handleAddToCart(product);
            }}>
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
