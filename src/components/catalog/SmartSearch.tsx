import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, TrendingUp, Clock, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SmartSearchProps {
  products: Product[];
  onSearch: (query: string) => void;
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  products,
  onSearch,
  onProductSelect,
  placeholder = "Buscar produtos...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar buscas recentes:", e);
      }
    }
  }, []);

  // Salvar busca recente
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  // Filtrar produtos relevantes
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    
    return products
      .filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const categoryMatch = product.category?.toLowerCase().includes(searchTerm);
        const descriptionMatch = product.description?.toLowerCase().includes(searchTerm);
        
        return nameMatch || categoryMatch || descriptionMatch;
      })
      .slice(0, 8); // Limitar a 8 resultados
  }, [query, products]);

  // Produtos populares (mais vendidos ou em destaque)
  const popularProducts = useMemo(() => {
    return products
      .filter((p) => p.is_featured)
      .slice(0, 5);
  }, [products]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredProducts[selectedIndex]) {
        handleProductClick(filteredProducts[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      onSearch(value);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query);
      onSearch(query);
      setIsOpen(false);
      if (isMobile) {
        inputRef.current?.blur();
      }
    }
  };

  const handleProductClick = (product: Product) => {
    setQuery(product.name);
    saveRecentSearch(product.name);
    setIsOpen(false);
    onProductSelect?.(product);
    if (isMobile) {
      inputRef.current?.blur();
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    onSearch(search);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${
            isMobile ? "h-12 text-base" : "h-10"
          } bg-white border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20`}
        />

        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown de autocomplete */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden ${
            isMobile ? "max-h-[70vh]" : "max-h-96"
          } overflow-y-auto`}
        >
          {/* Resultados da busca */}
          {query.trim() && filteredProducts.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 flex items-center gap-2">
                <Search className="h-3 w-3" />
                Resultados ({filteredProducts.length})
              </div>
              
              {filteredProducts.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedIndex === index
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Imagem do produto */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info do produto */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {product.name}
                    </div>
                    {product.category && (
                      <div className="text-xs text-gray-500 truncate">
                        {product.category}
                      </div>
                    )}
                  </div>

                  {/* Preço */}
                  <div className="flex-shrink-0 text-sm font-semibold text-primary">
                    {formatCurrency(product.retail_price || 0)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Sem resultados */}
          {query.trim() && filteredProducts.length === 0 && (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Nenhum produto encontrado para "{query}"
              </p>
            </div>
          )}

          {/* Buscas recentes */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs font-medium text-gray-500 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Buscas Recentes
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-6 text-xs"
                >
                  Limpar
                </Button>
              </div>
              
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-left">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Produtos populares/em destaque */}
          {!query.trim() && popularProducts.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Em Destaque
              </div>
              
              {popularProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-primary font-semibold">
                      {formatCurrency(product.retail_price || 0)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Mensagem quando não há conteúdo */}
          {!query.trim() && recentSearches.length === 0 && popularProducts.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Digite para buscar produtos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;


