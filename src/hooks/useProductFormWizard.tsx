
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductVariation, ProductPriceTier } from "@/types/product";

export interface ProductFormData {
  name: string;
  description?: string;
  retail_price: number;
  wholesale_price?: number;
  min_wholesale_qty?: number;
  stock: number;
  category: string;
  keywords: string;
  meta_title: string;
  meta_description: string;
  seo_slug: string;
  is_featured: boolean;
  allow_negative_stock: boolean;
  stock_alert_threshold: number;
  is_active: boolean;
  variations: ProductVariation[];
  price_tiers: ProductPriceTier[];
  store_id: string;
  enable_gradual_wholesale?: boolean;
  // Adicionar propriedades faltantes para compatibilidade
  price_model: string;
  simple_wholesale_enabled: boolean;
  gradual_wholesale_enabled: boolean;
  // 🎯 FASE 2: Novos campos
  product_gender?: 'masculino' | 'feminino' | 'unissex' | 'infantil';
  product_category_type?: 'calcado' | 'roupa_superior' | 'roupa_inferior' | 'acessorio';
  material?: string;
  video_url?: string;
  video_type?: 'youtube' | 'vimeo' | 'direct';
  video_thumbnail?: string;
}

export interface WizardStep {
  id: number;
  label: string;
  title: string;
  description: string;
}

