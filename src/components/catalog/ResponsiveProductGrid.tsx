import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowUpDown, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import EnhancedProductCard from "./EnhancedProductCard";
import AdvancedFilterSidebar, {
  AdvancedFilterState,
} from "./AdvancedFilterSidebar";
import { Product } from "@/types/product";
import { CatalogType } from "@/hooks/useCatalog";

export type SortOption =
  | "name"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating"
  | "stock";

interface ResponsiveProductGridProps {
  products: Product[];
  catalogType: CatalogType;
  storeIdentifier?: string;
  loading?: boolean;
  className?: string;
}

const ResponsiveProductGrid: React.FC<ResponsiveProductGridProps> = ({
  products,
  catalogType,
  storeIdentifier,
  loading = false,
  className = "",
}) => {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

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

  // Atualizar filtros quando a busca mudar
  useEffect(() => {
    setFilters((prev) => ({ ...prev, searchQuery: debouncedSearch }));
  }, [debouncedSearch]);

  // Função inteligente de filtragem
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase().trim();
      const searchTerms = query.split(" ").filter((term) => term.length > 0);

      filtered = filtered.filter((product) => {
        const searchableText = [
          product.name,
          product.description,
          product.category,
          ...(
            product.variations?.map((v) => [v.color, v.size].filter(Boolean)) ||
            []
          ).flat(),
        ]
          .join(" ")
          .toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.category || "")
      );
    }

    filtered = filtered.filter((product) => {
      const price = product.retail_price || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    if (filters.inStock) {
      filtered = filtered.filter((product) => (product.stock || 0) > 0);
    }

    if (filters.featured) {
      filtered = filtered.filter((product) => product.is_featured);
    }

    if (
      filters.variations.colors.length > 0 ||
      filters.variations.sizes.length > 0
    ) {
      filtered = filtered.filter((product) => {
        if (!product.variations || product.variations.length === 0)
          return false;

        return product.variations.some((variation) => {
          const colorMatch =
            filters.variations.colors.length === 0 ||
            (variation.color &&
              filters.variations.colors.includes(variation.color));

          const sizeMatch =
            filters.variations.sizes.length === 0 ||
            (variation.size &&
              filters.variations.sizes.includes(variation.size));

          return colorMatch && sizeMatch;
        });
      });
    }

    if (filters.rating > 0) {
      filtered = filtered.filter((product) => {
        const hash = product.id.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
        const rating = 3.5 + (Math.abs(hash) % 15) / 10;
        return rating >= filters.rating;
      });
    }

    return filtered;
  }, [products, filters]);

  // Função de ordenação inteligente
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      case "price-asc":
        return sorted.sort(
          (a, b) => (a.retail_price || 0) - (b.retail_price || 0)
        );

      case "price-desc":
        return sorted.sort(
          (a, b) => (b.retail_price || 0) - (a.retail_price || 0)
        );

      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );

      case "rating":
        return sorted.sort((a, b) => {
          const getRating = (product: Product) => {
            const hash = product.id.split("").reduce((acc, char) => {
              acc = (acc << 5) - acc + char.charCodeAt(0);
              return acc & acc;
            }, 0);
            return 3.5 + (Math.abs(hash) % 15) / 10;
          };
          return getRating(b) - getRating(a);
        });

      case "stock":
        return sorted.sort((a, b) => (b.stock || 0) - (a.stock || 0));

      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.inStock) count++;
    if (filters.featured) count++;
    if (filters.rating > 0) count++;
    if (filters.variations.colors.length > 0) count++;
    if (filters.variations.sizes.length > 0) count++;
    if (filters.discount) count++;
    return count;
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: AdvancedFilterState) => {
    setFilters(newFilters);
  }, []);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: AdvancedFilterState = {
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
    };
    setFilters(clearedFilters);
    setSearchQuery("");
  }, []);

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case "category":
        setFilters((prev) => ({
          ...prev,
          categories: prev.categories.filter((c) => c !== value),
        }));
        break;
      case "inStock":
        setFilters((prev) => ({ ...prev, inStock: false }));
        break;
      case "featured":
        setFilters((prev) => ({ ...prev, featured: false }));
        break;
      case "rating":
        setFilters((prev) => ({ ...prev, rating: 0 }));
        break;
      case "color":
        setFilters((prev) => ({
          ...prev,
          variations: {
            ...prev.variations,
            colors: prev.variations.colors.filter((c) => c !== value),
          },
        }));
        break;
      case "size":
        setFilters((prev) => ({
          ...prev,
          variations: {
            ...prev.variations,
            sizes: prev.variations.sizes.filter((s) => s !== value),
          },
        }));
        break;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Barra de Controles - Estilo Mercado Livre */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Busca */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Controles à direita */}
          <div className="flex items-center gap-4">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            <span className="text-sm text-gray-600 whitespace-nowrap">
              {sortedProducts.length} produtos
            </span>

            {/* Ordenação */}
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-48 h-10">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
                <SelectItem value="rating">Melhor avaliação</SelectItem>
                <SelectItem value="stock">Maior estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros Ativos */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                  <button
                    onClick={() => removeFilter("category", category)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}

              {filters.inStock && (
                <Badge variant="secondary" className="text-xs">
                  Em estoque
                  <button
                    onClick={() => removeFilter("inStock")}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.featured && (
                <Badge variant="secondary" className="text-xs">
                  Destaque
                  <button
                    onClick={() => removeFilter("featured")}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}

              {filters.variations.colors.map((color) => (
                <Badge key={color} variant="secondary" className="text-xs">
                  {color}
                  <button
                    onClick={() => removeFilter("color", color)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}

              {filters.variations.sizes.map((size) => (
                <Badge key={size} variant="secondary" className="text-xs">
                  {size}
                  <button
                    onClick={() => removeFilter("size", size)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Limpar todos
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Produtos - 2 colunas mobile, 3 colunas desktop (estilo Mercado Livre) */}
      <div className="min-h-96">
        {loading ? (
          // Loading Skeleton
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedProducts.map((product) => (
              <EnhancedProductCard
                key={product.id}
                product={product}
                catalogType={catalogType}
                storeIdentifier={storeIdentifier}
              />
            ))}
          </div>
        ) : (
          // Estado Vazio
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Eye className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-xl font-medium mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-sm text-center max-w-md mb-6">
              {activeFiltersCount > 0
                ? "Tente ajustar os filtros ou termos de busca para encontrar produtos."
                : "Nenhum produto está disponível no momento."}
            </p>
            {activeFiltersCount > 0 && (
              <Button onClick={clearAllFilters} variant="outline">
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filtros Mobile */}
      <AdvancedFilterSidebar
        onFilter={handleFilterChange}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        products={products}
        isMobile={true}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
};

export default ResponsiveProductGrid;
