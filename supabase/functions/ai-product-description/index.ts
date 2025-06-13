
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
    const { productName, category } = await req.json()

    if (!productName) {
      return new Response(
        JSON.stringify({ error: 'Nome do produto é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Usar OPENAI_KEY que é o nome correto do secret
    const openaiApiKey = Deno.env.get('OPENAI_KEY')
    if (!openaiApiKey) {
      console.error('OPENAI_KEY não encontrada nas variáveis de ambiente')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key não configurada. Verifique as configurações no Supabase.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Gerando descrição para produto:', productName, 'categoria:', category)

    const prompt = `
Crie uma descrição comercial persuasiva para o produto "${productName}"${category ? ` da categoria "${category}"` : ''}.

A descrição deve:
- Ser atrativa e focada em vendas
- Destacar benefícios e diferenciais
- Usar linguagem clara e envolvente
- Ter entre 100-200 palavras
- Incluir características que despertem interesse de compra
- Usar linguagem brasileira informal mas profissional

Produto: ${productName}
${category ? `Categoria: ${category}` : ''}

Responda apenas com a descrição, sem formatação adicional.
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
            content: 'Você é um especialista em copywriting para e-commerce brasileiro. Crie descrições que convertem visitantes em compradores usando linguagem brasileira.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro da OpenAI API:', errorData)
      throw new Error(errorData.error?.message || 'Erro na API do OpenAI')
    }

    const data = await response.json()
    const description = data.choices[0]?.message?.content?.trim()

    console.log('Descrição gerada com sucesso')

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao gerar descrição:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
