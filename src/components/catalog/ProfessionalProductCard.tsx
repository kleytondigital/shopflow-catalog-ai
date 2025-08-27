
import React, { useState } from 'react';
import { ShoppingCart, Heart, Eye, Star, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { CatalogType } from '@/hooks/useCatalog';

interface ProfessionalProductCardProps {
  product: Product;
  catalogType: CatalogType;
  onClick: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  storeIdentifier: string;
}

const ProfessionalProductCard: React.FC<ProfessionalProductCardProps> = ({
  product,
  catalogType,
  onClick,
  onAddToCart,
  storeIdentifier
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const price = catalogType === 'wholesale' ? product.wholesale_price : product.retail_price;
  const originalPrice = price && price > 0 ? price * 1.2 : null;
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div 
      className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-xs">
            <Tag className="w-3 h-3 mr-1" />
            {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
          </Badge>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image_url || '/placeholder.png'}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Action Buttons */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white hover:bg-gray-100 text-gray-900 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onClick(product);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white hover:bg-gray-100 text-gray-900 shadow-md"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.8)</span>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              R$ {price?.toFixed(2) || '0.00'}
            </span>
            {hasDiscount && originalPrice && (
              <span className="text-sm line-through text-gray-500">
                R$ {originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {product.stock !== undefined && (
            <p className="text-xs text-gray-600">
              {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product, 1);
          }}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0 ? 'Indisponível' : 'Adicionar'}
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalProductCard;
