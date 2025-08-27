
import React, { useState } from 'react';
import { Search, Filter, ShoppingCart, Heart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Store } from '@/hooks/useCatalog';
import { CatalogType } from '@/hooks/useCatalog';

export interface CatalogHeaderProps {
  store: Store;
  catalogType: CatalogType;
  templateName?: string;
  cartItemsCount?: number;
  wishlistCount?: number;
  onSearch?: (query: string) => void;
  onToggleFilters?: () => void;
  onCartClick?: () => void;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  store,
  catalogType,
  templateName = 'modern',
  cartItemsCount = 0,
  wishlistCount = 0,
  onSearch,
  onToggleFilters,
  onCartClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo e Nome da Loja */}
          <div className="flex items-center gap-3">
            {store.logo_url && (
              <img
                src={store.logo_url}
                alt={`Logo ${store.name}`}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
              {store.description && (
                <p className="text-sm text-gray-600 line-clamp-1">{store.description}</p>
              )}
            </div>
          </div>

          {/* Barra de Busca Central */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-3">
            {/* Botão de Filtros - Desktop */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="hidden md:flex items-center gap-2 h-10 px-4 border-gray-200 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>

            {/* Botão de Filtros - Mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="md:hidden h-10 w-10 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>

            {/* Carrinho */}
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative h-10 px-4 border-gray-200 hover:bg-gray-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-600 hover:bg-red-700 text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>

            {/* Badge do Tipo de Catálogo */}
            <Badge 
              variant="secondary" 
              className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
            >
              {catalogType === 'wholesale' ? 'Atacado' : 'Varejo'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CatalogHeader;
