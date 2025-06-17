
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const checkOnboardingStatus = async () => {
    try {
      console.log('🔒 [SECURITY] Verificando status do onboarding - Profile:', profile);

      // CORREÇÃO CRÍTICA: Superadmins NUNCA precisam de onboarding
      if (profile?.role === 'superadmin') {
        console.log('✅ [SECURITY] Superadmin detectado - pular onboarding');
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }

      // SEGURANÇA CRÍTICA: Para store_admin, se não tem store_id, SEMPRE precisa de onboarding
      if (!profile?.store_id) {
        console.log('🚨 [SECURITY] Store admin sem store_id - forçando onboarding');
        setNeedsOnboarding(true);
        setLoading(false);
        return;
      }

      console.log('🔍 Verificando loja existente:', profile.store_id);

      // Verificar se a loja realmente existe e pertence ao usuário
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, name, description, owner_id')
        .eq('id', profile.store_id)
        .eq('owner_id', profile.id) // CRITICAL: Validar ownership
        .single();

      if (storeError || !store) {
        console.log('🚨 [SECURITY] Loja não encontrada ou não pertence ao usuário - forçando onboarding');
        setNeedsOnboarding(true);
        setLoading(false);
        return;
      }

      // Verificar se tem configurações básicas
      const { data: settings, error: settingsError } = await supabase
        .from('store_settings')
        .select('retail_catalog_active, payment_methods, shipping_options')
        .eq('store_id', profile.store_id)
        .single();

      // Se não tem nome da loja ou configurações básicas, precisa de onboarding
      const hasBasicInfo = store?.name && store.name.trim() !== '';
      const hasSettings = settings && (
        settings.retail_catalog_active !== null ||
        settings.payment_methods ||
        settings.shipping_options
      );

      const shouldShowOnboarding = !hasBasicInfo || !hasSettings;

      console.log('📋 Status do onboarding:', {
        hasBasicInfo,
        hasSettings,
        shouldShowOnboarding,
        storeName: store?.name,
        storeOwner: store?.owner_id,
        currentUser: profile.id
      });

      setNeedsOnboarding(shouldShowOnboarding);
      
    } catch (error) {
      console.error('🚨 [SECURITY] Erro na verificação do onboarding - forçando onboarding:', error);
      // EM CASO DE ERRO, APENAS store_admin é forçado a onboarding (fail-safe)
      setNeedsOnboarding(profile?.role === 'store_admin');
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = () => {
    setNeedsOnboarding(false);
  };

  useEffect(() => {
    if (profile) {
      checkOnboardingStatus();
    } else {
      setLoading(false);
    }
  }, [profile?.store_id, profile?.id, profile?.role]);

  return {
    needsOnboarding,
    loading,
    completeOnboarding,
    recheckOnboarding: checkOnboardingStatus
  };
};
