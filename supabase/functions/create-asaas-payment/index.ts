
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
    console.log('🚀 create-asaas-payment: Iniciando processamento')
    
    const { store_id, plan_id, customer_data } = await req.json()
    
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
      .eq('name', 'asaas')
      .eq('is_active', true)
      .single()

    if (gatewayError || !activeGateway) {
      throw new Error('Gateway Asaas não configurado ou inativo')
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

    console.log('📋 create-asaas-payment: Dados validados', {
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
        gateway: 'asaas',
        amount: plan.price_monthly,
        status: 'pending'
      }])
      .select()
      .single()

    if (paymentError) {
      throw new Error(`Erro ao criar registro de pagamento: ${paymentError.message}`)
    }

    console.log('✅ create-asaas-payment: Registro de pagamento criado:', paymentRecord.id)

    // Configurar Asaas API
    const asaasBaseUrl = activeGateway.config.environment === 'production' 
      ? 'https://api.asaas.com/v3'
      : 'https://sandbox.asaas.com/api/v3'

    const asaasHeaders = {
      'Content-Type': 'application/json',
      'access_token': activeGateway.config.api_key
    }

    // Criar cobrança no Asaas
    const chargeData = {
      customer: customer_data?.asaas_customer_id || store.owner_id,
      billingType: 'CREDIT_CARD',
      value: plan.price_monthly,
      dueDate: new Date().toISOString().split('T')[0],
      description: `Upgrade para ${plan.name} - ${store.name}`,
      externalReference: paymentRecord.id,
      postalService: false
    }

    const asaasResponse = await fetch(`${asaasBaseUrl}/payments`, {
      method: 'POST',
      headers: asaasHeaders,
      body: JSON.stringify(chargeData)
    })

    const asaasResult = await asaasResponse.json()

    if (!asaasResponse.ok) {
      throw new Error(`Erro Asaas: ${asaasResult.errors?.[0]?.description || 'Erro desconhecido'}`)
    }

    // Atualizar registro com dados do Asaas
    await supabaseClient
      .from('plan_payments')
      .update({
        gateway_payment_id: asaasResult.id,
        gateway_response: asaasResult
      })
      .eq('id', paymentRecord.id)

    console.log('🎉 create-asaas-payment: Cobrança criada no Asaas:', asaasResult.id)

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: paymentRecord.id,
        asaas_charge_id: asaasResult.id,
        invoice_url: asaasResult.invoiceUrl,
        bank_slip_url: asaasResult.bankSlipUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ create-asaas-payment: Erro:', error)
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
