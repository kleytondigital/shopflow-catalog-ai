
import React from 'react';
import { Product } from '@/hooks/useProducts';
import { CatalogType } from '@/hooks/useCatalog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star } from 'lucide-react';

interface ElegantTemplateProps {
  product: Product;
  catalogType: CatalogType;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
  showPrices: boolean;
  showStock: boolean;
}

const ElegantTemplate: React.FC<ElegantTemplateProps> = ({
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
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
      <div className="relative">
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        
        {/* Gradiente overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Botão de favorito */}
        <Button
          onClick={() => onAddToWishlist(product)}
          size="sm"
          variant="ghost"
          className={`absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full ${
            isInWishlist ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          <Heart className="h-4 w-4" fill={isInWishlist ? 'currentColor' : 'none'} />
        </Button>

        {/* Badge premium */}
        {catalogType === 'wholesale' && (
          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            Atacado
          </Badge>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {product.description}
            </p>
          )}
        </div>

        {/* Rating simulado */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-2">(4.0)</span>
        </div>

        <div className="space-y-3">
          {showPrices && price && (
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                R$ {price.toFixed(2)}
              </p>
              {catalogType === 'wholesale' && product.min_wholesale_qty && (
                <p className="text-xs text-gray-500">
                  Mín. {product.min_wholesale_qty}un
                </p>
              )}
            </div>
          )}

          {showStock && (
            <p className="text-sm text-gray-500">
              {product.stock > 10 ? 'Disponível' : `Apenas ${product.stock} restantes`}
            </p>
          )}

          <div className="space-y-2">
            <Button
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock <= 0 ? 'Indisponível' : 'Adicionar'}
            </Button>
            
            <Button
              onClick={() => onQuickView(product)}
              variant="outline"
              className="w-full"
            >
              Visualizar Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElegantTemplate;
