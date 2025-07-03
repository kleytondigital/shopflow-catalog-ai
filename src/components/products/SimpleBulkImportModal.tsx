import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  Play,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string;
}

const SimpleBulkImportModal: React.FC<SimpleBulkImportModalProps> = ({
  isOpen,
  onClose,
  storeId,
}) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<
    "upload" | "preview" | "processing" | "results"
  >("upload");

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = event.target.files?.[0];
      if (!uploadedFile) return;

      if (!uploadedFile.name.endsWith(".xlsx")) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo .xlsx",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(uploadedFile);
      setStep("preview");
    },
    [toast]
  );

  const handleDownloadTemplate = useCallback(() => {
    // Template completo e detalhado
    const csvProdutos = `nome,descricao,categoria,preco_varejo,preco_atacarejo,preco_atacado_pequeno,preco_atacado_grande,estoque,sku,codigo_barras,peso_kg,largura_cm,altura_cm,profundidade_cm,tags,ativo,permite_estoque_negativo,observacoes_internas
iPhone 14 Pro 128GB,"Smartphone Apple iPhone 14 Pro com tela Super Retina XDR de 6.1 polegadas. Chip A16 Bionic para desempenho excepcional. Sistema de câmera Pro de 48MP com teleobjetiva.",Smartphones,4999.00,4699.00,4399.00,4199.00,50,IPHONE14PRO128,7891234567890,0.206,7.15,14.75,0.78,"eletrônicos,smartphones,apple,premium",TRUE,FALSE,Produto importado com garantia nacional
Samsung Galaxy S23 Ultra,"Smartphone Samsung Galaxy S23 Ultra com tela Dynamic AMOLED de 6.8 polegadas. Processador Snapdragon 8 Gen 2. Câmera de 200MP.",Smartphones,5499.00,5199.00,4899.00,4599.00,30,GALAXYS23ULTRA,7891234567891,0.234,7.62,16.31,0.89,"eletrônicos,smartphones,samsung,android",TRUE,FALSE,Lançamento 2023
MacBook Air M2 256GB,"Notebook Apple MacBook Air com chip M2. Tela Liquid Retina de 13.6 polegadas. 8GB RAM e 256GB SSD.",Notebooks,7999.00,7599.00,7199.00,6899.00,15,MACBOOKAIRM2256,7891234567892,1.24,30.41,21.5,1.13,"eletrônicos,notebooks,apple,m2",TRUE,FALSE,Garantia Apple de 1 ano
Camiseta Básica Algodão,"Camiseta básica confeccionada em 100% algodão. Modelagem confortável e tecido macio. Disponível em várias cores.",Roupas Masculinas,29.90,26.90,24.90,22.90,200,CAMISETA001,7891234567893,0.15,60,70,1,"roupas,camisetas,algodão,básico",TRUE,TRUE,Disponível nos tamanhos P ao GG
Tênis Esportivo Runner,"Tênis esportivo para corrida com tecnologia de amortecimento. Cabedal em mesh respirável e solado em borracha.",Calçados Esportivos,199.90,179.90,159.90,149.90,80,TENIS001,7891234567894,0.45,28,12,35,"calçados,tênis,esporte,corrida",TRUE,FALSE,Numeração 35 ao 44
Notebook Gamer RGB,"Notebook para jogos com placa de vídeo RTX 4060, processador Intel i7 e 16GB RAM. Teclado RGB e tela 144Hz.",Notebooks,4999.00,4699.00,4399.00,4199.00,25,NOTEBOOKGAMER001,7891234567895,2.5,35.5,25.9,2.4,"eletrônicos,notebooks,gamer,rgb",TRUE,FALSE,Produto para gamers
Smartphone Basic 64GB,"Smartphone básico para uso cotidiano. Tela de 6.1 polegadas, câmera dupla e bateria de longa duração.",Smartphones,599.00,549.00,499.00,449.00,100,SMARTBASIC64,7891234567896,0.18,7.0,15.5,0.8,"eletrônicos,smartphones,básico,econômico",TRUE,FALSE,Ótimo custo-benefício
Jaqueta Jeans Premium,"Jaqueta jeans premium com lavagem especial. Tecido resistente e acabamento refinado.",Roupas Masculinas,149.90,134.90,119.90,109.90,75,JAQUETAJEANS001,7891234567897,0.6,55,65,2,"roupas,jaquetas,jeans,premium",TRUE,FALSE,Tamanhos P ao GG disponíveis
Cafeteira Elétrica Inox,"Cafeteira elétrica de aço inoxidável com capacidade para 12 xícaras. Timer programável e sistema anti-gotejamento.",Casa e Decoração,249.90,224.90,199.90,179.90,40,CAFETEIRA001,7891234567898,1.8,25,35,18,"eletrodomésticos,cafeteira,inox,timer",TRUE,FALSE,Garantia de 2 anos
Cadeira Gamer Ergonômica,"Cadeira gamer com design ergonômico, apoio lombar ajustável e rodízios silenciosos. Suporta até 120kg.",Móveis,899.00,799.00,699.00,599.00,20,CADEIRAGAMER001,7891234567899,18.5,70,130,70,"móveis,cadeira,gamer,ergonômica",TRUE,FALSE,Montagem incluída
Mouse Gamer RGB 16000 DPI,"Mouse gamer de alta precisão com sensor óptico de 16000 DPI. 7 botões programáveis e iluminação RGB personalizável.",Eletrônicos,189.90,169.90,149.90,129.90,60,MOUSEGAMER001,7891234567800,0.12,12.8,4.2,6.8,"periféricos,mouse,gamer,rgb",TRUE,FALSE,Software personalização incluso
Perfume Masculino 100ml,"Perfume masculino amadeirado com notas de sândalo e cedro. Fragrância marcante e duradoura.",Perfumaria,159.90,139.90,119.90,99.90,35,PERFUMEMASC001,7891234567801,0.15,5.5,15,5.5,"perfumes,masculino,amadeirado,100ml",TRUE,FALSE,Produto nacional
Fone Bluetooth Premium,"Fone de ouvido bluetooth com cancelamento de ruído ativo. Bateria de 30h e carregamento rápido.",Eletrônicos,299.90,269.90,239.90,209.90,45,FONEBLUETOOTH001,7891234567802,0.28,18,20,8,"áudio,fone,bluetooth,cancelamento",TRUE,FALSE,Garantia de 1 ano
Relógio Smartwatch Fitness,"Smartwatch com monitor cardíaco, GPS integrado e resistência à água IPX8. Bateria de 7 dias.",Eletrônicos,449.90,399.90,349.90,299.90,30,SMARTWATCH001,7891234567803,0.08,4.5,1.2,4.5,"wearables,smartwatch,fitness,gps",TRUE,FALSE,App exclusivo incluído
Mochila Executiva Couro,"Mochila executiva em couro sintético premium. Compartimento para notebook 15.6 polegadas e carregador USB.",Acessórios,199.90,179.90,159.90,139.90,50,MOCHILAEXEC001,7891234567804,1.2,32,45,15,"acessórios,mochila,executiva,couro",TRUE,FALSE,Resistente à água`;

    const csvCategorias = `nome,descricao,ativo,ordem,categoria_pai
Eletrônicos,"Categoria principal para produtos eletrônicos",TRUE,1,
Smartphones,"Dispositivos móveis inteligentes com sistema operacional avançado",TRUE,1,Eletrônicos
Notebooks,"Computadores portáteis para uso pessoal e profissional",TRUE,2,Eletrônicos
Tablets,"Dispositivos touchscreen portáteis",TRUE,3,Eletrônicos
Periféricos,"Acessórios e periféricos para computadores",TRUE,4,Eletrônicos
Áudio,"Produtos de áudio e som",TRUE,5,Eletrônicos
Wearables,"Dispositivos vestíveis e smartwatches",TRUE,6,Eletrônicos
Moda,"Categoria principal para produtos de vestuário",TRUE,2,
Roupas Masculinas,"Vestuário e acessórios para o público masculino",TRUE,1,Moda
Roupas Femininas,"Vestuário e acessórios para o público feminino",TRUE,2,Moda
Acessórios,"Acessórios de moda e uso pessoal",TRUE,3,Moda
Perfumaria,"Perfumes e fragrâncias",TRUE,4,Moda
Esportes,"Categoria principal para produtos esportivos",TRUE,3,
Calçados Esportivos,"Calçados específicos para atividades físicas e esportivas",TRUE,1,Esportes
Roupas Esportivas,"Vestuário para atividades físicas",TRUE,2,Esportes
Casa e Decoração,"Produtos para casa e decoração",TRUE,4,
Móveis,"Móveis e mobiliário",TRUE,1,Casa e Decoração
Eletrodomésticos,"Aparelhos elétricos para uso doméstico",TRUE,2,Casa e Decoração
Decoração,"Itens decorativos e ornamentais",TRUE,3,Casa e Decoração`;

    const csvVariacoes = `sku_produto,tipo_variacao,valor_variacao,estoque_variacao,preco_adicional,codigo_barras_variacao,peso_adicional,observacoes
IPHONE14PRO128,Cor,Roxo Profundo,15,0,7891234567890001,0,Cor mais popular
IPHONE14PRO128,Cor,Dourado,10,0,7891234567890002,0,Cor premium
IPHONE14PRO128,Cor,Prateado,12,0,7891234567890003,0,Cor clássica
IPHONE14PRO128,Cor,Preto Espacial,13,0,7891234567890004,0,Cor elegante
CAMISETA001,Tamanho,P,40,0,7891234567893001,0,Tamanho Pequeno
CAMISETA001,Tamanho,M,60,0,7891234567893002,0,Tamanho Médio
CAMISETA001,Tamanho,G,50,0,7891234567893003,0,Tamanho Grande
CAMISETA001,Tamanho,GG,30,0,7891234567893004,0,Tamanho Extra Grande
CAMISETA001,Cor,Branco,50,0,7891234567893010,0,Cor neutra
CAMISETA001,Cor,Preto,45,0,7891234567893011,0,Cor versátil
CAMISETA001,Cor,Azul Marinho,35,0,7891234567893012,0,Cor elegante
CAMISETA001,Cor,Cinza Mescla,40,0,7891234567893013,0,Cor casual
TENIS001,Tamanho,37,8,0,7891234567894037,0,Numeração 37
TENIS001,Tamanho,38,10,0,7891234567894038,0,Numeração 38
TENIS001,Tamanho,39,12,0,7891234567894039,0,Numeração 39
TENIS001,Tamanho,40,15,0,7891234567894040,0,Numeração 40
TENIS001,Tamanho,41,18,0,7891234567894041,0,Numeração 41
TENIS001,Tamanho,42,20,0,7891234567894042,0,Numeração 42
TENIS001,Tamanho,43,12,0,7891234567894043,0,Numeração 43
TENIS001,Tamanho,44,8,0,7891234567894044,0,Numeração 44
NOTEBOOKGAMER001,Memória RAM,16GB,15,0,7891234567895016,0,Configuração padrão
NOTEBOOKGAMER001,Memória RAM,32GB,10,500,7891234567895032,0,Configuração premium
NOTEBOOKGAMER001,Armazenamento,512GB SSD,20,0,7891234567895512,0,SSD padrão
NOTEBOOKGAMER001,Armazenamento,1TB SSD,15,300,7891234567895001,0,SSD premium
JAQUETAJEANS001,Tamanho,P,15,0,7891234567897001,0,Tamanho P
JAQUETAJEANS001,Tamanho,M,20,0,7891234567897002,0,Tamanho M
JAQUETAJEANS001,Tamanho,G,25,0,7891234567897003,0,Tamanho G
JAQUETAJEANS001,Tamanho,GG,15,0,7891234567897004,0,Tamanho GG
MOUSEGAMER001,Cor,Preto,30,0,7891234567800001,0,Cor clássica
MOUSEGAMER001,Cor,Branco,20,10,7891234567800002,0,Cor premium
MOUSEGAMER001,Cor,RGB Multicolor,10,20,7891234567800003,0,Edição especial
SMARTWATCH001,Cor da Pulseira,Preto,15,0,7891234567803001,0,Pulseira esportiva
SMARTWATCH001,Cor da Pulseira,Azul,10,0,7891234567803002,0,Pulseira esportiva
SMARTWATCH001,Cor da Pulseira,Rosa,8,0,7891234567803003,0,Pulseira esportiva
SMARTWATCH001,Cor da Pulseira,Couro Marrom,7,50,7891234567803004,0.02,Pulseira premium
PERFUMEMASC001,Tamanho,50ml,20,-40,7891234567801050,0.08,Tamanho compacto
PERFUMEMASC001,Tamanho,100ml,15,0,7891234567801100,0.15,Tamanho padrão
PERFUMEMASC001,Tamanho,200ml,5,60,7891234567801200,0.30,Tamanho família`;

    // Instruções detalhadas
    const instrucoes = `📋 TEMPLATE DE IMPORTAÇÃO EM MASSA - VENDEMAIS v3.0

═══════════════════════════════════════════════════════════
🚀 GUIA COMPLETO DE IMPORTAÇÃO
═══════════════════════════════════════════════════════════

📌 ARQUIVOS BAIXADOS:
1️⃣ VendeMais-1-PRODUTOS.csv (15 produtos de exemplo)
2️⃣ VendeMais-2-CATEGORIAS.csv (18 categorias organizadas)
3️⃣ VendeMais-3-VARIACOES.csv (35+ variações detalhadas)
4️⃣ Este arquivo de instruções

🔥 COMO USAR:
• Abra cada CSV no Excel como abas separadas
• Mantenha os cabeçalhos EXATAMENTE como estão
• Campos com * são OBRIGATÓRIOS
• Use ponto (.) para decimais: 29.99 ✓
• Para TRUE/FALSE use maiúsculo
• Máximo: 1000 produtos por importação

═══════════════════════════════════════════════════════════
📊 ESTRUTURA DETALHADA
═══════════════════════════════════════════════════════════

🛍️ ABA PRODUTOS (18 campos):
╭─────────────────────────────────────────────────────────╮
│ OBRIGATÓRIOS:                                           │
│ • nome* ──────────── Nome do produto                   │
│ • categoria* ─────── Deve existir na aba CATEGORIAS    │
│                                                         │
│ PREÇOS (sistema de tier automático):                   │
│ • preco_varejo ──────── 1-4 unidades                   │
│ • preco_atacarejo ───── 5-9 unidades (5-10% desc)     │
│ • preco_atacado_pequeno  10-49 unidades (10-20% desc)  │
│ • preco_atacado_grande   50+ unidades (20-30% desc)    │
│                                                         │
│ FÍSICOS E LOGÍSTICA:                                    │
│ • estoque ────────── Quantidade disponível             │
│ • sku ─────────────── Código único (ex: IPHONE14PRO)   │
│ • codigo_barras ───── EAN-13 (13 dígitos)              │
│ • peso_kg ─────────── Peso em quilogramas              │
│ • largura_cm ──────── Largura em centímetros           │
│ • altura_cm ───────── Altura em centímetros            │
│ • profundidade_cm ─── Profundidade em centímetros      │
│                                                         │
│ MARKETING E CONTROLE:                                   │
│ • descricao ─────────── Descrição rica do produto      │
│ • tags ─────────────── Tags SEO (vírgula separada)     │
│ • ativo ────────────── TRUE/FALSE (produto ativo)      │
│ • permite_estoque_negativo ── TRUE permite venda s/est │
│ • observacoes_internas ─── Notas da equipe             │
╰─────────────────────────────────────────────────────────╯

🏷️ ABA CATEGORIAS (hierárquica):
╭─────────────────────────────────────────────────────────╮
│ • nome* ────────────── Nome da categoria               │
│ • descricao ───────── Descrição da categoria           │
│ • ativo ──────────── TRUE/FALSE (categoria ativa)      │
│ • ordem ──────────── Ordem de exibição (1,2,3...)      │
│ • categoria_pai ───── Categoria superior (hierarquia)  │
│                                                         │
│ 📝 HIERARQUIA EXEMPLO:                                  │
│ Eletrônicos (pai) → Smartphones (filha)                │
│ Moda (pai) → Roupas Masculinas (filha)                 │
╰─────────────────────────────────────────────────────────╯

🎨 ABA VARIAÇÕES (flexível):
╭─────────────────────────────────────────────────────────╮
│ • sku_produto* ──────── SKU do produto pai             │
│ • tipo_variacao ────── Cor, Tamanho, Material, etc.    │
│ • valor_variacao ───── Azul, M, Couro, 16GB, etc.      │
│ • estoque_variacao ─── Estoque específico              │
│ • preco_adicional ──── Valor extra (pode ser negativo) │
│ • codigo_barras_variacao ── Código único da variação   │
│ • peso_adicional ───── Peso extra em KG                │
│ • observacoes ──────── Notas específicas               │
╰─────────────────────────────────────────────────────────╯

═══════════════════════════════════════════════════════════
🎯 EXEMPLOS PRÁTICOS DETALHADOS
═══════════════════════════════════════════════════════════

📱 PRODUTO ELETRÔNICO (iPhone):
• Produto Principal: IPHONE14PRO128
• Variações: 4 cores diferentes
• Estoque individual por cor
• Mesmo preço para todas as cores

👕 PRODUTO DE VESTUÁRIO (Camiseta):
• Produto Principal: CAMISETA001  
• Variações: 4 tamanhos + 4 cores = 16 combinações
• Sistema criará automaticamente: P-Branco, P-Preto, M-Branco, etc.
• Estoque controlado individualmente

💻 PRODUTO CONFIGURÁVEL (Notebook):
• Produto Principal: NOTEBOOKGAMER001
• Variações: Memória (16GB/32GB) + Armazenamento (512GB/1TB)
• Preços adicionais: 32GB (+R$500), 1TB (+R$300)
• 4 configurações finais automáticas

🕗 PRODUTO COM TAMANHOS (Smartwatch):
• Produto Principal: SMARTWATCH001
• Variações: 4 tipos de pulseira
• Preço adicional para pulseira de couro (+R$50)
• Pesos diferentes para materiais diferentes

═══════════════════════════════════════════════════════════
💰 ESTRATÉGIA DE PREÇOS INTELIGENTE
═══════════════════════════════════════════════════════════

📈 EXEMPLO REAL (Camiseta Premium):

Base: R$ 50,00 (varejo)
🛒 Varejo (1-4 un): R$ 50,00 ──── Preço cheio
🏪 Atacarejo (5-9 un): R$ 45,00 ── 10% desconto  
📦 Atacado Pequeno (10-49 un): R$ 40,00 ── 20% desconto
🏭 Atacado Grande (50+ un): R$ 35,00 ── 30% desconto

🎯 DICAS DE MARGEM:
• Eletrônicos: 5-15% entre tiers
• Roupas: 10-25% entre tiers  
• Casa: 8-20% entre tiers
• Perfumaria: 12-30% entre tiers

═══════════════════════════════════════════════════════════
🔍 CÓDIGOS E IDENTIFICADORES
═══════════════════════════════════════════════════════════

🏷️ CÓDIGOS SKU (Boas Práticas):
✓ IPHONE14PRO128 ────── Marca + Modelo + Capacidade
✓ CAMISETAALG001 ───── Tipo + Material + Numeração
✓ NOTEBOOKGAMER001 ──── Categoria + Segmento + Série
✓ MOUSEGAMER001 ─────── Tipo + Segmento + Série

📊 CÓDIGOS DE BARRAS EAN-13:
• Produto pai: 7891234567890
• Variação 1: 7891234567890001
• Variação 2: 7891234567890002
• SEMPRE 13 dígitos numéricos

🏷️ TAGS INTELIGENTES:
• Use 3-6 tags por produto
• Inclua: marca, categoria, características, público
• Exemplo: "eletrônicos,smartphones,apple,premium,5g,camera"

═══════════════════════════════════════════════════════════
✅ VALIDAÇÕES AUTOMÁTICAS DO SISTEMA
═══════════════════════════════════════════════════════════

O sistema verificará:
✓ Campos obrigatórios preenchidos
✓ Formatos de preço corretos (ponto decimal)
✓ SKUs únicos dentro da loja
✓ Categorias existem na aba CATEGORIAS
✓ Códigos de barras válidos (EAN-13)
✓ Valores numéricos corretos
✓ Referências entre produtos e variações
✓ Limite de 1000 produtos por importação
✓ Tamanho máximo de arquivo (10MB)

═══════════════════════════════════════════════════════════
🚀 FLUXO DE IMPORTAÇÃO STEP-BY-STEP
═══════════════════════════════════════════════════════════

1️⃣ PREPARAÇÃO (5-10 min):
   • Baixe os 3 templates CSV
   • Abra no Excel/Google Sheets
   • Estude os exemplos fornecidos
   • Organize seus dados

2️⃣ PREENCHIMENTO (tempo variável):
   • Comece pela aba CATEGORIAS
   • Preencha PRODUTOS básicos primeiro
   • Adicione VARIAÇÕES se necessário
   • Teste com poucos produtos primeiro

3️⃣ VALIDAÇÃO PRÉVIA:
   • Confira campos obrigatórios
   • Verifique formatos de preço
   • Teste referências entre abas
   • Salve como .xlsx (Excel)

4️⃣ UPLOAD E PROCESSAMENTO:
   • Faça upload do arquivo .xlsx
   • Sistema validará automaticamente
   • Corrija erros se necessário
   • Confirme importação

5️⃣ RESULTADO:
   • Relatório detalhado
   • Produtos importados
   • Erros e sugestões
   • Estatísticas completas

═══════════════════════════════════════════════════════════
🛠️ SOLUÇÃO DE PROBLEMAS
═══════════════════════════════════════════════════════════

❌ "SKU já existe na loja"
✅ Altere o SKU ou marque para atualizar produto existente

❌ "Categoria não encontrada"
✅ Verifique se existe na aba CATEGORIAS com nome exato

❌ "Formato de preço inválido"
✅ Use ponto: 29.99 ✓ (não vírgula: 29,99 ✗)

❌ "Código de barras inválido"
✅ Use exatamente 13 dígitos numéricos

❌ "Variação sem produto pai"
✅ SKU da variação deve existir na aba PRODUTOS

❌ "Arquivo muito grande"
✅ Máximo 10MB ou 1000 produtos por vez

❌ "Erro ao salvar produto"
✅ Verifique campos obrigatórios e formatos

═══════════════════════════════════════════════════════════
📞 SUPORTE E RECURSOS
═══════════════════════════════════════════════════════════

🆘 EM CASO DE DÚVIDAS:
• Consulte este manual completo
• Analise os exemplos nos CSVs
• Teste com poucos produtos primeiro
• Entre em contato com suporte técnico

📚 RECURSOS EXTRAS:
• Tutorial em vídeo (em breve)
• Webinar semanal de dúvidas
• Base de conhecimento online
• Suporte por chat

🎉 DICAS FINAIS:
• Comece pequeno (10-20 produtos)
• Use exemplos como base
• Organize dados antes de importar
• Faça backup dos arquivos
• Teste preços em sandbox primeiro

═══════════════════════════════════════════════════════════

Template Versão: 3.0 - Completa
Data: ${new Date().toLocaleDateString("pt-BR")}
Sistema: VendeMais - Importação em Massa
Exemplos: 15 produtos + 18 categorias + 35 variações

═══════════════════════════════════════════════════════════
🎯 AGORA É SÓ IMPORTAR E VENDER MAIS! 🚀
═══════════════════════════════════════════════════════════`;

    // Função para download
    const downloadFile = (content: string, filename: string) => {
      const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    // Downloads sequenciais
    downloadFile(csvProdutos, "VendeMais-1-PRODUTOS.csv");
    setTimeout(
      () => downloadFile(csvCategorias, "VendeMais-2-CATEGORIAS.csv"),
      500
    );
    setTimeout(
      () => downloadFile(csvVariacoes, "VendeMais-3-VARIACOES.csv"),
      1000
    );
    setTimeout(
      () => downloadFile(instrucoes, "VendeMais-INSTRUCOES-COMPLETAS.txt"),
      1500
    );

    toast({
      title: "Template COMPLETO baixado! 🎉",
      description:
        "4 arquivos: 15 produtos + 18 categorias + 35 variações + instruções detalhadas. Tudo pronto para uso!",
    });
  }, [toast]);

  const handleStartImport = useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: "Arquivo necessário",
        description: "Por favor, selecione um arquivo para importar",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");
    setIsProcessing(true);

    // Simulação de progresso
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);
    }

    setIsProcessing(false);
    setStep("results");

    toast({
      title: "Importação simulada concluída",
      description:
        "Este é apenas um exemplo. Implementação real em desenvolvimento.",
    });
  }, [selectedFile, toast]);

  const resetModal = () => {
    setSelectedFile(null);
    setProgress(0);
    setIsProcessing(false);
    setStep("upload");
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetModal();
      onClose();
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Faça upload da sua planilha
            </h3>
            <p className="text-gray-600 mb-4">
              Selecione um arquivo .xlsx com seus produtos
            </p>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">
                Precisa de um template?
              </h3>
              <p className="text-gray-600">
                Baixe nosso modelo padrão com exemplos
              </p>
            </div>
            <Button onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Template
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dicas importantes:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Use apenas arquivos .xlsx (Excel)</li>
            <li>Nome e categoria são campos obrigatórios</li>
            <li>Esta é uma versão de demonstração</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Arquivo Selecionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">{selectedFile?.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedFile
                    ? (selectedFile.size / 1024 / 1024).toFixed(2)
                    : 0}{" "}
                  MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                setStep("upload");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Importação em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Processando arquivo...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Esta é uma simulação. A implementação real será conectada ao backend.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Simulação Concluída
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              Demo do sistema de importação em massa
            </p>
            <p className="text-gray-600">
              O sistema está pronto! Aguardando integração com o backend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <div>
              <DialogTitle className="text-xl font-bold">
                Importação em Massa de Produtos
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Importe produtos em lote via planilha Excel
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {step === "upload" && renderUploadStep()}
          {step === "preview" && renderPreviewStep()}
          {step === "processing" && renderProcessingStep()}
          {step === "results" && renderResultsStep()}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {step !== "upload" && step !== "processing" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === "preview") {
                    setStep("upload");
                  } else if (step === "results") {
                    resetModal();
                  }
                }}
              >
                Voltar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              {step === "results" ? "Fechar" : "Cancelar"}
            </Button>

            {step === "preview" && (
              <Button
                onClick={handleStartImport}
                disabled={isProcessing || !selectedFile}
              >
                <Play className="h-4 w-4 mr-2" />
                Simular Importação
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleBulkImportModal;
