
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductVariation } from '@/types/product';

export interface ProductFormData {
  name: string;
  description: string;
  retail_price: number;
  wholesale_price?: number;
  min_wholesale_qty?: number;
  stock: number;
  category?: string;
  keywords?: string;
  meta_title?: string;
  meta_description?: string;
  seo_slug?: string;
  is_featured?: boolean;
  allow_negative_stock?: boolean;
  stock_alert_threshold?: number;
  is_active?: boolean;
  variations?: ProductVariation[];
  price_tiers?: {
    id: string;
    name: string;
    minQuantity: number;
    price: number;
    enabled: boolean;
  }[];
  store_id?: string;
}

export interface Step {
  id: number;
  label: string;
  title: string;
  description: string;
}

export const useProductFormWizard = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPriceTiers, setIsLoadingPriceTiers] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    retail_price: 0,
    wholesale_price: undefined,
    min_wholesale_qty: 1,
    stock: 0,
    category: '',
    keywords: '',
    meta_title: '',
    meta_description: '',
    seo_slug: '',
    is_featured: false,
    allow_negative_stock: false,
    stock_alert_threshold: 5,
    is_active: true,
    variations: [],
    price_tiers: []
  });

  const steps: Step[] = [
    {
      id: 0,
      label: 'Básico',
      title: 'Informações Básicas',
      description: 'Nome, descrição e categoria do produto'
    },
    {
      id: 1,
      label: 'Preços',
      title: 'Preço e Estoque',
      description: 'Definir preços e controle de estoque'
    },
    {
      id: 2,
      label: 'Imagens',
      title: 'Imagens do Produto',
      description: 'Adicionar fotos do produto'
    },
    {
      id: 3,
      label: 'Variações',
      title: 'Variações do Produto',
      description: 'Cores, tamanhos e outras variações'
    },
    {
      id: 4,
      label: 'SEO',
      title: 'Otimização SEO',
      description: 'Configurações para motores de busca'
    },
    {
      id: 5,
      label: 'Avançado',
      title: 'Configurações Avançadas',
      description: 'Configurações extras do produto'
    }
  ];

  const updateFormData = useCallback((data: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      retail_price: 0,
      wholesale_price: undefined,
      min_wholesale_qty: 1,
      stock: 0,
      category: '',
      keywords: '',
      meta_title: '',
      meta_description: '',
      seo_slug: '',
      is_featured: false,
      allow_negative_stock: false,
      stock_alert_threshold: 5,
      is_active: true,
      variations: [],
      price_tiers: []
    });
    setCurrentStep(0);
    setProductId(null);
  }, []);

  const loadProductForEditing = useCallback((product: any) => {
    console.log('📥 Loading product for editing:', product);
    setProductId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      retail_price: product.retail_price || 0,
      wholesale_price: product.wholesale_price,
      min_wholesale_qty: product.min_wholesale_qty || 1,
      stock: product.stock || 0,
      category: product.category || '',
      keywords: product.keywords || '',
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      seo_slug: product.seo_slug || '',
      is_featured: product.is_featured || false,
      allow_negative_stock: product.allow_negative_stock || false,
      stock_alert_threshold: product.stock_alert_threshold || 5,
      is_active: product.is_active !== false,
      variations: product.variations || [],
      price_tiers: product.price_tiers || []
    });
  }, []);

  const cancelAndCleanup = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: // Básico
        return formData.name.trim().length > 0;
      case 1: // Preços
        return formData.retail_price > 0 && formData.stock >= 0;
      default:
        return true;
    }
  }, [currentStep, formData]);

  const saveProduct = async (productFormData: ProductFormData): Promise<string | null> => {
    setIsSaving(true);
    
    try {
      console.log('💾 Salvando produto:', productFormData);

      const productData = {
        name: productFormData.name,
        description: productFormData.description || '',
        retail_price: productFormData.retail_price,
        wholesale_price: productFormData.wholesale_price,
        min_wholesale_qty: productFormData.min_wholesale_qty || 1,
        stock: productFormData.stock,
        category: productFormData.category || '',
        keywords: productFormData.keywords || '',
        meta_title: productFormData.meta_title || '',
        meta_description: productFormData.meta_description || '',
        seo_slug: productFormData.seo_slug || '',
        is_featured: productFormData.is_featured || false,
        allow_negative_stock: productFormData.allow_negative_stock || false,
        stock_alert_threshold: productFormData.stock_alert_threshold || 5,
        is_active: productFormData.is_active !== false,
        store_id: productFormData.store_id
      };

      let result;
      
      if (productId) {
        // Atualizar produto existente
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single();
      } else {
        // Criar novo produto
        result = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const savedProduct = result.data;
      setProductId(savedProduct.id);

      toast({
        title: productId ? "Produto atualizado" : "Produto criado",
        description: `${savedProduct.name} foi ${productId ? 'atualizado' : 'criado'} com sucesso!`,
      });

      return savedProduct.id;
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: `Falha ao ${productId ? 'atualizar' : 'criar'} produto: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    currentStep,
    steps,
    formData,
    isSaving,
    isLoadingPriceTiers,
    productId,
    totalSteps: steps.length,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    saveProduct,
    resetForm,
    loadProductForEditing,
    cancelAndCleanup,
    canProceed
  };
};

// Export ProductVariation for compatibility
export { ProductVariation } from '@/types/product';
