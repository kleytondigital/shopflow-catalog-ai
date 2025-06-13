
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MercadoPagoItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

interface MercadoPagoCheckout {
  items: MercadoPagoItem[];
  payer: {
    name: string;
    email: string;
    phone: string;
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  notification_url?: string;
  external_reference?: string;
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
}

interface PaymentResult {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
  preference_id: string;
}

export const useMercadoPago = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = async (checkoutData: MercadoPagoCheckout): Promise<PaymentResult | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Criando checkout no Mercado Pago:', checkoutData);
      
      const { data, error: functionError } = await supabase.functions.invoke('mercadopago-checkout', {
        body: checkoutData
      });

      if (functionError) {
        console.error('❌ Erro na edge function:', functionError);
        setError(functionError.message);
        throw functionError;
      }

      if (!data) {
        throw new Error('Nenhum dado retornado da API');
      }

      console.log('✅ Checkout criado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro no checkout Mercado Pago:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const openCheckout = async (checkoutData: MercadoPagoCheckout) => {
    const result = await createCheckout(checkoutData);
    if (result?.init_point) {
      // Abrir checkout em nova aba
      window.open(result.init_point, '_blank');
      return result;
    }
    return null;
  };

  const createPixPayment = async (checkoutData: Omit<MercadoPagoCheckout, 'payment_methods'>) => {
    const pixCheckoutData: MercadoPagoCheckout = {
      ...checkoutData,
      payment_methods: {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' }
        ]
      }
    };
    
    return await createCheckout(pixCheckoutData);
  };

  const createCardPayment = async (checkoutData: Omit<MercadoPagoCheckout, 'payment_methods'>) => {
    const cardCheckoutData: MercadoPagoCheckout = {
      ...checkoutData,
      payment_methods: {
        excluded_payment_types: [
          { id: 'pix' },
          { id: 'ticket' }
        ],
        installments: 12
      }
    };
    
    return await createCheckout(cardCheckoutData);
  };

  const createBankSlipPayment = async (checkoutData: Omit<MercadoPagoCheckout, 'payment_methods'>) => {
    const bankSlipCheckoutData: MercadoPagoCheckout = {
      ...checkoutData,
      payment_methods: {
        excluded_payment_types: [
          { id: 'pix' },
          { id: 'credit_card' },
          { id: 'debit_card' }
        ]
      }
    };
    
    return await createCheckout(bankSlipCheckoutData);
  };

  return {
    createCheckout,
    openCheckout,
    createPixPayment,
    createCardPayment,
    createBankSlipPayment,
    loading,
    error,
    clearError: () => setError(null)
  };
};
