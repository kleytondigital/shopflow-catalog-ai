
import React from 'react';
import { Product } from '@/hooks/useProducts';
import { CatalogType } from '@/hooks/useCatalog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';

interface MinimalTemplateProps {
  product: Product;
  catalogType: CatalogType;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
  showPrices: boolean;
  showStock: boolean;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({
  product,
  catalogType,
  onAddToCart,
  onAddToWishlist,
  isInWishlist,
  showPrices,
  showStock
}) => {
  const price = catalogType === 'wholesale' ? product.wholesale_price : product.retail_price;
  
  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 line-clamp-1">
              {product.name}
            </h3>
            
            {showPrices && price && (
              <p className="text-lg font-semibold text-gray-900">
                R$ {price.toFixed(2)}
              </p>
            )}

            {showStock && (
              <p className="text-sm text-gray-500">
                {product.stock} em estoque
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
              size="sm"
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => onAddToWishlist(product)}
              size="sm"
              variant="outline"
              className={isInWishlist ? 'text-red-500 border-red-200' : ''}
            >
              <Heart className="h-4 w-4" fill={isInWishlist ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MinimalTemplate;
