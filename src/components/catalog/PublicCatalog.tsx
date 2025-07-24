
import React, { useState, useEffect, useCallback } from "react";
import { useCatalog, CatalogType } from "@/hooks/useCatalog";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import { useGlobalTemplateStyles } from "@/hooks/useGlobalTemplateStyles";
import ProductGrid from "./ProductGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Product } from "@/types/product";

export interface PublicCatalogProps {
  storeIdentifier: string;
  catalogType?: CatalogType;
}

export default function PublicCatalog({ storeIdentifier, catalogType = 'retail' }: PublicCatalogProps) {
  const { store, products, loading, storeError } = useCatalog(storeIdentifier, catalogType);
  const { settings, loading: settingsLoading } = useCatalogSettings(storeIdentifier);
  const { isReady, templateName } = useGlobalTemplateStyles(storeIdentifier);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleSearch = useCallback(() => {
    if (!products) return;

    const results = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleAddToWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const isAlreadyInWishlist = prev.some(item => item.id === product.id);
      if (isAlreadyInWishlist) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const handleQuickView = useCallback((product: Product) => {
    console.log('Quick view:', product);
    // Implementar modal de visualização rápida se necessário
  }, []);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  useEffect(() => {
    if (products) {
      setFilteredProducts(products);
    }
  }, [products]);

  // Mostrar erro se a loja não foi encontrada
  if (storeError) {
    return (
      <div className="min-h-screen bg-template-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-template-text mb-2">Loja não encontrada</h1>
          <p className="text-gray-600">{storeError}</p>
        </div>
      </div>
    );
  }

  // Mostrar loading enquanto carrega a loja
  if (loading || !store) {
    return (
      <div className="min-h-screen bg-template-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-template-primary mx-auto mb-4"></div>
          <p className="text-template-text">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-template-background">
      <header className="bg-template-surface py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-template-text">
            {store.name}
          </h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a href="#" className="text-template-text hover:text-template-primary">
                  Início
                </a>
              </li>
              <li>
                <a href="#" className="text-template-text hover:text-template-primary">
                  Produtos
                </a>
              </li>
              <li>
                <a href="#" className="text-template-text hover:text-template-primary">
                  Contato
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Input
              type="search"
              placeholder="Buscar produtos..."
              className="mr-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
          <Button variant="outline" size="sm" onClick={toggleFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className={`lg:col-span-1 p-4 bg-template-surface rounded-md shadow-sm ${showFilters ? '' : 'hidden lg:block'}`}>
            <h3 className="font-semibold mb-4 text-template-text">Filtros</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-template-text">Categoria</h4>
                <ul className="mt-2 space-y-1">
                  <li>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Eletrônicos
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Vestuário
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Casa e Decoração
                    </label>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-template-text">Preço</h4>
                <div className="mt-2 space-y-1">
                  <label className="flex items-center">
                    <input type="radio" name="price" className="mr-2" />
                    Até R$50
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="price" className="mr-2" />
                    R$50 - R$100
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="price" className="mr-2" />
                    Acima de R$100
                  </label>
                </div>
              </div>
            </div>
          </aside>
          
          <div className="lg:col-span-3">
            <ProductGrid
              products={filteredProducts}
              catalogType={catalogType}
              loading={loading}
              onAddToWishlist={handleAddToWishlist}
              onQuickView={handleQuickView}
              wishlist={wishlist}
              storeIdentifier={storeIdentifier}
              templateName={settings?.template_name || 'minimal'}
              showPrices={true}
              showStock={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
