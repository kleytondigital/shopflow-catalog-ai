import { useState, useCallback } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useProductVariations } from "@/hooks/useProductVariations";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CreateProductData } from "@/types/product";
import { ProductVariation } from "@/types/variation";

export interface SimpleProductFormData extends CreateProductData {
  variations?: ProductVariation[];
  description?: string; // Tornando opcional para compatibilidade
  price_tiers?: Array<{
    id: string;
    name: string;
    minQuantity: number;
    price: number;
    enabled: boolean;
  }>;
}

export interface SimpleWizardStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export const useSimpleProductWizard = () => {
  const { createProduct, updateProduct, fetchProducts } = useProducts();
  const { saveVariations } = useProductVariations();
  const { toast } = useToast();
  const { profile } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Estado inicial mais simples e confiável
  const [formData, setFormData] = useState<SimpleProductFormData>({
    store_id: profile?.store_id || "",
    name: "",
    description: "",
    retail_price: 0,
    wholesale_price: undefined,
    category: "",
    stock: 0,
    min_wholesale_qty: 1,
    meta_title: "",
    meta_description: "",
    keywords: "",
    seo_slug: "",
    is_featured: false,
    allow_negative_stock: false,
    stock_alert_threshold: 5,
    is_active: true,
    variations: [],
  });

  const steps: SimpleWizardStep[] = [
    {
      id: "basic",
      title: "Informações Básicas",
      description: "Nome, descrição e categoria",
      required: true,
    },
    {
      id: "pricing",
      title: "Preços e Estoque",
      description: "Valores e quantidades",
      required: true,
    },
    {
      id: "images",
      title: "Imagens",
      description: "Fotos do produto",
      required: false,
    },
    {
      id: "variations",
      title: "Variações",
      description: "Cores, tamanhos e opções",
      required: false,
    },
    {
      id: "seo",
      title: "SEO e Metadados",
      description: "Otimização para buscas",
      required: false,
    },
    {
      id: "advanced",
      title: "Configurações Avançadas",
      description: "Opções extras",
      required: false,
    },
  ];

  const updateFormData = useCallback(
    (updates: Partial<SimpleProductFormData>) => {
      setFormData((prev) => {
        const newData = { ...prev, ...updates };

        // Garantir store_id sempre presente
        if (!newData.store_id && profile?.store_id) {
          newData.store_id = profile.store_id;
        }

        return newData;
      });
    },
    [profile?.store_id]
  );

  const validateCurrentStep = useCallback((): boolean => {
    const currentStepData = steps[currentStep];
    if (!currentStepData?.required) return true;

    const trimmedName = (formData.name || "").trim();

    switch (currentStep) {
      case 0: // Informações Básicas
        const isValid = trimmedName.length > 0;
        return isValid;

      case 1: // Preços e Estoque
        const priceValid = formData.retail_price > 0 && formData.stock >= 0;
        return priceValid;

      default:
        return true;
    }
  }, [currentStep, formData, steps]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      let message = "Preencha todos os campos obrigatórios antes de continuar.";

      if (currentStep === 0) {
        message = "Nome do produto é obrigatório.";
      } else if (currentStep === 1) {
        message =
          "Preço de varejo deve ser maior que zero e estoque não pode ser negativo.";
      }

      toast({
        title: "Dados incompletos",
        description: message,
        variant: "destructive",
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

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        setCurrentStep(stepIndex);
      }
    },
    [steps.length]
  );

