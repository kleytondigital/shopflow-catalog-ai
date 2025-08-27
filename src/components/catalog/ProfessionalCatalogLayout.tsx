
import React from 'react';
import CatalogFilters from './CatalogFilters';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfessionalCatalogLayoutProps {
  showFilters: boolean;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  onCloseFilters: () => void;
  children: React.ReactNode;
}

const ProfessionalCatalogLayout: React.FC<ProfessionalCatalogLayoutProps> = ({
  showFilters,
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  onResetFilters,
  onCloseFilters,
  children
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar de Filtros - Desktop */}
      {showFilters && (
        <>
          {/* Overlay para Mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onCloseFilters}
          />
          
          {/* Sidebar */}
          <div className={`
            fixed md:static top-0 left-0 h-full z-50
            w-80 bg-white border-r border-gray-200 shadow-lg md:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            overflow-y-auto
          `}>
            {/* Header da Sidebar - Mobile */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseFilters}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filtros */}
            <div className="p-6">
              <CatalogFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                priceRange={priceRange}
                onPriceRangeChange={onPriceRangeChange}
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                sortBy={sortBy}
                onSortChange={onSortChange}
                onResetFilters={onResetFilters}
              />
            </div>
          </div>
        </>
      )}

      {/* Conteúdo Principal */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${showFilters ? 'md:ml-0' : ''}`}>
        <div className="bg-white min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCatalogLayout;
