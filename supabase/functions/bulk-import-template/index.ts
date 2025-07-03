import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Template em formato CSV que pode ser aberto no Excel
    const productsTemplate = `nome,descricao,categoria,preco_varejo,preco_atacarejo,preco_atacado_pequeno,preco_atacado_grande,estoque,sku,codigo_barras,peso,largura,altura,profundidade,tags,ativo
Produto Exemplo 1,Descrição detalhada do produto,Categoria A,29.99,24.99,19.99,14.99,100,PROD001,7891234567890,0.5,10,20,5,"tag1,tag2",TRUE
Produto Exemplo 2,Outro produto de exemplo,Categoria B,45.00,38.00,32.00,25.00,50,PROD002,7891234567891,1.2,15,25,8,"tag3,tag4",TRUE`;

    const categoriesTemplate = `nome,descricao,ativo,ordem
Categoria A,Primeira categoria de produtos,TRUE,1
Categoria B,Segunda categoria de produtos,TRUE,2
Categoria C,Terceira categoria de produtos,TRUE,3`;

    const variationsTemplate = `sku_produto,tamanho,cor,estoque,preco_adicional
PROD001,P,Azul,25,0
PROD001,M,Azul,30,2.00
PROD001,G,Azul,25,4.00
PROD001,P,Vermelho,20,0
PROD002,Único,Preto,50,0`;

    const instructions = `INSTRUÇÕES PARA IMPORTAÇÃO EM MASSA

ABAS OBRIGATÓRIAS:
1. PRODUTOS - Lista principal de produtos
2. CATEGORIAS - Categorias que serão criadas/utilizadas  
3. VARIACOES - Variações dos produtos (opcional)

CAMPOS OBRIGATÓRIOS (PRODUTOS):
- nome: Nome do produto
- categoria: Nome da categoria (deve existir na aba CATEGORIAS)

CAMPOS OPCIONAIS (PRODUTOS):
- descricao: Descrição detalhada
- preco_varejo: Preço para venda no varejo
- preco_atacarejo: Preço para atacarejo (5-9 unidades)
- preco_atacado_pequeno: Preço atacado pequeno (10-49 unidades)
- preco_atacado_grande: Preço atacado grande (50+ unidades)
- estoque: Quantidade em estoque
- sku: Código único do produto
- codigo_barras: Código de barras/EAN
- peso: Peso em KG
- largura: Largura em CM
- altura: Altura em CM
- profundidade: Profundidade em CM
- tags: Tags separadas por vírgula
- ativo: TRUE ou FALSE

CAMPOS OBRIGATÓRIOS (CATEGORIAS):
- nome: Nome da categoria

CAMPOS OPCIONAIS (CATEGORIAS):
- descricao: Descrição da categoria
- ativo: TRUE ou FALSE
- ordem: Ordem de exibição (número)

CAMPOS PARA VARIAÇÕES:
- sku_produto: SKU do produto pai
- tamanho: Tamanho da variação
- cor: Cor da variação
- estoque: Estoque específico desta variação
- preco_adicional: Valor adicional ao preço base

DICAS IMPORTANTES:
1. Use ponto (.) como separador decimal: 19.99
2. Para valores booleanos use: TRUE ou FALSE
3. Tags devem ser separadas por vírgula: "tag1,tag2,tag3"
4. SKUs devem ser únicos por loja
5. Categorias serão criadas automaticamente se não existirem
6. Produtos existentes podem ser atualizados se configurado

LIMITES:
- Máximo 10MB por arquivo
- Máximo 1000 produtos por importação
- Apenas arquivos .xlsx são aceitos`;

    // Criar resposta com múltiplos templates
    const responseData = {
      produtos: productsTemplate,
      categorias: categoriesTemplate,
      variacoes: variationsTemplate,
      instrucoes: instructions,
      downloadUrl: null, // Será implementado para gerar arquivo real
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        message:
          "Template gerado com sucesso. Copie cada seção para uma aba separada no Excel.",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition":
            'attachment; filename="template-importacao.json"',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao gerar template:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
