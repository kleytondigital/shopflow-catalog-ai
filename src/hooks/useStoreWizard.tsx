
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface StoreWizardData {
  // Etapa 2: Informações Básicas
  store_name: string;
  store_description: string;
  business_type: string;
  
  // Etapa 3: Identidade Visual
  logo_file: File | null;
  logo_url: string;
  
  // Etapa 4: Contato e WhatsApp
  store_phone: string;
  store_email: string;
  whatsapp_number: string;
  
  // Etapa 5: Seleção de Plano (NOVA)
  selected_plan_id: string;
  
  // Etapa 6: Como Você Vende
  accepts_pix: boolean;
  accepts_credit_card: boolean;
  accepts_cash: boolean;
  
  // Etapa 7: Como Entrega
  offers_pickup: boolean;
  offers_delivery: boolean;
  offers_shipping: boolean;
  delivery_fee: number;
}

const BUSINESS_TYPES = [
  { value: 'fashion', label: 'Moda e Roupas', emoji: '👗' },
  { value: 'electronics', label: 'Eletrônicos', emoji: '📱' },
  { value: 'food', label: 'Alimentação', emoji: '🍕' },
  { value: 'beauty', label: 'Beleza e Cosméticos', emoji: '💄' },
  { value: 'home', label: 'Casa e Decoração', emoji: '🏠' },
  { value: 'sports', label: 'Esportes e Fitness', emoji: '⚽' },
  { value: 'books', label: 'Livros e Educação', emoji: '📚' },
  { value: 'health', label: 'Saúde e Bem-estar', emoji: '💊' },
  { value: 'automotive', label: 'Automotivo', emoji: '🚗' },
  { value: 'other', label: 'Outros', emoji: '🏪' }
];

export const useStoreWizard = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7; // Atualizado: 1 welcome + 6 configurações
  
  const [data, setData] = useState<StoreWizardData>({
    store_name: '',
    store_description: '',
    business_type: '',
    logo_file: null,
    logo_url: '',
    store_phone: '',
    store_email: '',
    whatsapp_number: '',
    selected_plan_id: '', // NOVO campo
    accepts_pix: true,
    accepts_credit_card: false,
    accepts_cash: true,
    offers_pickup: true,
    offers_delivery: false,
    offers_shipping: false,
    delivery_fee: 0
  });

  const updateData = useCallback((updates: Partial<StoreWizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps + 1) { // +1 para incluir welcome
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps + 1) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('store-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('store-logos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      return null;
    }
  };

  const createStoreSubscription = async (storeId: string, planId: string) => {
    try {
      // Criar assinatura com trial de 7 dias
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const { error: subscriptionError } = await supabase
        .from('store_subscriptions')
        .insert([{
          store_id: storeId,
          plan_id: planId,
          status: 'trialing',
          starts_at: new Date().toISOString(),
          trial_ends_at: trialEndsAt.toISOString()
        }]);

      if (subscriptionError) throw subscriptionError;

      console.log('✅ Assinatura criada com trial de 7 dias');
    } catch (error) {
      console.error('❌ Erro ao criar assinatura:', error);
      throw error;
    }
  };

  const completeWizard = async (): Promise<boolean> => {
    if (!profile?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    if (!data.selected_plan_id) {
      toast({
        title: "Erro",
        description: "Selecione um plano para continuar",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Iniciando criação da loja completa:', data);

      // 1. Upload do logo se necessário
      let logoUrl = data.logo_url;
      if (data.logo_file && !logoUrl) {
        logoUrl = await uploadLogo(data.logo_file) || '';
      }

      // 2. Criar a loja
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert([{
          name: data.store_name,
          description: data.store_description,
          owner_id: profile.id,
          logo_url: logoUrl,
          phone: data.store_phone,
          email: data.store_email,
          is_active: true
        }])
        .select()
        .single();

      if (storeError) throw storeError;

      console.log('✅ Loja criada:', storeData);

      // 3. Criar assinatura com trial
      await createStoreSubscription(storeData.id, data.selected_plan_id);

      // 4. Atualizar perfil com store_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ store_id: storeData.id })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // 5. Criar configurações da loja
      const storeSettings = {
        store_id: storeData.id,
        retail_catalog_active: true,
        wholesale_catalog_active: false,
        whatsapp_number: data.whatsapp_number,
        whatsapp_integration_active: !!data.whatsapp_number,
        payment_methods: {
          pix: data.accepts_pix,
          credit_card: data.accepts_credit_card,
          cash: data.accepts_cash
        },
        shipping_options: {
          pickup: data.offers_pickup,
          delivery: data.offers_delivery,
          shipping: data.offers_shipping,
          delivery_fee: data.delivery_fee
        },
        business_type: data.business_type
      };

      const { error: settingsError } = await supabase
        .from('store_settings')
        .insert([storeSettings]);

      if (settingsError) throw settingsError;

      console.log('✅ Configurações da loja criadas');

      // 6. Recarregar perfil
      await refreshProfile();

      toast({
        title: "🎉 Parabéns!",
        description: `Sua loja foi criada com sucesso! Você tem 7 dias de teste gratuito para explorar todos os recursos.`,
        duration: 5000,
      });

      return true;

    } catch (error) {
      console.error('❌ Erro ao criar loja:', error);
      toast({
        title: "Erro na configuração",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getBusinessTypeConfig = (type: string) => {
    return BUSINESS_TYPES.find(bt => bt.value === type);
  };

  const canProceedToNext = useCallback(() => {
    switch (currentStep) {
      case 1:
        return true; // Welcome step - sempre pode prosseguir
      case 2:
        return data.store_name.trim().length >= 3 && data.business_type;
      case 3:
        return true; // Logo é opcional - sempre pode prosseguir
      case 4:
        return data.store_phone.trim().length >= 10;
      case 5:
        return !!data.selected_plan_id; // Plano é obrigatório
      case 6:
        return data.accepts_pix || data.accepts_credit_card || data.accepts_cash;
      case 7:
        return data.offers_pickup || data.offers_delivery || data.offers_shipping;
      default:
        return true;
    }
  }, [currentStep, data]);

  const getProgress = useCallback(() => {
    if (currentStep === 1) return 0; // Welcome step não conta no progresso
    const actualStep = currentStep - 1; // Ajustar para não contar welcome
    return (actualStep / totalSteps) * 100;
  }, [currentStep, totalSteps]);

  return {
    // Estado
    currentStep,
    totalSteps,
    data,
    loading,
    
    // Ações
    updateData,
    nextStep,
    prevStep,
    goToStep,
    completeWizard,
    
    // Helpers
    canProceedToNext,
    getProgress,
    getBusinessTypeConfig,
    businessTypes: BUSINESS_TYPES
  };
};
