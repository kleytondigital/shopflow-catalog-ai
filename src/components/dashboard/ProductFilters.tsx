
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface ProductFiltersProps {
  categories: string[];
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    isActive?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const ProductFilters = ({ categories, filters, onFiltersChange, onClearFilters }: ProductFiltersProps) => {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.values(filters).filter(v => v !== undefined && v !== '').length}
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por Categoria */}
          <div>
            <Label htmlFor="category-filter">Categoria</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Preço Mínimo */}
          <div>
            <Label htmlFor="min-price">Preço Mínimo (R$)</Label>
            <Input
              id="min-price"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || undefined)}
            />
          </div>

          {/* Filtro por Preço Máximo */}
          <div>
            <Label htmlFor="max-price">Preço Máximo (R$)</Label>
            <Input
              id="max-price"
              type="number"
              step="0.01"
              placeholder="999,99"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || undefined)}
            />
          </div>

          {/* Switches para filtros booleanos */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="in-stock"
                checked={filters.inStock || false}
                onCheckedChange={(checked) => handleFilterChange('inStock', checked ? true : undefined)}
              />
              <Label htmlFor="in-stock">Apenas com estoque</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={filters.isActive !== false}
                onCheckedChange={(checked) => handleFilterChange('isActive', checked ? undefined : false)}
              />
              <Label htmlFor="is-active">Apenas ativos</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters;
