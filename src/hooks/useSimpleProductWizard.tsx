
import { useState, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useSimpleDraftImages } from '@/hooks/useSimpleDraftImages';
import { useProductVariations } from '@/hooks/useProductVariations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CreateProductData } from '@/types/product';

export interface SimpleProductFormData extends CreateProductData {
  variations?: any[];
}

export interface SimpleWizardStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export const useSimpleProductWizard = () => {
  const { createProduct, updateProduct } = useProducts();
  const { images, uploadImages, clearImages, loadExistingImages } = useSimpleDraftImages();
  const { saveVariations } = useProductVariations();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado do formulário com valores padrão seguros
  const [formData, setFormData] = useState<SimpleProductFormData>({
    store_id: profile?.store_id || '',
    name: '',
    description: '',
    retail_price: 0,
    wholesale_price: undefined,
    category: '',
    stock: 0,
    min_wholesale_qty: 1,
    meta_title: '',
    meta_description: '',
    keywords: '',
    seo_slug: '',
    is_featured: false,
    allow_negative_stock: false,
    stock_alert_threshold: 5,
    is_active: true,
    variations: []
  });

  const steps: SimpleWizardStep[] = [
    { id: 'basic', title: 'Informações Básicas', description: 'Nome, descrição e categoria', required: true },
    { id: 'pricing', title: 'Preços e Estoque', description: 'Valores e quantidades', required: true },
    { id: 'variations', title: 'Variações', description: 'Cores, tamanhos e opções', required: false },
    { id: 'images', title: 'Imagens', description: 'Fotos do produto', required: false },
    { id: 'seo', title: 'SEO e Metadados', description: 'Otimização para buscas', required: false },
    { id: 'advanced', title: 'Configurações Avançadas', description: 'Opções extras', required: false }
  ];

  const updateFormData = useCallback((updates: Partial<SimpleProductFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      // Garantir que store_id está sempre presente
      if (!newData.store_id && profile?.store_id) {
        newData.store_id = profile.store_id;
      }
      
      return newData;
    });
  }, [profile?.store_id]);

  const validateCurrentStep = useCallback((): boolean => {
    const currentStepData = steps[currentStep];
    if (!currentStepData.required) return true;
    
    // Validação garantindo que o nome está realmente preenchido
    const trimmedName = (formData.name || '').trim();
    
    switch (currentStep) {
      case 0: // Informações Básicas
        return trimmedName.length > 0;
        
      case 1: // Preços e Estoque
        return formData.retail_price > 0 && formData.stock >= 0;
        
      default:
        return true;
    }
  }, [currentStep, formData, steps]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      let message = 'Preencha todos os campos obrigatórios antes de continuar.';
      
      if (currentStep === 0) {
        message = 'Nome do produto é obrigatório.';
      } else if (currentStep === 1) {
        message = 'Preço de varejo deve ser maior que zero e estoque não pode ser negativo.';
      }
      
      toast({
        title: 'Dados incompletos',
        description: message,
        variant: 'destructive'
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length, validateCurrentStep, toast]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  const saveProduct = useCallback(async (productId?: string): Promise<string | null> => {
    if (isSaving) return null;

    const storeId = formData.store_id || profile?.store_id;
    const trimmedName = (formData.name || '').trim();

    if (!storeId) {
      toast({
        title: 'Erro',
        description: 'Loja não identificada. Faça login novamente.',
        variant: 'destructive'
      });
      return null;
    }

    if (!trimmedName) {
      toast({
        title: 'Erro de validação',
        description: 'Nome do produto é obrigatório.',
        variant: 'destructive'
      });
      return null;
    }

    if (formData.retail_price <= 0) {
      toast({
        title: 'Erro de validação',
        description: 'Preço de varejo deve ser maior que zero.',
        variant: 'destructive'
      });
      return null;
    }

    setIsSaving(true);

    try {
      // Preparar dados do produto
      const { variations, ...productDataWithoutVariations } = formData;
      const productData: CreateProductData = {
        ...productDataWithoutVariations,
        store_id: storeId,
        name: trimmedName,
        description: (formData.description || '').trim(),
        category: (formData.category || '').trim() || 'Geral',
        retail_price: Number(formData.retail_price),
        stock: Number(formData.stock || 0)
      };

      // Salvar produto
      let result;
      let savedProductId: string;

      if (productId) {
        result = await updateProduct({ ...productData, id: productId });
        savedProductId = productId;
      } else {
        result = await createProduct(productData);
        savedProductId = result.data?.id;
      }

      if (result.error || !savedProductId) {
        throw new Error(result.error || 'Erro ao salvar produto');
      }

      // Upload de imagens
      if (images.length > 0) {
        try {
          await uploadImages(savedProductId);
        } catch (uploadError) {
          console.error('Erro no upload:', uploadError);
        }
      }

      // Salvar variações
      if (formData.variations && formData.variations.length > 0) {
        try {
          const variationsToSave = formData.variations.map(variation => ({
            color: variation.color || null,
            size: variation.size || null,
            sku: variation.sku || null,
            stock: variation.stock,
            price_adjustment: variation.price_adjustment,
            is_active: variation.is_active,
            image_url: variation.image_url || null
          }));

          await saveVariations(savedProductId, variationsToSave);
        } catch (variationError) {
          console.error('Erro nas variações:', variationError);
        }
      }

      toast({ 
        title: productId ? 'Produto atualizado!' : 'Produto criado!',
        description: `${trimmedName} foi ${productId ? 'atualizado' : 'criado'} com sucesso.`
      });
      
      return savedProductId;
      
    } catch (error) {
      console.error('Erro no salvamento:', error);
      toast({
        title: 'Erro ao salvar produto',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [formData, profile?.store_id, images, createProduct, updateProduct, uploadImages, saveVariations, toast, isSaving]);

  const resetForm = useCallback(() => {
    setFormData({
      store_id: profile?.store_id || '',
      name: '',
      description: '',
      retail_price: 0,
      wholesale_price: undefined,
      category: '',
      stock: 0,
      min_wholesale_qty: 1,
      meta_title: '',
      meta_description: '',
      keywords: '',
      seo_slug: '',
      is_featured: false,
      allow_negative_stock: false,
      stock_alert_threshold: 5,
      is_active: true,
      variations: []
    });
    setCurrentStep(0);
    clearImages();
  }, [clearImages, profile?.store_id]);

  const loadProductData = useCallback((product: any) => {
    if (!product) return;
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      retail_price: product.retail_price || 0,
      wholesale_price: product.wholesale_price || undefined,
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
      store_id: product.store_id || profile?.store_id || '',
      is_active: true,
      variations: []
    });
    
    if (product.id) {
      loadExistingImages(product.id);
    }
  }, [loadExistingImages, profile?.store_id]);

  return {
    currentStep,
    steps,
    formData,
    isSaving,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
    saveProduct,
    resetForm,
    loadProductData,
    canProceed: validateCurrentStep()
  };
};
