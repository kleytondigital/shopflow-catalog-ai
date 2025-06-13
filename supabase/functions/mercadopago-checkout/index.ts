
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface CheckoutRequest {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('Mercado Pago access token não configurado');
    }

    const { items, payer, back_urls, auto_return, notification_url }: CheckoutRequest = await req.json();

    // Validar dados obrigatórios
    if (!items || !items.length || !payer || !back_urls) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Criar preferência de pagamento no Mercado Pago
    const preferenceData = {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'BRL'
      })),
      payer: {
        name: payer.name,
        email: payer.email,
        phone: {
          number: payer.phone
        }
      },
      back_urls,
      auto_return,
      notification_url,
      statement_descriptor: "LOJA_ONLINE",
      external_reference: `ORDER_${Date.now()}`,
      expires: false,
      binary_mode: false
    };

    console.log('Criando preferência no Mercado Pago:', preferenceData);

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na API do Mercado Pago:', errorData);
      throw new Error(`Erro na API do Mercado Pago: ${response.status}`);
    }

    const preferenceResult = await response.json();
    
    console.log('Preferência criada com sucesso:', preferenceResult.id);

    return new Response(
      JSON.stringify({
        id: preferenceResult.id,
        init_point: preferenceResult.init_point,
        sandbox_init_point: preferenceResult.sandbox_init_point
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro no checkout Mercado Pago:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
