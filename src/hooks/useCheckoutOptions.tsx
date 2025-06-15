
import { useMemo } from 'react';
import { usePlanPermissions } from './usePlanPermissions';
import { useCatalogSettings } from './useCatalogSettings';

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

  const checkoutOptions = useMemo((): CheckoutOption[] => {
    const hasWhatsAppNumber = !!settings?.whatsapp_number?.trim();
    const hasPaymentAccess = isSuperadmin || hasBenefit('payment_credit_card');
    
    return [
      {
        type: 'whatsapp_only',
        name: 'Pedido via WhatsApp',
        description: 'Enviar resumo do pedido para WhatsApp da loja',
        available: hasWhatsAppNumber,
      },
      {
        type: 'online_payment',
        name: 'Pagamento Online',
        description: 'PIX, Cartão de Crédito e Boleto',
        available: hasPaymentAccess,
        requiresUpgrade: !hasPaymentAccess,
      }
    ];
  }, [settings, hasBenefit, isSuperadmin]);

  const availableOptions = checkoutOptions.filter(option => option.available);
  const defaultOption = availableOptions[0]?.type || 'whatsapp_only';
  
  const canUseOnlinePayment = isSuperadmin || hasBenefit('payment_credit_card');
  const hasWhatsAppConfigured = !!settings?.whatsapp_number?.trim();

  return {
    checkoutOptions,
    availableOptions,
    defaultOption,
    canUseOnlinePayment,
    hasWhatsAppConfigured,
    isPremiumRequired: !canUseOnlinePayment
  };
};
