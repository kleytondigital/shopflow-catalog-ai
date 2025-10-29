import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSubdomainStore } from "@/hooks/useSubdomainStore";
import { getSubdomainInfo } from "@/utils/subdomainRouter";
import { supabase } from "@/integrations/supabase/client";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import { useConversionTracking } from "@/hooks/useConversionTracking";
import TemplateWrapper from "@/components/catalog/TemplateWrapper";
import ProductDetailsModalOptimized from "@/components/catalog/ProductDetailsModalOptimized";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, ProductVariation } from "@/types/product";

/**
 * Product page specifically for subdomain routing
 * Renders a product page in the public catalog context
 */
const SubdomainProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { store, loading: storeLoading, error: storeError } = useSubdomainStore();
  const { subdomain } = getSubdomainInfo();
  const { settings } = useCatalogSettings();
  const { trackProductView } = useConversionTracking();

  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);

  useEffect(() => {
    if (store && productId) {
      loadProduct();
    }
  }, [store, productId]);

  const loadProduct = async () => {
    if (!store || !productId) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar produto
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('store_id', store.id)
        .eq('is_active', true)
        .single();

      if (productError) {
        console.error('Erro ao carregar produto:', productError);
        setError('Produto não encontrado');
        return;
      }

      if (!productData) {
        setError('Produto não encontrado');
        return;
      }

      setProduct(productData);

      // Buscar variações do produto
      const { data: variationsData, error: variationsError } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true);

      if (variationsError) {
        console.error('Erro ao carregar variações:', variationsError);
      } else {
        setVariations(variationsData || []);
        if (variationsData && variationsData.length > 0) {
          setSelectedVariation(variationsData[0]);
        }
      }

      // Track product view
      trackProductView({
        id: productData.id,
        name: productData.name,
        category: productData.category,
        price: productData.retail_price || 0
      });

    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCatalog = () => {
    window.location.href = `https://${subdomain}.aoseudispor.com.br`;
  };

  if (storeLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Carregando produto
          </h2>
          <p className="text-gray-600">
            {subdomain}.aoseudispor.com.br
          </p>
        </div>
      </div>
    );
  }

  if (storeError || error || !store || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Produto não encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            {storeError || error || 'O produto solicitado não está disponível'}
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Loja:</strong> <code>{subdomain}.aoseudispor.com.br</code>
            </p>
            {productId && (
              <p className="text-sm text-gray-700 mt-1">
                <strong>Produto ID:</strong> <code>{productId}</code>
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleBackToCatalog}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Catálogo
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Convert SubdomainStoreInfo to Store interface
  const storeAdapter = {
    id: store.id,
    name: store.name,
    description: null,
    logo_url: null,
    owner_id: store.owner_id,
    is_active: true,
    created_at: store.created_at,
    updated_at: store.created_at,
    url_slug: store.slug,
    phone: null,
    email: null,
    address: null,
    cnpj: null,
    plan_type: 'basic',
    monthly_fee: 0,
    price_model: 'retail'
  };

  // Render product in catalog template context
  return (
    <TemplateWrapper
      templateName={settings?.template_name || 'modern'}
      store={storeAdapter}
      catalogType="retail"
      cartItemsCount={0}
      wishlistCount={0}
      storeSettings={settings}
      onSearch={() => {}}
      onToggleFilters={() => {}}
      onCartClick={() => {}}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Back to catalog button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToCatalog}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Catálogo
          </Button>
        </div>

        {/* Product details modal as full page */}
        <div className="max-w-7xl mx-auto">
          <ProductDetailsModalOptimized
            product={product}
            isOpen={true}
            onClose={handleBackToCatalog}
            onAddToCart={() => console.log('Add to cart')}
            catalogType="retail"
            showStock={true}
            showPrices={true}
            storeName={store.name}
            showConversionElements={true}
          />
        </div>
      </div>
    </TemplateWrapper>
  );
};

export default SubdomainProductPage;
