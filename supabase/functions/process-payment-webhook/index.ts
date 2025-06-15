
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
    console.log('🔔 process-payment-webhook: Webhook recebido')
    
    const body = await req.text()
    const data = JSON.parse(body)
    const userAgent = req.headers.get('user-agent') || ''
    
    // Conectar ao Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let paymentId: string | null = null
    let newStatus: string | null = null
    let gatewayResponse = data

    // Identificar se é Stripe ou Asaas pelo User-Agent ou estrutura
    if (userAgent.includes('Stripe') || data.type) {
      // Webhook do Stripe
      console.log('📱 Stripe webhook detectado:', data.type)
      
      if (data.type === 'checkout.session.completed') {
        paymentId = data.data.object.metadata?.payment_id
        newStatus = 'completed'
      } else if (data.type === 'payment_intent.payment_failed') {
        paymentId = data.data.object.metadata?.payment_id
        newStatus = 'failed'
      }

    } else if (data.event || data.payment) {
      // Webhook do Asaas
      console.log('💳 Asaas webhook detectado:', data.event)
      
      const asaasPayment = data.payment || data
      
      // Buscar pagamento pelo gateway_payment_id
      const { data: paymentRecord, error: findError } = await supabaseClient
        .from('plan_payments')
        .select('*')
        .eq('gateway_payment_id', asaasPayment.id)
        .single()

      if (!findError && paymentRecord) {
        paymentId = paymentRecord.id
        
        switch (asaasPayment.status) {
          case 'CONFIRMED':
          case 'RECEIVED':
            newStatus = 'completed'
            break
          case 'OVERDUE':
          case 'REFUNDED':
            newStatus = 'failed'
            break
          case 'PENDING':
            newStatus = 'pending'
            break
        }
      }
    }

    if (!paymentId || !newStatus) {
      console.log('⚠️ Webhook ignorado - não é um evento relevante')
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`🔄 Atualizando pagamento ${paymentId} para status: ${newStatus}`)

    // Atualizar status do pagamento
    const { data: updatedPayment, error: updateError } = await supabaseClient
      .from('plan_payments')
      .update({
        status: newStatus,
        gateway_response: gatewayResponse
      })
      .eq('id', paymentId)
      .select('*, store:stores(*), plan:subscription_plans(*)')
      .single()

    if (updateError) {
      throw new Error(`Erro ao atualizar pagamento: ${updateError.message}`)
    }

    // Se pagamento foi confirmado, atualizar assinatura da loja
    if (newStatus === 'completed') {
      console.log('✅ Pagamento confirmado, ativando plano da loja')
      
      // Verificar se já existe assinatura ativa
      const { data: existingSubscription } = await supabaseClient
        .from('store_subscriptions')
        .select('*')
        .eq('store_id', updatedPayment.store_id)
        .eq('status', 'active')
        .single()

      if (existingSubscription) {
        // Atualizar assinatura existente
        await supabaseClient
          .from('store_subscriptions')
          .update({
            plan_id: updatedPayment.plan_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscription.id)
      } else {
        // Criar nova assinatura
        await supabaseClient
          .from('store_subscriptions')
          .insert([{
            store_id: updatedPayment.store_id,
            plan_id: updatedPayment.plan_id,
            status: 'active',
            starts_at: new Date().toISOString()
          }])
      }

      console.log('🎉 Assinatura da loja ativada/atualizada')
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: paymentId,
        new_status: newStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ process-payment-webhook: Erro:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
