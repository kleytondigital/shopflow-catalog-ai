
import React from 'react';
import { ShoppingCart, Search, Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StoreData } from '@/hooks/useStoreData';

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome da Loja */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFilters}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              {store.logo_url ? (
                <img 
                  src={store.logo_url} 
                  alt={`Logo ${store.name}`}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
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
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Carrinho */}
          <Button
            variant="outline"
            onClick={onCartClick}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cartItemsCount}
              </Badge>
            )}
            <span className="ml-2 hidden sm:inline">Carrinho</span>
          </Button>
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
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CatalogHeader;
