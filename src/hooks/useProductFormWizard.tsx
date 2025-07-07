import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  category: string;
  retail_price: number;
  wholesale_price: number;
  min_wholesale_qty: number;
  stock: number;
  stock_alert_threshold: number;
  allow_negative_stock: boolean;
  is_featured: boolean;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  keywords: string;
  seo_slug: string;
  variations: any[];
  price_tiers: any[];
}

interface Step {
  id: number;
  label: string;
  description: string;
}

export const useProductFormWizard = (storeId?: string) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    retail_price: 0,
    wholesale_price: 0,
    min_wholesale_qty: 1,
    stock: 0,
    stock_alert_threshold: 5,
    allow_negative_stock: false,
    is_featured: false,
    is_active: true,
    meta_title: "",
    meta_description: "",
    keywords: "",
    seo_slug: "",
    variations: [],
    price_tiers: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const steps: Step[] = [
    { id: 0, label: "Básico", description: "Informações básicas do produto" },
    { id: 1, label: "Preços", description: "Defina preços e estoque" },
    { id: 2, label: "Imagens", description: "Adicione imagens do produto" },
    { id: 3, label: "Variações", description: "Gerencie as variações" },
    { id: 4, label: "SEO", description: "Otimização para motores de busca" },
    { id: 5, label: "Avançado", description: "Configurações avançadas" },
  ];

  const totalSteps = steps.length;

  const updateFormData = (data: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      retail_price: 0,
      wholesale_price: 0,
      min_wholesale_qty: 1,
      stock: 0,
      stock_alert_threshold: 5,
      allow_negative_stock: false,
      is_featured: false,
      is_active: true,
      meta_title: "",
      meta_description: "",
      keywords: "",
      seo_slug: "",
      variations: [],
      price_tiers: [],
    });
    setCurrentStep(0);
  };

  const loadProductData = (product: any) => {
    setFormData({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      retail_price: product.retail_price || 0,
      wholesale_price: product.wholesale_price || 0,
      min_wholesale_qty: product.min_wholesale_qty || 1,
      stock: product.stock || 0,
      stock_alert_threshold: product.stock_alert_threshold || 5,
      allow_negative_stock: product.allow_negative_stock || false,
      is_featured: product.is_featured || false,
      is_active: product.is_active || true,
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      keywords: product.keywords || "",
      seo_slug: product.seo_slug || "",
      variations: product.variations || [],
      price_tiers: product.price_tiers || [],
    });
  };

  const saveProduct = useCallback(async (productData: any) => {
    if (!storeId) {
      throw new Error("Store ID is required");
    }

    try {
      // Save product using supabase client
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...productData, store_id: storeId }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error saving product:", error);
      throw error;
    }
  }, [storeId]);

  const canProceed = () => {
    if (currentStep === 0) {
      return formData.name && formData.name.length > 0;
    }
    if (currentStep === 1) {
      return formData.retail_price > 0 && formData.stock >= 0;
    }
    return true;
  };

  return {
    currentStep,
    steps,
    formData,
    isSaving,
    totalSteps,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    saveProduct,
    resetForm,
    loadProductData,
    canProceed,
  };
};
