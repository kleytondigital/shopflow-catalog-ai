
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface BenefitInfo {
  name: string;
  hasAccess: boolean;
  limit?: string;
}

export const useBenefitValidation = () => {
  const { profile } = useAuth();
  const [benefits, setBenefits] = useState<Record<string, BenefitInfo>>({});
  const [loading, setLoading] = useState(true);

  const fetchBenefits = useCallback(async () => {
    if (!profile?.store_id) {
      setLoading(false);
      return;
    }

    try {
      // Para superadmin, todos os benefícios são disponíveis
      if (profile.role === 'superadmin') {
        setBenefits({
          'ai_agent': { name: 'Agente de IA', hasAccess: true },
          'payment_credit_card': { name: 'Pagamento com Cartão', hasAccess: true },
          'whatsapp_integration': { name: 'Integração WhatsApp', hasAccess: true },
          'custom_domain': { name: 'Domínio Personalizado', hasAccess: true },
          'api_access': { name: 'Acesso à API', hasAccess: true },
          'max_images_per_product': { name: 'Imagens por Produto', hasAccess: true, limit: 'unlimited' },
          'max_team_members': { name: 'Membros da Equipe', hasAccess: true, limit: 'unlimited' }
        });
        setLoading(false);
        return;
      }

      // Para store_admin, verificar benefícios via função do Supabase
      const benefitKeys = [
        'ai_agent', 'payment_credit_card', 'whatsapp_integration', 
        'custom_domain', 'api_access', 'max_images_per_product', 'max_team_members'
      ];

      const benefitsData: Record<string, BenefitInfo> = {};

      for (const key of benefitKeys) {
        try {
          const { data: hasAccess } = await supabase.rpc('has_benefit_access', {
            _store_id: profile.store_id,
            _benefit_key: key
          });

          const { data: limit } = await supabase.rpc('get_benefit_limit', {
            _store_id: profile.store_id,
            _benefit_key: key
          });

          benefitsData[key] = {
            name: getBenefitDisplayName(key),
            hasAccess: hasAccess || false,
            limit: limit || undefined
          };
        } catch (error) {
          console.error(`Erro ao verificar benefício ${key}:`, error);
          benefitsData[key] = {
            name: getBenefitDisplayName(key),
            hasAccess: false
          };
        }
      }

      setBenefits(benefitsData);
    } catch (error) {
      console.error('Erro ao buscar benefícios:', error);
      toast.error('Erro ao carregar benefícios da assinatura');
    } finally {
      setLoading(false);
    }
  }, [profile?.store_id, profile?.role]);

  const hasBenefit = useCallback((benefitKey: string): boolean => {
    if (profile?.role === 'superadmin') return true;
    return benefits[benefitKey]?.hasAccess || false;
  }, [benefits, profile?.role]);

  const getBenefitLimit = useCallback((benefitKey: string): string => {
    if (profile?.role === 'superadmin') return 'unlimited';
    return benefits[benefitKey]?.limit || '0';
  }, [benefits, profile?.role]);

  const getBenefitInfo = useCallback((benefitKey: string): BenefitInfo | null => {
    if (profile?.role === 'superadmin') {
      return { name: getBenefitDisplayName(benefitKey), hasAccess: true, limit: 'unlimited' };
    }
    return benefits[benefitKey] || null;
  }, [benefits, profile?.role]);

  const validateBenefitAccess = useCallback(async (benefitKey: string, showUpgradeMessage = true): Promise<boolean> => {
    if (profile?.role === 'superadmin') return true;

    const hasAccess = hasBenefit(benefitKey);
    
    if (!hasAccess && showUpgradeMessage) {
      toast.error('Esta funcionalidade requer um plano premium. Faça upgrade para ter acesso!');
    }
    
    return hasAccess;
  }, [hasBenefit, profile?.role]);

  useEffect(() => {
    fetchBenefits();
  }, [fetchBenefits]);

  return {
    benefits,
    loading,
    hasBenefit,
    getBenefitLimit,
    getBenefitInfo,
    validateBenefitAccess,
    refetch: fetchBenefits
  };
};

const getBenefitDisplayName = (benefitKey: string): string => {
  const names: Record<string, string> = {
    'ai_agent': 'Agente de IA',
    'payment_credit_card': 'Pagamento com Cartão',
    'whatsapp_integration': 'Integração WhatsApp',
    'custom_domain': 'Domínio Personalizado',
    'api_access': 'Acesso à API',
    'max_images_per_product': 'Imagens por Produto',
    'max_team_members': 'Membros da Equipe',
    'discount_coupons': 'Cupons de Desconto',
    'abandoned_cart_recovery': 'Recuperação de Carrinho',
    'multi_variations': 'Múltiplas Variações',
    'shipping_calculator': 'Calculadora de Frete',
    'dedicated_support': 'Suporte Dedicado',
    'team_management': 'Gestão de Equipe'
  };
  
  return names[benefitKey] || benefitKey;
};
