
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { productName, category, description } = await req.json()

    if (!productName) {
      return new Response(
        JSON.stringify({ error: 'Nome do produto é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `
Gere conteúdo SEO completo para o produto "${productName}"${category ? ` da categoria "${category}"` : ''}.
${description ? `Descrição do produto: ${description}` : ''}

Gere:
1. Meta Title (máximo 60 caracteres, otimizado para SEO)
2. Meta Description (máximo 160 caracteres, persuasiva)
3. Palavras-chave (10-15 palavras relevantes, separadas por vírgula)
4. Slug SEO (URL amigável, apenas letras minúsculas, números e hífen)

Retorne no formato JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": "...",
  "seoSlug": "..."
}
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em SEO para e-commerce brasileiro. Sempre retorne apenas JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const content = data.choices[0]?.message?.content?.trim()

    try {
      const seoData = JSON.parse(content)
      return new Response(
        JSON.stringify(seoData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      return new Response(
        JSON.stringify({ error: 'Erro ao processar resposta da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Erro ao gerar SEO:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
