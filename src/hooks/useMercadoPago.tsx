
import { useState } from 'react';

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
      
      // TODO: Implementar chamada para edge function do Mercado Pago
      const response = await fetch('/api/mercadopago/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar checkout');
      }

      const data = await response.json();
      
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
