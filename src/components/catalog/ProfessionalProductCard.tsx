
import React, { useState } from 'react';
import { ShoppingCart, Heart, Eye, Star, Tag, Package } from 'lucide-react';
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
  const isOutOfStock = product.stock === 0;

  return (
    <div 
      className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 text-xs shadow-sm">
              <Tag className="w-3 h-3 mr-1" />
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </Badge>
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-3 right-3 z-20">
            <Badge variant="secondary" className="bg-gray-600 text-white font-medium px-2 py-1 text-xs">
              Esgotado
            </Badge>
          </div>
        )}

        <img
          src={product.image_url || '/placeholder.png'}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Loading Placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Quick Action Buttons */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-all duration-300 ${
          isHovered && !isOutOfStock ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white hover:bg-gray-100 text-gray-900 shadow-md h-8 w-8 p-0"
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
            className="bg-white hover:bg-gray-100 text-gray-900 shadow-md h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {product.category}
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
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  {product.stock} em estoque
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  Fora de estoque
                </span>
              )}
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          className={`w-full font-medium text-sm py-2 transition-colors ${
            isOutOfStock 
              ? 'bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) {
              onAddToCart(product, 1);
            }
          }}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? 'Indisponível' : 'Adicionar ao Carrinho'}
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalProductCard;