export const useProductFormWizard = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  const initialFormData: ProductFormData = {
    name: "",
    description: "",
    retail_price: 0,
    wholesale_price: undefined,
    min_wholesale_qty: 1,
    stock: 0,
    category: "",
    keywords: "",
    meta_title: "",
    meta_description: "",
    seo_slug: "",
    is_featured: false,
    allow_negative_stock: false,
    stock_alert_threshold: 5,
    is_active: true,
    variations: [],
    price_tiers: [],
    store_id: "",
    // Adicionar valores padrão para as novas propriedades
    price_model: "wholesale_only",
    simple_wholesale_enabled: true,
    gradual_wholesale_enabled: false,
    // 🎯 FASE 2: Novos campos
    product_gender: undefined,
    product_category_type: undefined,
    material: "",
    video_url: "",
    video_type: "youtube",
    video_thumbnail: "",
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  const steps: WizardStep[] = [
    {
      id: 0,
      label: "Básico",
      title: "Informações Básicas",
      description: "Nome, descrição e categoria do produto",
    },
    {
      id: 1,
      label: "Preços",
      title: "Preços e Estoque",
      description: "Valores, estoque e configurações de preço",
    },
    {
      id: 2,
      label: "Imagens",
      title: "Imagens do Produto",
      description: "Upload e organização das imagens",
    },
    {
      id: 3,
      label: "Variações",
      title: "Variações do Produto",
      description: "Cores, tamanhos e outras variações",
    },
    {
      id: 4,
      label: "SEO",
      title: "Otimização para Busca",
      description: "Meta tags e palavras-chave",
    },
    {
      id: 5,
      label: "Avançado",
      title: "Configurações Avançadas",
      description: "Destaque, ativação e outras opções",
    },
  ];

  const updateFormData = useCallback((data: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
      }
    },
    [steps.length]
  );

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: // Básico
        return formData.name.trim().length > 0;
      case 1: // Preços
        // Para wholesale_only, só precisa de preço de atacado e estoque
        // Para outros modelos, precisa de preço de varejo e estoque
        const hasValidPrice =
          formData.wholesale_price && formData.wholesale_price > 0
            ? true // Se tem preço de atacado, está válido para wholesale_only
            : formData.retail_price > 0; // Caso contrário, precisa de preço de varejo
        return hasValidPrice && formData.stock >= 0;
      default:
        return true;
    }
  }, [currentStep, formData]);

  const loadProductForEditing = useCallback((product: any) => {
    console.log("📥 Loading product for editing:", product);

    const productData: ProductFormData = {
      name: product.name || "",
      description: product.description || "",
      retail_price: product.retail_price || 0,
      wholesale_price: product.wholesale_price || undefined,
      min_wholesale_qty: product.min_wholesale_qty || 1,
      stock: product.stock || 0,
      category: product.category || "",
      keywords: product.keywords || "",
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      seo_slug: product.seo_slug || "",
      is_featured: product.is_featured || false,
      allow_negative_stock: product.allow_negative_stock || false,
      stock_alert_threshold: product.stock_alert_threshold || 5,
      is_active: product.is_active !== false,
      variations: product.variations || [],
      price_tiers: product.price_tiers || [],
      store_id: product.store_id || "",
      enable_gradual_wholesale: product.enable_gradual_wholesale || false,
      // Adicionar valores para as novas propriedades
      price_model: "wholesale_only",
      simple_wholesale_enabled: true,
      gradual_wholesale_enabled: product.enable_gradual_wholesale || false,
      // 🎯 FASE 2: Carregar novos campos
      product_gender: product.product_gender || undefined,
      product_category_type: product.product_category_type || undefined,
      material: product.material || "",
      video_url: product.video_url || "",
      video_type: product.video_type || "youtube",
      video_thumbnail: product.video_thumbnail || "",
    };

    console.log("🔍 DEBUG - Campos FASE 2 carregados:", {
      product_gender: productData.product_gender,
      product_category_type: productData.product_category_type,
      material: productData.material,
      video_url: productData.video_url,
    });

    setFormData(productData);
    setProductId(product.id);
  }, []);

  const saveProduct = useCallback(
    async (data: ProductFormData) => {
      setIsSaving(true);

      try {
        console.log("💾 Saving product with data:", data);

        // ⭐ AUTO-PREENCHER: Se retail_price é 0/undefined mas wholesale_price existe,
        // copiar wholesale_price para retail_price (evita produtos com preço zero)
        let finalRetailPrice = data.retail_price || 0;
        let finalWholesalePrice = data.wholesale_price;
        
        if (finalRetailPrice === 0 && finalWholesalePrice && finalWholesalePrice > 0) {
          finalRetailPrice = finalWholesalePrice;
          console.log("⚠️ Auto-preenchendo retail_price com wholesale_price:", {
            wholesale: finalWholesalePrice,
            retail_antes: data.retail_price,
            retail_depois: finalRetailPrice,
          });
        }

        const productData = {
          name: data.name.trim(),
          description: data.description || "",
          retail_price: finalRetailPrice,
          wholesale_price: finalWholesalePrice,
          min_wholesale_qty: data.min_wholesale_qty || 1,
          stock: data.stock,
          category: data.category || "",
          keywords: data.keywords || "",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          seo_slug: data.seo_slug || "",
          is_featured: data.is_featured || false,
          allow_negative_stock: data.allow_negative_stock || false,
          stock_alert_threshold: data.stock_alert_threshold || 5,
          is_active: data.is_active !== false,
          // 🎯 FASE 2: Novos campos
          product_gender: (data as any).product_gender || null,
          product_category_type: (data as any).product_category_type || null,
          material: (data as any).material || null,
        };

        console.log("🔍 DEBUG - Dados que serão salvos:", {
          name: productData.name,
          product_gender: productData.product_gender,
          product_category_type: productData.product_category_type,
          material: productData.material,
          formData_gender: data.product_gender,
          formData_category: data.product_category_type,
          formData_material: data.material,
        });

        let result;

        if (productId) {
          // Atualizar produto existente
          const { data: updatedProduct, error } = await supabase
            .from("products")
            .update(productData)
            .eq("id", productId)
            .select()
            .single();

          if (error) throw error;
          result = updatedProduct;

          toast({
            title: "Produto atualizado",
            description: "Produto atualizado com sucesso!",
          });
        } else {
          // Criar novo produto
          const { data: user } = await supabase.auth.getUser();
          if (!user.user) throw new Error("Usuário não autenticado");

          const { data: profile } = await supabase
            .from("profiles")
            .select("store_id")
            .eq("id", user.user.id)
            .single();

          if (!profile?.store_id) throw new Error("Loja não encontrada");

          const { data: newProduct, error } = await supabase
            .from("products")
            .insert({
              ...productData,
              store_id: profile.store_id,
            })
            .select()
            .single();

          if (error) throw error;
          result = newProduct;
          setProductId(result.id);

          toast({
            title: "Produto criado",
            description: "Produto criado com sucesso!",
          });
        }

        return result;
      } catch (error: any) {
        console.error("❌ Error saving product:", error);
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [productId, toast]
  );

  const resetForm = useCallback(() => {
    console.log("🔄 RESET - Limpando formulário");
    setFormData(initialFormData);
    setCurrentStep(0);
    setProductId(null);
  }, [initialFormData]);

  const cancelAndCleanup = useCallback(() => {
    resetForm();
  }, [resetForm]);

  return {
    currentStep,
    formData,
    steps,
    isSaving,
    productId,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    loadProductForEditing,
    saveProduct,
    resetForm,
    cancelAndCleanup,
  };
};

// Use export type for isolated modules
export type { ProductVariation, ProductPriceTier };
