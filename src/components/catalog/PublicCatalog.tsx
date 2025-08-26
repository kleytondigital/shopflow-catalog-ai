import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart, ShoppingCart, Search, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { useCatalog } from "@/hooks/useCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import { useTemplateColors } from "@/hooks/useTemplateColors";
import { useGlobalTemplateStyles } from "@/hooks/useGlobalTemplateStyles";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { useFloatingCart } from "@/hooks/useFloatingCart";
import { useToast } from "@/hooks/use-toast";
import TemplateWrapper from "./TemplateWrapper";
import ProductCard from "./ProductCard";
import EnhancedProductCard from "./EnhancedProductCard";
import ProductDetailsModal from "@/components/catalog/ProductDetailsModal";
import FloatingCart from "./FloatingCart";
import DynamicMetaTags from "@/components/seo/DynamicMetaTags";

interface PublicCatalogProps {
  catalogType?: "retail" | "wholesale";
}

const PublicCatalog: React.FC<PublicCatalogProps> = ({
  catalogType = "retail",
}) => {
  const { storeIdentifier } = useParams<{ storeIdentifier: string }>();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistCount] = useState(0);
  
  const { user } = useAuth();
  const { addItem, totalItems } = useShoppingCart();
  const { toast } = useToast();
  const { 
    isVisible: isCartVisible, 
    showCart, 
    hideCart, 
    toggleCart 
  } = useFloatingCart();

  console.log('🔍 PublicCatalog: storeIdentifier recebido:', storeIdentifier);

  // Verificar se temos storeIdentifier
  if (!storeIdentifier) {
    console.error('❌ PublicCatalog: storeIdentifier não fornecido');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">URL Inválida</h1>
          <p className="text-muted-foreground mb-6">
            O identificador da loja não foi fornecido na URL.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use uma URL como: <br />
              <code className="bg-muted px-2 py-1 rounded text-xs">
                /catalog/nome-da-loja
              </code>
            </p>
            <Button asChild>
              <a href="/catalog">Ver Catálogos Disponíveis</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Inicializar hooks
  const { store, products, filteredProducts, loading, storeError, searchProducts } = useCatalog(
    storeIdentifier, 
    catalogType
  );
  const { settings, loading: settingsLoading } = useCatalogSettings(storeIdentifier);
  const { colorScheme, applyColorsToDocument, templateName } = useTemplateColors(storeIdentifier);
  const { getMobileGridClasses } = useMobileLayout(storeIdentifier);
  
  // Aplicar estilos globais do template
  useGlobalTemplateStyles(storeIdentifier);

  // Aplicar cores ao documento quando carregadas
  useEffect(() => {
    if (colorScheme && !loading && !settingsLoading) {
      applyColorsToDocument();
    }
  }, [colorScheme, loading, settingsLoading, applyColorsToDocument]);

  useEffect(() => {
    if (store?.id && !loading) {
      console.log("✅ Loja carregada:", store.name, "ID:", store.id);
    }
  }, [store, loading]);

  const handleAddToCart = (product: any, quantity: number = 1, selectedVariation?: any) => {
    addItem(product, quantity);
    
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });

    // Mostrar carrinho brevemente após adicionar item
    setTimeout(() => {
      if (!isCartVisible) {
        showCart();
        setTimeout(() => hideCart(), 3000); // Auto-hide após 3s
      }
    }, 500);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (searchProducts) {
      searchProducts(query);
    }
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCartClick = () => {
    toggleCart();
  };

  const filteredProductsDisplay = searchTerm 
    ? products?.filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
    : products;

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando loja {storeIdentifier}...</p>
        </div>
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Loja não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            {storeError || "A loja que você está procurando não existe ou foi removida."}
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              Identificador buscado:
            </p>
            <code className="bg-background px-2 py-1 rounded text-xs">
              {storeIdentifier}
            </code>
          </div>
          <div className="space-y-4">
            <Button asChild>
              <a href="/catalog">Ver Catálogos Disponíveis</a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Lojas disponíveis: cactus-branco, cheio-de-desejo, viver-melhor, atlanz
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="template-container">
      <DynamicMetaTags
        storeIdentifier={storeIdentifier}
        catalogType={catalogType}
        customTitle={`${store.name} - Catálogo ${catalogType === "wholesale" ? "Atacado" : "Varejo"}`}
        customDescription={store.description}
      />

      <TemplateWrapper
        templateName={templateName}
        store={store}
        catalogType={catalogType}
        cartItemsCount={totalItems}
        wishlistCount={wishlistCount}
        whatsappNumber={settings?.whatsapp_number}
        onSearch={handleSearch}
        onToggleFilters={handleToggleFilters}
        onCartClick={handleCartClick}
      >
        {/* Barra de Filtros */}
        {showFilters && (
          <div className="bg-card p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Buscar produtos..."
                    className="pl-10 pr-4"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid de Produtos */}
        <div className={getMobileGridClasses()}>
          {filteredProductsDisplay?.map((product) => (
            <EnhancedProductCard
              key={product.id}
              product={product}
              catalogType={catalogType}
              onClick={() => handleProductClick(product)}
              onAddToCart={handleAddToCart}
              storeIdentifier={storeIdentifier}
            />
          ))}
        </div>

        {filteredProductsDisplay?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? `Nenhum produto encontrado para "${searchTerm}".` : "Nenhum produto encontrado."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => handleSearch("")}
                className="mt-4"
              >
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </TemplateWrapper>

      {/* Carrinho Flutuante */}
      <FloatingCart />

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          catalogType={catalogType}
        />
      )}
    </div>
  );
};

export default PublicCatalog;
