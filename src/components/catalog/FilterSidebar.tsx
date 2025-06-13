
import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';

interface FilterSidebarProps {
  products: Product[];
  onFilter: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  colors: string[];
  sizes: string[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  products,
  onFilter,
  isOpen,
  onClose
}) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000],
    inStock: false,
    colors: [],
    sizes: []
  });

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    stock: true,
    colors: false,
    sizes: false
  });

  // Extrair dados únicos dos produtos
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const maxPrice = Math.max(...products.map(p => p.retail_price));
  const minPrice = Math.min(...products.map(p => p.retail_price));
  
  // Mock data para cores e tamanhos (em um caso real viria das variações)
  const colors = ['Preto', 'Branco', 'Azul', 'Vermelho', 'Verde', 'Cinza'];
  const sizes = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: [minPrice, maxPrice]
    }));
  }, [minPrice, maxPrice]);

  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleColorChange = (color: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      colors: checked
        ? [...prev.colors, color]
        : prev.colors.filter(c => c !== color)
    }));
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      sizes: checked
        ? [...prev.sizes, size]
        : prev.sizes.filter(s => s !== size)
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [minPrice, maxPrice],
      inStock: false,
      colors: [],
      sizes: []
    });
  };

  const getActiveFiltersCount = () => {
    return filters.categories.length + 
           filters.colors.length + 
           filters.sizes.length + 
           (filters.inStock ? 1 : 0) +
           (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice ? 1 : 0);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 lg:transform-none lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={20} />
                <h2 className="font-semibold">Filtros</h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
                  <X size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Categorias */}
            <Card>
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => toggleSection('categories')}
              >
                <CardTitle className="text-sm flex items-center justify-between">
                  Categorias
                  {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.categories && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {category}
                        </label>
                        <span className="text-xs text-gray-500">
                          ({products.filter(p => p.category === category).length})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Faixa de Preço */}
            <Card>
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => toggleSection('price')}
              >
                <CardTitle className="text-sm flex items-center justify-between">
                  Faixa de Preço
                  {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.price && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))
                      }
                      max={maxPrice}
                      min={minPrice}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>R$ {filters.priceRange[0].toFixed(0)}</span>
                      <span>R$ {filters.priceRange[1].toFixed(0)}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Disponibilidade */}
            <Card>
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => toggleSection('stock')}
              >
                <CardTitle className="text-sm flex items-center justify-between">
                  Disponibilidade
                  {expandedSections.stock ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.stock && (
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="in-stock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, inStock: checked as boolean }))
                      }
                    />
                    <label htmlFor="in-stock" className="text-sm cursor-pointer">
                      Apenas produtos em estoque
                    </label>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Cores */}
            <Card>
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => toggleSection('colors')}
              >
                <CardTitle className="text-sm flex items-center justify-between">
                  Cores
                  {expandedSections.colors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.colors && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {colors.map(color => (
                      <div key={color} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color}`}
                          checked={filters.colors.includes(color)}
                          onCheckedChange={(checked) => 
                            handleColorChange(color, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`color-${color}`}
                          className="text-sm cursor-pointer"
                        >
                          {color}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Tamanhos */}
            <Card>
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => toggleSection('sizes')}
              >
                <CardTitle className="text-sm flex items-center justify-between">
                  Tamanhos
                  {expandedSections.sizes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CardTitle>
              </CardHeader>
              {expandedSections.sizes && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map(size => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={filters.sizes.includes(size)}
                          onCheckedChange={(checked) => 
                            handleSizeChange(size, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`size-${size}`}
                          className="text-sm cursor-pointer"
                        >
                          {size}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
