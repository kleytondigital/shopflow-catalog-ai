
import React, { useState } from 'react';
import { ShoppingCart, Heart, Eye, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';
import { CatalogType } from '@/hooks/useCatalog';

interface ModernProductCardProps {
  product: Product;
  catalogType: CatalogType;
  onClick: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  storeIdentifier: string;
  templateName?: string;
}

const ModernProductCard: React.FC<ModernProductCardProps> = ({
  product,
  catalogType,
  onClick,
  onAddToCart,
  storeIdentifier,
  templateName = 'modern'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const price = catalogType === 'wholesale' ? product.wholesale_price : product.retail_price;
  const originalPrice = price && price > 0 ? price * 1.2 : null;
  const hasDiscount = originalPrice && originalPrice > price;

  const getTemplateStyles = () => {
    switch (templateName) {
      case 'luxury':
        return {
          card: 'bg-gradient-to-br from-slate-900 to-amber-900 border-amber-500/30 shadow-2xl',
          overlay: 'bg-gradient-to-t from-black/80 via-black/40 to-transparent',
          price: 'text-amber-400 font-bold',
          button: 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-semibold',
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black'
        };
      case 'tech':
        return {
          card: 'bg-gradient-to-br from-slate-800 to-blue-900 border-blue-500/30 shadow-xl',
          overlay: 'bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-transparent',
          price: 'text-blue-400 font-bold',
          button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500',
          badge: 'bg-gradient-to-r from-blue-500 to-purple-500'
        };
      case 'fashion':
        return {
          card: 'bg-white border-pink-200 shadow-lg',
          overlay: 'bg-gradient-to-t from-pink-500/60 via-pink-300/30 to-transparent',
          price: 'text-pink-600 font-bold',
          button: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400',
          badge: 'bg-gradient-to-r from-pink-500 to-rose-500'
        };
      case 'health':
        return {
          card: 'bg-white border-emerald-200 shadow-md',
          overlay: 'bg-gradient-to-t from-emerald-500/60 via-emerald-300/30 to-transparent',
          price: 'text-emerald-600 font-bold',
          button: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-500'
        };
      case 'sports':
        return {
          card: 'bg-gradient-to-br from-slate-800 to-red-900 border-orange-500/30 shadow-xl',
          overlay: 'bg-gradient-to-t from-red-900/80 via-red-700/40 to-transparent',
          price: 'text-orange-400 font-bold',
          button: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500',
          badge: 'bg-gradient-to-r from-red-500 to-orange-500'
        };
      default:
        return {
          card: 'bg-white border-gray-200 shadow-lg',
          overlay: 'bg-gradient-to-t from-black/60 via-black/30 to-transparent',
          price: 'text-blue-600 font-bold',
          button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500',
          badge: 'bg-gradient-to-r from-blue-500 to-purple-500'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div 
      className={`group relative rounded-2xl border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden ${styles.card}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-20">
          <Badge className={`${styles.badge} text-white font-bold px-3 py-1 shadow-lg`}>
            <Sparkles className="w-3 h-3 mr-1" />
            {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
          </Badge>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay gradiente */}
        <div className={`absolute inset-0 ${styles.overlay} transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Action Buttons */}
        <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-500 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm"
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
            className="rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-sm text-muted-foreground ml-1">(4.8)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${styles.price}`}>
                R$ {price?.toFixed(2) || '0.00'}
              </span>
              {hasDiscount && originalPrice && (
                <span className="text-sm line-through text-muted-foreground">
                  R$ {originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.stock !== undefined && (
              <p className="text-xs text-muted-foreground">
                {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
              </p>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          className={`w-full ${styles.button} shadow-lg transition-all duration-300 font-medium`}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product, 1);
          }}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
        </Button>
      </div>
    </div>
  );
};

export default ModernProductCard;
