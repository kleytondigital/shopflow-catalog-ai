
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Iniciando liberação de reservas expiradas...')

    // Chamar função do banco para liberar reservas expiradas
    const { data, error } = await supabaseClient.rpc('release_expired_reservations')

    if (error) {
      console.error('Erro ao liberar reservas:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao liberar reservas expiradas' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    const releasedCount = data || 0
    console.log(`${releasedCount} reservas liberadas com sucesso`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        releasedCount,
        message: `${releasedCount} reservas liberadas com sucesso`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Erro na função de liberação:', error)
    
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
