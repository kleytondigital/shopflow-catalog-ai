
import React from 'react';
import { Product } from '@/hooks/useProducts';
import { CatalogType } from '@/hooks/useCatalog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Eye, Package } from 'lucide-react';

interface ModernTemplateProps {
  product: Product;
  catalogType: CatalogType;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
  showPrices: boolean;
  showStock: boolean;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({
  product,
  catalogType,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isInWishlist,
  showPrices,
  showStock
}) => {
  const price = catalogType === 'wholesale' ? product.wholesale_price : product.retail_price;
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay com ações */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onQuickView(product)}
            className="rounded-full"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAddToWishlist(product)}
            className={`rounded-full ${isInWishlist ? 'text-red-500' : ''}`}
          >
            <Heart className="h-4 w-4" fill={isInWishlist ? 'currentColor' : 'none'} />
          </Button>
        </div>

        {/* Badge de estoque */}
        {showStock && product.stock <= 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Esgotado
          </Badge>
        )}
        
        {showStock && product.stock > 0 && product.stock <= 5 && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Últimas unidades
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            {showPrices && price && (
              <div className="space-y-1">
                <p className="text-2xl font-bold text-blue-600">
                  R$ {price.toFixed(2)}
                </p>
                {catalogType === 'wholesale' && product.min_wholesale_qty && (
                  <p className="text-xs text-gray-500">
                    Mín. {product.min_wholesale_qty} unidades
                  </p>
                )}
              </div>
            )}

            {showStock && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Package className="h-4 w-4" />
                {product.stock} disponível
              </div>
            )}
          </div>

          <Button
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            className="w-full btn-primary"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock <= 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernTemplate;
