
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCatalog, CatalogType } from '@/hooks/useCatalog';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/hooks/use-toast';
import TemplateWrapper from './TemplateWrapper';
import HeroBanner from './banners/HeroBanner';
import ResponsiveProductGrid from './ResponsiveProductGrid';
import ProductDetailsModal from './ProductDetailsModal';
import FloatingCart from './FloatingCart';
import AdvancedFilterSidebar from './AdvancedFilterSidebar';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ShoppingCart, 
  Heart, 
  Package, 
  Loader2, 
  AlertTriangle,
  X
} from 'lucide-react';

interface PublicCatalogProps {}

const PublicCatalog: React.FC<PublicCatalogProps> = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [searchParams] = useSearchParams();
  const catalogType = (searchParams.get('type') as CatalogType) || 'retail';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  
  const catalogRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    store,
    products: allProducts,
    filteredProducts,
    loading: storeLoading,
    storeError,
    initializeCatalog,
    searchProducts,
    filterProducts
  } = useCatalog();

  // Inicializar catálogo quando componente montar
  useEffect(() => {
    if (storeSlug) {
      console.log('🚀 PUBLIC CATALOG - Inicializando catálogo:', { storeSlug, catalogType });
      initializeCatalog(storeSlug, catalogType);
    }
  }, [storeSlug, catalogType, initializeCatalog]);

  // Simular categorias a partir dos produtos
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(
      allProducts
        .map(p => p.category)
        .filter(Boolean)
    );
    return Array.from(uniqueCategories);
  }, [allProducts]);

  // Extrair cores e tamanhos únicos dos produtos
  const availableOptions = React.useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    allProducts.forEach(product => {
      const price = catalogType === 'wholesale' && product.wholesale_price 
        ? product.wholesale_price 
        : product.retail_price;
      
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);

      if (product.variations) {
        product.variations.forEach(variation => {
          if (variation.color) colors.add(variation.color);
          if (variation.size) sizes.add(variation.size);
        });
      }
    });

    return {
      colors: Array.from(colors),
      sizes: Array.from(sizes),
      priceRange: [Math.max(0, minPrice), maxPrice] as [number, number]
    };
  }, [allProducts, catalogType]);

  const { addItem, totalItems: totalCartItems } = useCart();
  const { 
    wishlist, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  } = useWishlist();

  // Busca em tempo real
  useEffect(() => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    } else {
      // Aplicar filtros quando não há busca
      filterProducts({
        category: appliedFilters.categories?.[0],
        minPrice: appliedFilters.priceRange?.[0],
        maxPrice: appliedFilters.priceRange?.[1], 
        inStock: appliedFilters.inStock,
        variations: {
          colors: appliedFilters.colors,
          sizes: appliedFilters.sizes
        }
      });
    }
  }, [searchQuery, appliedFilters, searchProducts, filterProducts]);

  const handleFilterChange = (newFilters: any) => {
    setAppliedFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleAddToCart = (product: Product, quantity = 1, variation?: any) => {
    try {
      // Corrigir o objeto de variação para incluir todas as propriedades obrigatórias
      const completeVariation = variation ? {
        id: variation.id || `${product.id}-var-${Date.now()}`,
        product_id: product.id,
        color: variation.color || null,
        size: variation.size || null,
        sku: variation.sku || null,
        stock: variation.stock || 0,
        price_adjustment: variation.price_adjustment || 0,
        is_active: variation.is_active !== undefined ? variation.is_active : true,
        created_at: variation.created_at || new Date().toISOString(),
        updated_at: variation.updated_at || new Date().toISOString(),
      } : undefined;

      addItem({
        id: completeVariation ? `${product.id}-${completeVariation.id}` : product.id || '',
        product: {
          id: product.id || '',
          name: product.name,
          retail_price: product.retail_price,
          wholesale_price: product.wholesale_price,
          min_wholesale_qty: product.min_wholesale_qty,
          image_url: product.image_url,
          store_id: product.store_id,
          stock: product.stock,
          allow_negative_stock: product.allow_negative_stock || false,
          enable_gradual_wholesale: product.enable_gradual_wholesale,
          price_model: product.price_model,
        },
        quantity,
        price: catalogType === 'wholesale' && product.wholesale_price 
          ? product.wholesale_price 
          : product.retail_price,
        originalPrice: product.retail_price,
        variation: completeVariation,
        catalogType,
      });

      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao carrinho.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho.",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = (product: Product) => {
    if (isInWishlist(product.id || '')) {
      removeFromWishlist(product.id || '');
      toast({
        title: "Removido dos favoritos",
        description: `${product.name} foi removido da lista de desejos.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Adicionado aos favoritos!",
        description: `${product.name} foi adicionado à lista de desejos.`,
      });
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (appliedFilters.categories?.length) count += appliedFilters.categories.length;
    if (appliedFilters.colors?.length) count += appliedFilters.colors.length;
    if (appliedFilters.sizes?.length) count += appliedFilters.sizes.length;
    if (appliedFilters.inStock) count += 1;
    if (searchQuery.trim()) count += 1;
    return count;
  };

  const clearAllFilters = () => {
    setAppliedFilters({});
    setSearchQuery('');
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold">Carregando catálogo...</h2>
          <p className="text-muted-foreground">Aguarde enquanto buscamos os produtos.</p>
        </div>
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Loja não encontrada</h2>
          <p className="text-muted-foreground max-w-md">
            {storeError || 'A loja que você está procurando não existe ou está inativa.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TemplateWrapper
      templateName="modern"
      store={store}
      catalogType={catalogType}
      cartItemsCount={totalCartItems}
      wishlistCount={wishlist.length}
      onSearch={setSearchQuery}
      onToggleFilters={() => setShowFilters(!showFilters)}
      onCartClick={() => {}}
    >
      <div className="flex gap-6">
        {/* Sidebar de Filtros */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-4">
            <AdvancedFilterSidebar
              isOpen={true}
              onClose={() => {}}
              availableCategories={categories}
              availableColors={availableOptions.colors}
              availableSizes={availableOptions.sizes}
              priceRange={availableOptions.priceRange}
              onFilterChange={handleFilterChange}
              activeFilters={appliedFilters}
            />
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 min-w-0">
          {/* Banner Hero */}
          <HeroBanner storeId={store.id} className="mb-8" />

          {/* Seção do Catálogo */}
          <div ref={catalogRef} className="space-y-6">
            {/* Barra de Busca e Controles */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Campo de Busca */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Botões de Controle */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 lg:hidden"
                  >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none border-r"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Informações de Resultados e Filtros Ativos */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                  </span>
                  
                  {/* Filtros Ativos */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {searchQuery && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Busca: "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery('')}
                          className="ml-1 hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    
                    {getActiveFilterCount() > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {totalCartItems > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" />
                      {totalCartItems} no carrinho
                    </Badge>
                  )}
                  {wishlist.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {wishlist.length} favorito{wishlist.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Grid de Produtos */}
            <ResponsiveProductGrid
              products={filteredProducts}
              catalogType={catalogType}
              loading={storeLoading}
              onAddToWishlist={handleAddToWishlist}
              onQuickView={setSelectedProduct}
              onAddToCart={handleAddToCart}
              wishlist={wishlist}
              storeIdentifier={storeSlug || ''}
              templateName="modern"
              showPrices={true}
              showStock={true}
            />
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Produto */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        catalogType={catalogType}
      />

      {/* Sidebar de Filtros Mobile */}
      <AdvancedFilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        availableCategories={categories}
        availableColors={availableOptions.colors}
        availableSizes={availableOptions.sizes}
        priceRange={availableOptions.priceRange}
        onFilterChange={handleFilterChange}
        activeFilters={appliedFilters}
      />

      {/* Carrinho Flutuante */}
      <FloatingCart
        onCheckout={() => {
          console.log('Ir para checkout');
        }}
        storeId={store.id}
      />
    </TemplateWrapper>
  );
};

export default PublicCatalog;
