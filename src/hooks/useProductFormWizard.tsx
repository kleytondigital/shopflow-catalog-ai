
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

export interface ProductFormData {
  name: string;
  description?: string;
  retail_price: number;
  wholesale_price?: number;
  category?: string;
  stock: number;
  min_wholesale_qty?: number;
  image_url?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  seo_slug?: string;
  is_featured?: boolean;
  allow_negative_stock?: boolean;
  stock_alert_threshold?: number;
}

export const useProductFormWizard = () => {
  const { createProduct, updateProduct } = useProducts();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    retail_price: 0,
    wholesale_price: 0,
    category: '',
    stock: 0,
    min_wholesale_qty: 1,
    image_url: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    seo_slug: '',
    is_featured: false,
    allow_negative_stock: false,
    stock_alert_threshold: 5,
  });

  const steps = [
    { id: 'basic', title: 'Informações Básicas' },
    { id: 'pricing', title: 'Preços e Estoque' },
    { id: 'images', title: 'Imagens' },
    { id: 'seo', title: 'SEO e Metadados' },
    { id: 'advanced', title: 'Configurações Avançadas' }
  ];

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Informações Básicas
        return !!(formData.name && formData.retail_price > 0);
      case 1: // Preços e Estoque
        return formData.retail_price > 0 && formData.stock >= 0;
      case 2: // Imagens
        return true; // Opcional
      case 3: // SEO
        return true; // Opcional
      case 4: // Avançado
        return true; // Opcional
      default:
        return true;
    }
  };

  const submitProduct = async (productId?: string) => {
    try {
      if (productId) {
        const { error } = await updateProduct(productId, formData);
        if (error) throw error;
        toast({ title: 'Produto atualizado com sucesso!' });
      } else {
        const { error } = await createProduct(formData);
        if (error) throw error;
        toast({ title: 'Produto criado com sucesso!' });
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        retail_price: 0,
        wholesale_price: 0,
        category: '',
        stock: 0,
        min_wholesale_qty: 1,
        image_url: '',
        meta_title: '',
        meta_description: '',
        keywords: '',
        seo_slug: '',
        is_featured: false,
        allow_negative_stock: false,
        stock_alert_threshold: 5,
      });
      setCurrentStep(0);
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: 'Erro ao salvar produto',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      retail_price: 0,
      wholesale_price: 0,
      category: '',
      stock: 0,
      min_wholesale_qty: 1,
      image_url: '',
      meta_title: '',
      meta_description: '',
      keywords: '',
      seo_slug: '',
      is_featured: false,
      allow_negative_stock: false,
      stock_alert_threshold: 5,
    });
    setCurrentStep(0);
  };

  return {
    currentStep,
    steps,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
    submitProduct,
    resetForm,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    canProceed: validateCurrentStep()
  };
};
