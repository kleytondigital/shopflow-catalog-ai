
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 create-stripe-payment: Iniciando processamento')
    
    const { store_id, plan_id, success_url, cancel_url } = await req.json()
    
    if (!store_id || !plan_id) {
      throw new Error('store_id e plan_id são obrigatórios')
    }

    // Conectar ao Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar gateway ativo
    const { data: activeGateway, error: gatewayError } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .eq('name', 'stripe')
      .eq('is_active', true)
      .single()

    if (gatewayError || !activeGateway) {
      throw new Error('Gateway Stripe não configurado ou inativo')
    }

    // Buscar dados do plano
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (planError || !plan) {
      throw new Error('Plano não encontrado')
    }

    // Buscar dados da loja
    const { data: store, error: storeError } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('id', store_id)
      .single()

    if (storeError || !store) {
      throw new Error('Loja não encontrada')
    }

    console.log('📋 create-stripe-payment: Dados validados', {
      store: store.name,
      plan: plan.name,
      amount: plan.price_monthly
    })

    // Criar registro de pagamento
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from('plan_payments')
      .insert([{
        store_id,
        plan_id,
        gateway: 'stripe',
        amount: plan.price_monthly,
        status: 'pending'
      }])
      .select()
      .single()

    if (paymentError) {
      throw new Error(`Erro ao criar registro de pagamento: ${paymentError.message}`)
    }

    console.log('✅ create-stripe-payment: Registro de pagamento criado:', paymentRecord.id)

    // Configurar Stripe
    const stripe = await import('https://esm.sh/stripe@13.10.0')
    const stripeClient = stripe.default(activeGateway.config.secret_key, {
      apiVersion: '2023-10-16',
    })

    // Criar Stripe Checkout Session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Upgrade para ${plan.name}`,
              description: plan.description || `Plano ${plan.name} para ${store.name}`,
            },
            unit_amount: Math.round(plan.price_monthly * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${req.headers.get('origin')}/payment-success?payment_id=${paymentRecord.id}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/payment-cancelled?payment_id=${paymentRecord.id}`,
      metadata: {
        payment_id: paymentRecord.id,
        store_id,
        plan_id,
      },
    })

    // Atualizar registro com ID da sessão
    await supabaseClient
      .from('plan_payments')
      .update({
        gateway_payment_id: session.id,
        gateway_response: { session_url: session.url }
      })
      .eq('id', paymentRecord.id)

    console.log('🎉 create-stripe-payment: Checkout session criada:', session.id)

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: paymentRecord.id,
        checkout_url: session.url,
        session_id: session.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ create-stripe-payment: Erro:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
