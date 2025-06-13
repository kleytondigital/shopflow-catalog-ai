
import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye, Star, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/hooks/useProducts';
import { CatalogType } from '@/hooks/useCatalog';

interface ProductCardProps {
  product: Product;
  catalogType: CatalogType;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  catalogType,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isInWishlist = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const price = catalogType === 'wholesale' && product.wholesale_price 
    ? product.wholesale_price 
    : product.retail_price;

  const minQuantity = catalogType === 'wholesale' && product.min_wholesale_qty 
    ? product.min_wholesale_qty 
    : 1;

  const discountPercentage = catalogType === 'wholesale' && product.wholesale_price
    ? Math.round(((product.retail_price - product.wholesale_price) / product.retail_price) * 100)
    : 0;

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description || 'Confira este produto incrível!',
      url: window.location.href + `/produto/${product.id}`
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(shareData.url);
    }
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Esgotado', color: 'bg-red-500' };
    if (product.stock <= 5) return { text: 'Últimas unidades', color: 'bg-orange-500' };
    return null;
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden bg-white border-0 shadow-md">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!imageError ? (
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">Sem imagem</span>
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onQuickView(product)}
              className="bg-white/90 hover:bg-white"
            >
              <Eye size={16} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onAddToWishlist(product)}
              className={`bg-white/90 hover:bg-white ${isInWishlist ? 'text-red-500' : ''}`}
            >
              <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleShare}
              className="bg-white/90 hover:bg-white"
            >
              <Share2 size={16} />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {catalogType === 'wholesale' && discountPercentage > 0 && (
              <Badge className="bg-green-500 hover:bg-green-600">
                -{discountPercentage}%
              </Badge>
            )}
            {stockStatus && (
              <Badge className={`${stockStatus.color} text-white`}>
                {stockStatus.text}
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddToWishlist(product)}
            className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/80 hover:bg-white"
          >
            <Heart size={16} fill={isInWishlist ? 'red' : 'none'} className={isInWishlist ? 'text-red-500' : ''} />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {product.category}
            </p>
          )}

          {/* Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Rating (Mock) */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="text-yellow-400" fill="currentColor" />
            ))}
            <span className="text-xs text-gray-500 ml-1">(24 avaliações)</span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {catalogType === 'wholesale' && product.wholesale_price && (
                <span className="text-sm text-gray-500 line-through">
                  R$ {product.retail_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            
            {catalogType === 'wholesale' && minQuantity > 1 && (
              <p className="text-xs text-gray-600 mt-1">
                Mín. {minQuantity} unidades
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
          >
            <ShoppingCart size={16} className="mr-2" />
            {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
