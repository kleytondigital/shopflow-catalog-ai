import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import {
  X,
  Filter,
  DollarSign,
  Star,
  Package,
  Palette,
  Shirt,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";

export interface AdvancedFilterState {
  searchQuery: string;
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  featured: boolean;
  rating: number;
  variations: {
    colors: string[];
    sizes: string[];
    materials: string[];
  };
  discount: boolean;
}

interface AdvancedFilterSidebarProps {
  onFilter: (filters: AdvancedFilterState) => void;
  isOpen: boolean;
  onClose: () => void;
  products?: any[];
  isMobile?: boolean;
  activeFiltersCount?: number;
}

const AdvancedFilterSidebar: React.FC<AdvancedFilterSidebarProps> = memo(
  ({
    onFilter,
    isOpen,
    onClose,
    products = [],
    isMobile = false,
    activeFiltersCount = 0,
  }) => {
    const [filters, setFilters] = useState<AdvancedFilterState>({
      searchQuery: "",
      categories: [],
      priceRange: [0, 1000],
      inStock: false,
      featured: false,
      rating: 0,
      variations: {
        colors: [],
        sizes: [],
        materials: [],
      },
      discount: false,
    });

    const [openSections, setOpenSections] = useState({
      categories: true,
      price: true,
      availability: true,
      variations: true,
      rating: false,
      features: false,
    });

    // Extrair dados inteligentes dos produtos
    const filterData = useMemo(() => {
      if (products.length === 0)
        return {
          categories: [],
          priceRange: [0, 1000],
          colors: [],
          sizes: [],
          materials: [],
          maxRating: 5,
        };

      // Categorias com contagem
      const categoryCount = new Map<string, number>();
      const colorSet = new Set<string>();
      const sizeSet = new Set<string>();
      const materialSet = new Set<string>();

      const prices = products
        .map((p) => p.retail_price || 0)
        .filter((p) => p > 0);

      products.forEach((product) => {
        // Categorias
        if (product.category) {
          categoryCount.set(
            product.category,
            (categoryCount.get(product.category) || 0) + 1
          );
        }

        // Variações
        if (product.variations && Array.isArray(product.variations)) {
          product.variations.forEach((variation: any) => {
            if (variation.color) colorSet.add(variation.color);
            if (variation.size) sizeSet.add(variation.size);
            if (variation.material) materialSet.add(variation.material);
          });
        }
      });

      const categories = Array.from(categoryCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return {
        categories,
        priceRange:
          prices.length > 0
            ? [Math.min(...prices), Math.max(...prices)]
            : [0, 1000],
        colors: Array.from(colorSet).sort(),
        sizes: Array.from(sizeSet).sort(),
        materials: Array.from(materialSet).sort(),
        maxRating: 5,
      };
    }, [products]);

    // Aplicar filtros em tempo real
    const applyFilters = useCallback(
      (newFilters: AdvancedFilterState) => {
        setFilters(newFilters);
        onFilter(newFilters);
      },
      [onFilter]
    );

    // Handlers para diferentes tipos de filtros
    const handleSearchChange = useCallback(
      (value: string) => {
        const newFilters = { ...filters, searchQuery: value };
        applyFilters(newFilters);
      },
      [filters, applyFilters]
    );

    const handleCategoryToggle = useCallback(
      (category: string) => {
        const newCategories = filters.categories.includes(category)
          ? filters.categories.filter((c) => c !== category)
          : [...filters.categories, category];

        const newFilters = { ...filters, categories: newCategories };
        applyFilters(newFilters);
      },
      [filters, applyFilters]
    );

    const handleVariationToggle = useCallback(
      (type: "colors" | "sizes" | "materials", value: string) => {
        const currentValues = filters.variations[type];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];

        const newFilters = {
          ...filters,
          variations: { ...filters.variations, [type]: newValues },
        };
        applyFilters(newFilters);
      },
      [filters, applyFilters]
    );

    const handlePriceRangeChange = useCallback(
      (values: number[]) => {
        const newFilters = {
          ...filters,
          priceRange: values as [number, number],
        };
        applyFilters(newFilters);
      },
      [filters, applyFilters]
    );

    const handleToggleChange = useCallback(
      (key: keyof AdvancedFilterState, value: boolean) => {
        const newFilters = { ...filters, [key]: value };
        applyFilters(newFilters);
      },
      [filters, applyFilters]
    );

    const handleRatingChange = useCallback(
      (rating: number) => {
        const newFilters = { ...filters, rating };
        applyFilters(newFilters);
      },
      [filters, applyFilters]
    );

    const clearAllFilters = useCallback(() => {
      const clearedFilters: AdvancedFilterState = {
        searchQuery: "",
        categories: [],
        priceRange: filterData.priceRange as [number, number],
        inStock: false,
        featured: false,
        rating: 0,
        variations: {
          colors: [],
          sizes: [],
          materials: [],
        },
        discount: false,
      };
      applyFilters(clearedFilters);
    }, [filterData.priceRange, applyFilters]);

    const toggleSection = useCallback((section: keyof typeof openSections) => {
      setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    }, []);

    // Contar filtros ativos
    const activeFilters = useMemo(() => {
      let count = 0;
      if (filters.searchQuery) count++;
      if (filters.categories.length > 0) count++;
      if (
        filters.priceRange[0] > filterData.priceRange[0] ||
        filters.priceRange[1] < filterData.priceRange[1]
      )
        count++;
      if (filters.inStock) count++;
      if (filters.featured) count++;
      if (filters.rating > 0) count++;
      if (filters.variations.colors.length > 0) count++;
      if (filters.variations.sizes.length > 0) count++;
      if (filters.variations.materials.length > 0) count++;
      if (filters.discount) count++;
      return count;
    }, [filters, filterData.priceRange]);

    // Componente de seção colapsável
    const FilterSection = memo(
      ({
        title,
        icon: Icon,
        isOpen,
        onToggle,
        children,
        count,
      }: {
        title: string;
        icon: any;
        isOpen: boolean;
        onToggle: () => void;
        children: React.ReactNode;
        count?: number;
      }) => (
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="font-medium">{title}</span>
                {count !== undefined && count > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pb-3">
            {children}
          </CollapsibleContent>
        </Collapsible>
      )
    );

    const FilterContent = memo(() => (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Filtros Avançados</h2>
              {activeFilters > 0 && (
                <Badge variant="default">{activeFilters}</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-sm"
              disabled={activeFilters === 0}
            >
              Limpar Tudo
            </Button>
          </div>

          {/* Busca Rápida */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1">
            {/* Categorias */}
            {filterData.categories.length > 0 && (
              <FilterSection
                title="Categorias"
                icon={Package}
                isOpen={openSections.categories}
                onToggle={() => toggleSection("categories")}
                count={filters.categories.length}
              >
                <div className="space-y-2">
                  {filterData.categories.map(({ name, count }) => (
                    <label
                      key={name}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={filters.categories.includes(name)}
                          onCheckedChange={() => handleCategoryToggle(name)}
                        />
                        <span className="text-sm">{name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </label>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Faixa de Preço */}
            <FilterSection
              title="Faixa de Preço"
              icon={DollarSign}
              isOpen={openSections.price}
              onToggle={() => toggleSection("price")}
            >
              <div className="space-y-4">
                <Slider
                  value={filters.priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={filterData.priceRange[1]}
                  min={filterData.priceRange[0]}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>R$ {filters.priceRange[0]}</span>
                  <span>R$ {filters.priceRange[1]}</span>
                </div>
              </div>
            </FilterSection>

            {/* Cores */}
            {filterData.colors.length > 0 && (
              <FilterSection
                title="Cores"
                icon={Palette}
                isOpen={openSections.variations}
                onToggle={() => toggleSection("variations")}
                count={filters.variations.colors.length}
              >
                <div className="grid grid-cols-2 gap-2">
                  {filterData.colors.map((color) => (
                    <label
                      key={color}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.variations.colors.includes(color)}
                        onCheckedChange={() =>
                          handleVariationToggle("colors", color)
                        }
                      />
                      <span className="text-sm truncate">{color}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Tamanhos */}
            {filterData.sizes.length > 0 && (
              <FilterSection
                title="Tamanhos"
                icon={Shirt}
                isOpen={openSections.variations}
                onToggle={() => toggleSection("variations")}
                count={filters.variations.sizes.length}
              >
                <div className="grid grid-cols-3 gap-2">
                  {filterData.sizes.map((size) => (
                    <label
                      key={size}
                      className="flex items-center justify-center p-2 border rounded hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={filters.variations.sizes.includes(size)}
                        onCheckedChange={() =>
                          handleVariationToggle("sizes", size)
                        }
                        className="sr-only"
                      />
                      <span
                        className={`${
                          filters.variations.sizes.includes(size)
                            ? "font-bold text-blue-600"
                            : ""
                        }`}
                      >
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Avaliação */}
            <FilterSection
              title="Avaliação"
              icon={Star}
              isOpen={openSections.rating}
              onToggle={() => toggleSection("rating")}
            >
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label
                    key={rating}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.rating === rating}
                      onCheckedChange={(checked) =>
                        handleRatingChange(checked ? rating : 0)
                      }
                    />
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm ml-1">& acima</span>
                    </div>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Disponibilidade e Recursos */}
            <FilterSection
              title="Disponibilidade"
              icon={Package}
              isOpen={openSections.availability}
              onToggle={() => toggleSection("availability")}
            >
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={filters.inStock}
                    onCheckedChange={(checked) =>
                      handleToggleChange("inStock", checked as boolean)
                    }
                  />
                  <span className="text-sm">Apenas em estoque</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={filters.featured}
                    onCheckedChange={(checked) =>
                      handleToggleChange("featured", checked as boolean)
                    }
                  />
                  <span className="text-sm">Produtos em destaque</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={filters.discount}
                    onCheckedChange={(checked) =>
                      handleToggleChange("discount", checked as boolean)
                    }
                  />
                  <span className="text-sm">Em promoção</span>
                </label>
              </div>
            </FilterSection>
          </div>
        </div>
      </div>
    ));

    if (isMobile) {
      return (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="left" className="w-80 p-0">
            <FilterContent />
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Card className="h-full">
        <CardContent className="p-0 h-full">
          <FilterContent />
        </CardContent>
      </Card>
    );
  }
);

AdvancedFilterSidebar.displayName = "AdvancedFilterSidebar";

export default AdvancedFilterSidebar;
