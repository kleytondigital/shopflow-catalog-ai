
import { useMemo } from 'react';
import { usePlanPermissions } from './usePlanPermissions';
import { useCatalogSettings } from './useCatalogSettings';
import { useStores } from './useStores';

export interface CheckoutOption {
  type: 'whatsapp_only' | 'online_payment';
  name: string;
  description: string;
  available: boolean;
  requiresUpgrade?: boolean;
}

export const useCheckoutOptions = (storeId?: string) => {
  const { hasBenefit, isSuperadmin } = usePlanPermissions();
  const { settings } = useCatalogSettings(storeId);
  const { currentStore } = useStores();

  const checkoutOptions = useMemo((): CheckoutOption[] => {
    // Para plano básico, usar telefone da loja (stores.phone)
    // Para plano premium, usar whatsapp_number das configurações
    const basicWhatsAppNumber = currentStore?.phone?.trim();
    const premiumWhatsAppNumber = settings?.whatsapp_number?.trim();
    
    const hasWhatsAppNumber = !!basicWhatsAppNumber || !!premiumWhatsAppNumber;
    const hasPaymentAccess = isSuperadmin || hasBenefit('payment_credit_card');
    
    // Verificar configuração específica da loja
    const storeCheckoutType = settings?.checkout_type || 'both';
    
    const options = [
      {
        type: 'whatsapp_only' as const,
        name: 'Pedido via WhatsApp',
        description: 'Enviar resumo do pedido para WhatsApp da loja',
        available: hasWhatsAppNumber && (storeCheckoutType === 'whatsapp' || storeCheckoutType === 'both'),
      },
      {
        type: 'online_payment' as const,
        name: 'Pagamento Online',
        description: 'PIX, Cartão de Crédito e Boleto',
        available: hasPaymentAccess && (storeCheckoutType === 'online' || storeCheckoutType === 'both'),
        requiresUpgrade: !hasPaymentAccess,
      }
    ];

    return options;
  }, [settings, currentStore, hasBenefit, isSuperadmin]);

  const availableOptions = checkoutOptions.filter(option => option.available);
  const defaultOption = availableOptions[0]?.type || 'whatsapp_only';
  
  const canUseOnlinePayment = isSuperadmin || hasBenefit('payment_credit_card');
  
  // Verificar se tem WhatsApp configurado (telefone da loja OU integração premium)
  const hasWhatsAppConfigured = !!(currentStore?.phone?.trim() || settings?.whatsapp_number?.trim());

  // Determinar se deve mostrar apenas WhatsApp baseado nas configurações da loja
  const storeCheckoutType = settings?.checkout_type || 'both';
  const forceWhatsAppOnly = storeCheckoutType === 'whatsapp' || (!canUseOnlinePayment && hasWhatsAppConfigured);

  return {
    checkoutOptions,
    availableOptions,
    defaultOption,
    canUseOnlinePayment: canUseOnlinePayment && (storeCheckoutType === 'online' || storeCheckoutType === 'both'),
    hasWhatsAppConfigured,
    isPremiumRequired: !canUseOnlinePayment,
    forceWhatsAppOnly
  };
};
