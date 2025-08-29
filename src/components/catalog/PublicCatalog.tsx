
import React, { useState, useEffect } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';
import { useCart } from '@/hooks/useCart';
import { createCartItem } from '@/utils/cartHelpers';
import { Product } from '@/hooks/useProducts';
import { ProductVariation } from '@/types/variation';
import { CatalogType } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import ProductDetailsModal from './ProductDetailsModal';
import FloatingCart from './FloatingCart';
import TemplateWrapper from './TemplateWrapper';
import ProductGrid from './ProductGrid';

interface PublicCatalogProps {
  storeIdentifier: string;
  catalogType: CatalogType;
}

const PublicCatalog: React.FC<PublicCatalogProps> = ({ 
  storeIdentifier, 
  catalogType 
}) => {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  
  // Usar hook global do carrinho
  const { 
    items: cartItems, 
    addItem, 
    removeItem, 
    updateQuantity, 
    totalItems,
    clearCart 
  } = useCart();

  const { 
    store, 
    products, 
    filteredProducts,
    loading, 
    storeError 
  } = useCatalog(storeIdentifier, catalogType);
  
  const { settings } = useCatalogSettings(storeIdentifier);

  // Função para adicionar ao carrinho usando o hook global
  const handleAddToCart = (
    product: Product, 
    quantity: number = 1, 
    variation?: ProductVariation
  ) => {
    console.log('🛒 PUBLIC CATALOG - Adicionando ao carrinho:', {
      productId: product.id,
      productName: product.name,
      quantity,
      catalogType,
      variation: variation ? {
        id: variation.id,
        color: variation.color,
        size: variation.size
      } : null
    });

    try {
      // Usar helper para criar item compatível
      const cartItem = createCartItem(product, catalogType, quantity, variation);
      
      // Adicionar usando o hook global
      addItem(cartItem);
      
      console.log('✅ PUBLIC CATALOG - Item adicionado com sucesso ao carrinho global');
      
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao carrinho.`,
        duration: 2000
      });
      
    } catch (error) {
      console.error('❌ PUBLIC CATALOG - Erro ao adicionar ao carrinho:', error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleAddToWishlist = (product: Product) => {
    console.log('💝 PUBLIC CATALOG - Adicionando à wishlist:', product.name);
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.id === product.id);
      if (isInWishlist) {
        toast({
          title: "Removido da wishlist",
          description: `${product.name} foi removido da sua lista de desejos.`,
          duration: 2000
        });
        return prev.filter(item => item.id !== product.id);
      } else {
        toast({
          title: "Adicionado à wishlist",
          description: `${product.name} foi adicionado à sua lista de desejos.`,
          duration: 2000
        });
        return [...prev, product];
      }
    });
  };

  const handleProductClick = (product: Product) => {
    console.log('👆 PUBLIC CATALOG - Produto clicado:', product.name);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('❌ PUBLIC CATALOG - Fechando modal');
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Log para debug do estado do carrinho
  useEffect(() => {
    console.log('🔍 PUBLIC CATALOG - Estado do carrinho:', {
      totalItems,
      itemsCount: cartItems.length,
      catalogType
    });
  }, [cartItems, totalItems, catalogType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar o catálogo</p>
          <p className="text-gray-600">{storeError}</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loja não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TemplateWrapper
        templateName={settings?.template_name || 'modern'}
        store={store}
        catalogType={catalogType}
        cartItemsCount={totalItems}
        wishlistCount={wishlist.length}
        whatsappNumber={store.phone || undefined}
        onSearch={(query) => console.log('Search:', query)}
        onToggleFilters={() => console.log('Toggle filters')}
        onCartClick={() => console.log('Cart clicked')}
      >
        <ProductGrid
          products={filteredProducts}
          catalogType={catalogType}
          loading={loading}
          onAddToWishlist={handleAddToWishlist}
          onQuickView={handleProductClick}
          wishlist={wishlist}
          storeIdentifier={storeIdentifier}
          templateName={settings?.template_name || 'modern'}
          showPrices={true}
          showStock={true}
          onAddToCart={handleAddToCart}
        />
      </TemplateWrapper>

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
          catalogType={catalogType}
        />
      )}

      {/* Carrinho Flutuante */}
      <FloatingCart />
    </div>
  );
};

export default PublicCatalog;
