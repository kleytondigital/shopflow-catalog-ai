
import React from 'react';
import CatalogFilters from './CatalogFilters';

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
  children
}) => {
  return (
    <div className="flex gap-6">
      {/* Sidebar de Filtros */}
      {showFilters && (
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-6">
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
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
};

export default ProfessionalCatalogLayout;
