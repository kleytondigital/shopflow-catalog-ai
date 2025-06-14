
import React, { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useCategories } from '@/hooks/useCategories';

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (filters: FilterState) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onFilter
}) => {
  const { categories } = useCategories();
  
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    availability: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Função para sanitizar e validar filtros antes de enviar
  const sanitizeFilters = (rawFilters: any) => {
    const sanitized = {
      category: rawFilters.category || null,
      minPrice: rawFilters.minPrice ? parseFloat(rawFilters.minPrice) : null,
      maxPrice: rawFilters.maxPrice ? parseFloat(rawFilters.maxPrice) : null,
      inStock: Boolean(rawFilters.inStock)
    };

    // Remover valores nulos para evitar problemas de tipo
    const cleanFilters: any = {};
    Object.entries(sanitized).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        cleanFilters[key] = value;
      }
    });

    return cleanFilters;
  };

  const applyFilters = () => {
    console.log('FilterSidebar: Aplicando filtros brutos:', filters);
    
    const sanitizedFilters = sanitizeFilters(filters);
    console.log('FilterSidebar: Filtros sanitizados:', sanitizedFilters);
    
    // Converter para formato FilterState esperado pelo Catalog.tsx
    const filterState: FilterState = {
      categories: sanitizedFilters.category ? [sanitizedFilters.category] : [],
      priceRange: [
        sanitizedFilters.minPrice || 0,
        sanitizedFilters.maxPrice || 99999
      ],
      inStock: sanitizedFilters.inStock
    };
    
    onFilter(filterState);
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false
    };
    
    setFilters(clearedFilters);
    
    // Aplicar filtros limpos imediatamente
    const filterState: FilterState = {
      categories: [],
      priceRange: [0, 99999],
      inStock: false
    };
    
    console.log('FilterSidebar: Limpando filtros:', filterState);
    onFilter(filterState);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-10">
      {/* Overlay para mobile */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-20 right-0 bottom-0 w-96 bg-white shadow-2xl transform transition-all duration-300 ease-out lg:relative lg:top-0 lg:w-full lg:shadow-none">
        <div className="h-full flex flex-col bg-gradient-to-br from-white to-blue-50/30">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                <p className="text-sm text-gray-500">Refine sua busca</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="lg:hidden rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Categoria */}
            <div className="space-y-4">
              <button
                onClick={() => toggleSection('category')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-base font-semibold text-gray-900">Categoria</Label>
                {expandedSections.category ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.category && (
                <div className="animate-fade-in">
                  <select 
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <Separator className="bg-gray-200" />

            {/* Faixa de Preço */}
            <div className="space-y-4">
              <button
                onClick={() => toggleSection('price')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-base font-semibold text-gray-900">Faixa de Preço</Label>
                {expandedSections.price ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.price && (
                <div className="animate-fade-in space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="minPrice" className="text-sm font-medium text-gray-700 mb-2 block">
                        Preço mínimo
                      </Label>
                      <Input
                        id="minPrice"
                        type="number"
                        placeholder="R$ 0"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                        min="0"
                        step="0.01"
                        className="rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPrice" className="text-sm font-medium text-gray-700 mb-2 block">
                        Preço máximo
                      </Label>
                      <Input
                        id="maxPrice"
                        type="number"
                        placeholder="R$ 1000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                        min="0"
                        step="0.01"
                        className="rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-gray-200" />

            {/* Disponibilidade */}
            <div className="space-y-4">
              <button
                onClick={() => toggleSection('availability')}
                className="flex items-center justify-between w-full text-left"
              >
                <Label className="text-base font-semibold text-gray-900">Disponibilidade</Label>
                {expandedSections.availability ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.availability && (
                <div className="animate-fade-in">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) => 
                        setFilters({...filters, inStock: checked as boolean})
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="inStock" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Apenas produtos em estoque
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer com botões */}
          <div className="p-6 bg-white border-t border-gray-200 space-y-3">
            <Button 
              onClick={applyFilters}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Aplicar Filtros
            </Button>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl transition-all duration-200"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
