
import React from 'react';
import { Heart, ShoppingCart, Eye, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/hooks/useProducts';
import { CatalogType } from '@/hooks/useCatalog';

interface IndustrialTemplateProps {
  product: Product;
  catalogType: CatalogType;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
  showPrices: boolean;
  showStock: boolean;
}

const IndustrialTemplate: React.FC<IndustrialTemplateProps> = ({
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
  const isWholesale = catalogType === 'wholesale';
  const canShowWholesale = product.wholesale_price && product.min_wholesale_qty;
  const isLowStock = product.stock <= 5;

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 hover:border-blue-900 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
      {/* Chanfro superior direito */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-blue-900 to-slate-700 clip-path-triangle"></div>
      
      {/* Container da imagem com efeito industrial */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay metálico */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badges metálicos */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isWholesale && (
            <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-3 py-1 clip-path-badge shadow-lg">
              <TrendingUp size={12} className="mr-1" />
              ATACADO
            </Badge>
          )}
          {isLowStock && showStock && (
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-3 py-1 clip-path-badge shadow-lg">
              <AlertTriangle size={12} className="mr-1" />
              ESTOQUE BAIXO
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-blue-900 to-slate-700 text-white font-bold px-3 py-1 clip-path-badge shadow-lg">
              ⭐ DESTAQUE
            </Badge>
          )}
        </div>

        {/* Botões de ação flutuantes */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-slate-800/80 hover:bg-slate-700 text-white border-2 border-slate-600 rounded-none clip-path-button"
            onClick={() => onAddToWishlist(product)}
          >
            <Heart size={16} className={isInWishlist ? 'fill-red-500 text-red-500' : ''} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-slate-800/80 hover:bg-slate-700 text-white border-2 border-slate-600 rounded-none clip-path-button"
            onClick={() => onQuickView(product)}
          >
            <Eye size={16} />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 bg-gradient-to-b from-white to-slate-50">
        {/* Título do produto */}
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-900 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Categoria */}
        {product.category && (
          <p className="text-sm text-slate-600 mb-2 font-medium uppercase tracking-wide">
            {product.category}
          </p>
        )}

        {/* Preços com design industrial */}
        {showPrices && price && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-blue-900 bg-gradient-to-r from-blue-900 to-slate-700 bg-clip-text text-transparent">
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
              {isWholesale && (
                <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold px-2 py-1 clip-path-badge">
                  MIN. {product.min_wholesale_qty}
                </Badge>
              )}
            </div>
            
            {/* Comparação de preços */}
            {canShowWholesale && !isWholesale && (
              <div className="text-sm text-slate-600">
                <span className="line-through mr-2">R$ {product.retail_price?.toFixed(2).replace('.', ',')}</span>
                <span className="text-green-600 font-bold">
                  Atacado: R$ {product.wholesale_price?.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stock info */}
        {showStock && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Estoque:</span>
              <span className={`font-bold ${isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                {product.stock} unidades
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isLowStock ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botão de adicionar ao carrinho industrial */}
        <Button
          onClick={() => onAddToCart(product)}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl clip-path-button-large"
          disabled={product.stock <= 0}
        >
          <ShoppingCart size={18} className="mr-2" />
          {product.stock <= 0 ? 'INDISPONÍVEL' : 'ADICIONAR AO CARRINHO'}
        </Button>
      </CardContent>

      {/* Efeito de borda metálica */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-900 group-hover:to-slate-700 pointer-events-none rounded-lg"></div>
    </Card>
  );
};

export default IndustrialTemplate;
