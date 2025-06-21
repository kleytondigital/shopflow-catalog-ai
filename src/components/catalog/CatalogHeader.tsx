
import React from 'react';
import { ShoppingCart, Search, Menu, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StoreData } from '@/hooks/useStoreData';
import { useCart } from '@/hooks/useCart';

export type CatalogType = 'retail' | 'wholesale';

interface CatalogHeaderProps {
  store: StoreData;
  catalogType?: CatalogType;
  onCatalogTypeChange?: (type: CatalogType) => void;
  cartItemsCount?: number;
  wishlistCount?: number;
  whatsappNumber?: string;
  onSearch?: (query: string) => void;
  onToggleFilters?: () => void;
  onCartClick: () => void;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  store,
  catalogType,
  onCatalogTypeChange,
  cartItemsCount = 0,
  wishlistCount = 0,
  whatsappNumber,
  onSearch,
  onToggleFilters,
  onCartClick
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { toggleCart } = useCart();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleCartClick = () => {
    console.log('🛒 HEADER - Clique no carrinho, abrindo FloatingCart');
    // Primeiro abrir o floating cart
    toggleCart();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome da Loja */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFilters}
              className="md:hidden rounded-full hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              {store.logo_url ? (
                <div className="relative">
                  <img 
                    src={store.logo_url} 
                    alt={`Logo ${store.name}`}
                    className="w-10 h-10 rounded-xl object-cover shadow-sm"
                  />
                  <div className="absolute inset-0 rounded-xl ring-2 ring-primary/20"></div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
                {store.description && (
                  <p className="text-sm text-gray-600 hidden sm:block">{store.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-3">
            {/* Favoritos */}
            {wishlistCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="relative rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Carrinho */}
            <Button
              variant="outline"
              onClick={handleCartClick}
              className="relative rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 shadow-lg animate-pulse"
                >
                  {cartItemsCount}
                </Badge>
              )}
              <span className="ml-2 hidden sm:inline">Carrinho</span>
            </Button>
          </div>
        </div>

        {/* Barra de Pesquisa Mobile */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CatalogHeader;