  const saveProduct = useCallback(
    async (
      productId?: string,
      imageUploadFn?: (productId: string) => Promise<void>
    ): Promise<string | null> => {
      if (isSaving) return null;

      const storeId = formData.store_id || profile?.store_id;
      const trimmedName = (formData.name || "").trim();

      if (!storeId) {
        toast({
          title: "Erro",
          description: "Loja não identificada. Faça login novamente.",
          variant: "destructive",
        });
        return null;
      }

      if (!trimmedName) {
        toast({
          title: "Erro de validação",
          description: "Nome do produto é obrigatório.",
          variant: "destructive",
        });
        return null;
      }

      if (formData.retail_price <= 0) {
        toast({
          title: "Erro de validação",
          description: "Preço de varejo deve ser maior que zero.",
          variant: "destructive",
        });
        return null;
      }

      setIsSaving(true);

      try {
        // Preparar dados do produto
        const { variations, price_tiers, ...productDataWithoutVariations } =
          formData;
        const productData: CreateProductData = {
          ...productDataWithoutVariations,
          store_id: storeId,
          name: trimmedName,
          description: (formData.description || "").trim(),
          category: (formData.category || "").trim() || "Geral",
          retail_price: Number(formData.retail_price),
          wholesale_price: formData.wholesale_price
            ? Number(formData.wholesale_price)
            : undefined,
          min_wholesale_qty: Number(formData.min_wholesale_qty || 1),
          stock: Number(formData.stock || 0),
          meta_title: (formData.meta_title || "").trim(),
          meta_description: (formData.meta_description || "").trim(),
          keywords: (formData.keywords || "").trim(),
          seo_slug: (formData.seo_slug || "").trim(),
          is_featured: Boolean(formData.is_featured),
          allow_negative_stock: Boolean(formData.allow_negative_stock),
          stock_alert_threshold: Number(formData.stock_alert_threshold || 5),
          is_active: true,
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
          throw new Error(result.error || "Erro ao salvar produto");
        }

        // Upload de imagens APÓS salvar produto
        if (imageUploadFn) {
          try {
            await imageUploadFn(savedProductId);
          } catch (uploadError) {
            console.error("Erro no upload:", uploadError);
            // Não falhar por causa das imagens
          }
        }

        // Salvar variações com upload de imagens
        if (formData.variations && formData.variations.length > 0) {
          try {
            await saveVariations(savedProductId, formData.variations);
          } catch (variationError) {
            console.error("Erro nas variações:", variationError);
          }
        }

        // Salvar níveis de preço se houver dados de níveis
        if (formData.price_tiers && formData.price_tiers.length > 0) {
          try {
            // Importar supabase para operações diretas
            const { supabase } = await import(
              "../integrations/supabase/client"
            );

            // Primeiro, desativar níveis existentes
            await supabase
              .from("product_price_tiers")
              .update({ is_active: false })
              .eq("product_id", savedProductId);

            // Primeiro, criar o nível de varejo (tier_order = 1)
            const retailTier = {
              product_id: savedProductId,
              tier_name: "Varejo",
              tier_order: 1,
              tier_type: "retail",
              price: formData.retail_price,
              min_quantity: 1,
              is_active: true,
            };

            // Depois, criar os níveis de atacado baseados nos dados do formulário
            const wholesaleTiers = formData.price_tiers
              .filter(
                (tier) => tier.enabled && tier.price > 0 && tier.id !== "retail"
              )
              .map((tier, index) => ({
                product_id: savedProductId,
                tier_name: tier.name,
                tier_order: index + 2, // Começar do 2 (1 é varejo)
                tier_type: "gradual_wholesale",
                price: tier.price,
                min_quantity: tier.minQuantity,
                is_active: true,
              }));

            const tiersToInsert = [retailTier, ...wholesaleTiers];

            if (tiersToInsert.length > 0) {
              const { error: insertError } = await supabase
                .from("product_price_tiers")
                .insert(tiersToInsert);

              if (insertError) {
                console.error(
                  "❌ SIMPLE WIZARD - Erro ao inserir níveis:",
                  insertError
                );
              }
            }
          } catch (tierError) {
            console.error(
              "❌ SIMPLE WIZARD - Erro ao salvar níveis de preço:",
              tierError
            );
            // Não falhar o produto por causa dos níveis
          }
        }

        // Atualizar lista de produtos
        await fetchProducts();

        toast({
          title: productId ? "Produto atualizado!" : "Produto criado!",
          description: `${trimmedName} foi ${
            productId ? "atualizado" : "criado"
          } com sucesso.`,
        });

        return savedProductId;
      } catch (error) {
        console.error("Erro no salvamento:", error);
        toast({
          title: "Erro ao salvar produto",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [
      formData,
      profile?.store_id,
      createProduct,
      updateProduct,
      saveVariations,
      fetchProducts,
      toast,
      isSaving,
    ]
  );

  const resetForm = useCallback(() => {
    setFormData({
      store_id: profile?.store_id || "",
      name: "",
      description: "",
      retail_price: 0,
      wholesale_price: undefined,
      category: "",
      stock: 0,
      min_wholesale_qty: 1,
      meta_title: "",
      meta_description: "",
      keywords: "",
      seo_slug: "",
      is_featured: false,
      allow_negative_stock: false,
      stock_alert_threshold: 5,
      is_active: true,
      variations: [],
    });
    setCurrentStep(0);
  }, [profile?.store_id]);

  const loadProductData = useCallback(
    async (product: any) => {
      if (!product) return;

      const productData = {
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
        store_id: product.store_id || profile?.store_id || "",
        is_active: true,
        variations: [],
        price_tiers: [],
      };

      // Carregar níveis de preço se existirem
      try {
        const { supabase } = await import("../integrations/supabase/client");
        const { data: tiers } = await supabase
          .from("product_price_tiers")
          .select("*")
          .eq("product_id", product.id)
          .eq("is_active", true)
          .order("tier_order");

        if (tiers && tiers.length > 0) {
          const formattedTiers = tiers.map((tier) => ({
            id: tier.id,
            name: tier.tier_name,
            minQuantity: tier.min_quantity,
            price: tier.price,
            enabled: tier.is_active,
          }));
          productData.price_tiers = formattedTiers;
        }
      } catch (error) {
        console.error("Erro ao carregar níveis de preço:", error);
      }

      // Atualizar formData de uma vez
      setFormData(productData);
    },
    [profile?.store_id]
  );

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
    canProceed: validateCurrentStep(),
  };
};
