
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, RotateCcw } from 'lucide-react';

interface CatalogFiltersProps {
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
}

const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  onResetFilters
}) => {
  const hasActiveFilters = selectedCategory || searchTerm || priceRange[0] > 0 || priceRange[1] < 1000;

  return (
    <div className="space-y-6">
      {/* Header dos Filtros */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Ordenação */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Ordenar por</Label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome A-Z</SelectItem>
            <SelectItem value="price_asc">Menor Preço</SelectItem>
            <SelectItem value="price_desc">Maior Preço</SelectItem>
            <SelectItem value="newest">Mais Recente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categorias */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Categoria</Label>
          <div className="space-y-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange("")}
              className="w-full justify-start h-9 font-normal"
            >
              Todas as categorias
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className="w-full justify-start h-9 font-normal"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Faixa de Preço */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Faixa de Preço</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange([value[0], value[1]])}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 px-2">
          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
            R$ {priceRange[0]}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
            R$ {priceRange[1]}
          </span>
        </div>
      </div>

      {/* Filtros Ativos */}
      {hasActiveFilters && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <Label className="text-sm font-medium text-gray-700">Filtros Ativos</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <Badge 
                variant="secondary" 
                className="bg-blue-50 text-blue-700 border-blue-200 gap-1 pr-1"
              >
                {selectedCategory}
                <button
                  onClick={() => onCategoryChange("")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchTerm && (
              <Badge 
                variant="secondary" 
                className="bg-green-50 text-green-700 border-green-200 gap-1 pr-1"
              >
                "{searchTerm}"
                <button
                  onClick={() => onSearchChange("")}
                  className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Badge 
                variant="secondary" 
                className="bg-purple-50 text-purple-700 border-purple-200 gap-1 pr-1"
              >
                R$ {priceRange[0]} - R$ {priceRange[1]}
                <button
                  onClick={() => onPriceRangeChange([0, 1000])}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogFilters;
