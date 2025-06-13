
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MercadoPagoCheckout {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
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
}

export const useMercadoPago = () => {
  const [loading, setLoading] = useState(false);

  const createCheckout = async (checkoutData: MercadoPagoCheckout) => {
    try {
      setLoading(true);
      
      console.log('Criando checkout no Mercado Pago:', checkoutData);
      
      const { data, error } = await supabase.functions.invoke('mercadopago-checkout', {
        body: checkoutData
      });

      if (error) {
        console.error('Erro na edge function:', error);
        throw error;
      }

      console.log('Checkout criado com sucesso:', data);
      
      // Redirecionar para o checkout do Mercado Pago
      if (data.init_point) {
        window.open(data.init_point, '_blank');
      }
      
      return data;
    } catch (error) {
      console.error('Erro no checkout Mercado Pago:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckout,
    loading
  };
};
