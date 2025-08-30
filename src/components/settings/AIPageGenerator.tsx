import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { useAIProviders } from "@/hooks/useAIProviders";
import { useStores } from "@/hooks/useStores";
import {
  Sparkles,
  Loader2,
  Eye,
  Download,
  Settings,
  AlertCircle,
  Store,
  Info,
} from "lucide-react";
import { DEFAULT_CONTENT, getContentDescription } from "./FooterDefaultContent";

interface AIPageGeneratorProps {
  pageType: keyof typeof DEFAULT_CONTENT;
  title: string;
  currentContent: string;
  onContentGenerated: (content: string) => void;
}

interface StoreInfo {
  name: string;
  industry: string;
  location: string;
  phone: string;
  email: string;
  description?: string;
}

const AIPageGenerator: React.FC<AIPageGeneratorProps> = ({
  pageType,
  title,
  currentContent,
  onContentGenerated,
}) => {
  const { toast } = useToast();
  const { checkAIUsage } = usePlanPermissions();
  const { generateAIContent } = useAIProviders("global");
  const { currentStore } = useStores();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Informações da loja para personalização
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "",
    industry: "",
    location: "",
    phone: "",
    email: "",
    description: "",
  });

  const aiAccess = checkAIUsage();

  // Função para mapear dados da loja para o tipo de negócio baseado na descrição
  const inferIndustryFromDescription = (description?: string) => {
    if (!description) return "";

    const desc = description.toLowerCase();

    // Mapeamento básico baseado em palavras-chave
    const industryKeywords = {
      "moda feminina": ["moda", "feminina", "roupas", "vestidos", "blusa"],
      "moda masculina": ["masculina", "camisetas", "calças"],
      eletrônicos: ["eletrônicos", "tecnologia", "smartphone", "computador"],
      "casa e jardim": ["casa", "decoração", "móveis", "jardim"],
      alimentação: ["alimentação", "comida", "restaurante", "lanchonete"],
      "saúde e beleza": ["beleza", "cosméticos", "perfumes", "saúde"],
      automóveis: ["carros", "automóveis", "peças", "mecânica"],
      esportes: ["esportes", "fitness", "academia", "equipamentos"],
      "livros e educação": ["livros", "educação", "cursos", "papelaria"],
      pets: ["pets", "animais", "ração", "veterinário"],
    };

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some((keyword) => desc.includes(keyword))) {
        return industry;
      }
    }

    return "varejo geral";
  };

  // Pré-carregar informações da loja atual
  useEffect(() => {
    if (currentStore && storeInfo.name === "") {
      console.log(
        "🏪 AIPageGenerator: Carregando dados da loja:",
        currentStore.name
      );

      // Extrair cidade/estado do endereço se disponível
      const extractLocation = (address?: string) => {
        if (!address) return "";

        // Tentar extrair cidade e estado do final do endereço
        const parts = address.split(",");
        if (parts.length >= 2) {
          const cityState = parts
            .slice(-2)
            .map((part) => part.trim())
            .join(", ");
          return cityState;
        }

        return address;
      };

      setStoreInfo({
        name: currentStore.name || "",
        industry: inferIndustryFromDescription(currentStore.description),
        location: extractLocation(currentStore.address),
        phone: currentStore.phone || "",
        email: currentStore.email || "",
        description: currentStore.description || "",
      });

      setIsPreloaded(true);

      // Mostrar toast informativo apenas se algumas informações foram carregadas
      const hasInfo =
        currentStore.name || currentStore.phone || currentStore.email;
      if (hasInfo) {
        toast({
          title: "Informações pré-carregadas!",
          description: `Dados da loja "${currentStore.name}" foram carregados automaticamente.`,
        });
      }
    }
  }, [currentStore, storeInfo.name, toast]);

  const generatePrompt = (
    type: keyof typeof DEFAULT_CONTENT,
    info: StoreInfo
  ) => {
    const basePrompts = {
      privacy_policy: `Crie uma política de privacidade completa e profissional para a loja "${
        info.name
      }" do setor ${info.industry || "varejo"}. 
      
Informações da empresa:
- Nome: ${info.name}
- Setor: ${info.industry || "varejo"}
- Localização: ${info.location || "Brasil"}
- Contato: ${info.email || "contato@loja.com"}

A política deve:
- Estar em conformidade com a LGPD (Lei Geral de Proteção de Dados do Brasil)
- Ser clara e acessível para o público geral
- Cobrir coleta, uso, compartilhamento e proteção de dados
- Incluir direitos dos titulares de dados
- Ter seções bem organizadas com títulos e subtítulos
- Usar formatação Markdown
- Ter entre 800-1200 palavras

Tome cuidado para personalizar o conteúdo de acordo com o setor e as características da loja.`,

      terms_of_use: `Crie termos de uso completos e juridicamente sólidos para a loja online "${
        info.name
      }" do setor ${info.industry || "varejo"}.

Informações da empresa:
- Nome: ${info.name}
- Setor: ${info.industry || "varejo"}
- Localização: ${info.location || "Brasil"}
- Contato: ${info.email || "contato@loja.com"}

Os termos devem incluir:
- Aceitação dos termos
- Descrição dos serviços/produtos
- Responsabilidades do usuário e da empresa
- Política de preços e pagamentos
- Propriedade intelectual
- Limitações de responsabilidade
- Resolução de disputas
- Legislação aplicável (Brasil)
- Formatação Markdown
- Entre 600-1000 palavras

Personalize conforme o setor e características da loja.`,

      returns_policy: `Crie uma política de trocas e devoluções detalhada para a loja "${
        info.name
      }" do setor ${info.industry || "varejo"}.

Informações da empresa:
- Nome: ${info.name}
- Setor: ${info.industry || "varejo"}
- Localização: ${info.location || "Brasil"}
- Contato: ${info.phone || info.email || "contato@loja.com"}

A política deve cobrir:
- Prazos para trocas e devoluções (padrão CDC: 7 dias para compras online)
- Condições dos produtos para troca
- Produtos excluídos da política de troca
- Processo passo a passo para solicitar troca
- Política de reembolso (prazos e métodos)
- Custos de envio
- Produtos com defeito
- Direitos do consumidor (CDC)
- Formatação Markdown
- Entre 500-800 palavras

Personalize de acordo com o tipo de produtos vendidos.`,

      delivery_policy: `Crie uma política de entrega abrangente para a loja "${
        info.name
      }" do setor ${info.industry || "varejo"}.

Informações da empresa:
- Nome: ${info.name}
- Setor: ${info.industry || "varejo"}
- Localização: ${info.location || "Brasil"}
- Contato: ${info.phone || info.email || "contato@loja.com"}

A política deve incluir:
- Opções de entrega disponíveis (retirada, entrega local, correios)
- Prazos de entrega por região
- Cálculo de frete
- Embalagem e segurança
- Rastreamento de pedidos
- Problemas na entrega
- Áreas de cobertura
- Horários de funcionamento para retirada
- Formatação Markdown
- Entre 600-900 palavras

Adapte as opções de entrega conforme o tipo de negócio e localização.`,

      about_us: `Crie uma página "Sobre Nós" envolvente e profissional para a loja "${
        info.name
      }" do setor ${info.industry || "varejo"}.

Informações da empresa:
- Nome: ${info.name}
- Setor: ${info.industry || "varejo"}
- Localização: ${info.location || "Brasil"}
- Contato: ${info.phone || info.email || "contato@loja.com"}
${info.description ? `- Descrição: ${info.description}` : ""}

A página deve incluir:
- História da empresa (pode ser criativa e inspiradora)
- Missão e visão
- Valores da empresa
- Equipe ou fundadores
- Diferenciais competitivos
- Compromisso com o cliente
- Localização e facilidades
- Horários de funcionamento
- Formatação Markdown
- Tom inspirador e profissional
- Entre 600-1000 palavras

Torne a história única e memorável, adaptada ao setor específico.`,
    };

    return basePrompts[type];
  };

  const handleGenerate = async () => {
    if (!aiAccess.hasAccess) {
      toast({
        title: "Acesso negado",
        description: aiAccess.message || "Você não tem acesso à geração de IA",
        variant: "destructive",
      });
      return;
    }

    if (!storeInfo.name.trim()) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha pelo menos o nome da loja",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = generatePrompt(pageType, storeInfo);

      const response = await generateAIContent({
        provider: "gemini", // Usar Gemini como padrão
        prompt,
        max_tokens: 1500,
        temperature: 0.7,
        system_message: `Você é um especialista em criação de conteúdo jurídico e comercial para e-commerce brasileiro. 
        Crie conteúdo que esteja em conformidade com as leis brasileiras (LGPD, CDC, Marco Civil da Internet). 
        Use linguagem clara, profissional e acessível. Sempre formate o conteúdo em Markdown com títulos e subtítulos bem estruturados.`,
      });

      if (!response.success || !response.content) {
        throw new Error(response.error || "Nenhum conteúdo foi gerado");
      }

      console.log("✅ AI - Página gerada:", response.content);

      setGeneratedContent(response.content);

      toast({
        title: "Página gerada com sucesso!",
        description:
          "Revise o conteúdo e clique em 'Usar este conteúdo' para aplicar.",
      });
    } catch (error: any) {
      console.error("❌ AI - Erro:", error);
      toast({
        title: "Erro na geração",
        description:
          error.message ||
          "Não foi possível gerar o conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      setGeneratedContent("");
      toast({
        title: "Conteúdo aplicado!",
        description: "O conteúdo gerado foi aplicado com sucesso.",
      });
    }
  };

  const handleLoadDefault = () => {
    const defaultContent = DEFAULT_CONTENT[pageType];
    onContentGenerated(defaultContent);
    toast({
      title: "Conteúdo padrão carregado!",
      description: "O conteúdo padrão foi aplicado.",
    });
  };

  const handleClearStoreInfo = () => {
    setStoreInfo({
      name: "",
      industry: "",
      location: "",
      phone: "",
      email: "",
      description: "",
    });
    setIsPreloaded(false);
    toast({
      title: "Campos limpos!",
      description: "Agora você pode inserir as informações manualmente.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Geração Inteligente de Conteúdo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {getContentDescription(pageType)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={aiAccess.hasAccess ? "default" : "destructive"}>
                {aiAccess.hasAccess ? "IA Disponível" : "IA Limitada"}
              </Badge>
              {!aiAccess.hasAccess && (
                <span className="text-xs text-muted-foreground">
                  {aiAccess.message}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomization(!showCustomization)}
            >
              <Settings className="h-4 w-4 mr-1" />
              {showCustomization ? "Ocultar" : "Personalizar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personalização */}
      {showCustomization && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Informações da Loja
                  {isPreloaded && (
                    <Badge variant="secondary" className="text-xs">
                      Pré-carregado
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isPreloaded
                    ? "Informações carregadas automaticamente da sua loja. Você pode editá-las se necessário."
                    : "Personalize o conteúdo com informações específicas da sua loja"}
                </p>
              </div>
              {isPreloaded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearStoreInfo}
                  className="text-xs"
                >
                  Limpar Campos
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name" className="flex items-center gap-2">
                  Nome da Loja *
                  {isPreloaded && storeInfo.name && (
                    <Badge variant="outline" className="text-xs">
                      ✓ Carregado
                    </Badge>
                  )}
                </Label>
                <Input
                  id="store-name"
                  placeholder="Ex: Moda Bella"
                  value={storeInfo.name}
                  onChange={(e) =>
                    setStoreInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={
                    isPreloaded && storeInfo.name
                      ? "border-green-200 bg-green-50"
                      : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Setor/Nicho</Label>
                <Input
                  id="industry"
                  placeholder="Ex: Moda feminina, Eletrônicos, Casa e jardim"
                  value={storeInfo.industry}
                  onChange={(e) =>
                    setStoreInfo((prev) => ({
                      ...prev,
                      industry: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  placeholder="Ex: São Paulo, SP"
                  value={storeInfo.location}
                  onChange={(e) =>
                    setStoreInfo((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  Telefone
                  {isPreloaded && storeInfo.phone && (
                    <Badge variant="outline" className="text-xs">
                      ✓ Carregado
                    </Badge>
                  )}
                </Label>
                <Input
                  id="phone"
                  placeholder="Ex: (11) 99999-9999"
                  value={storeInfo.phone}
                  onChange={(e) =>
                    setStoreInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className={
                    isPreloaded && storeInfo.phone
                      ? "border-green-200 bg-green-50"
                      : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email
                  {isPreloaded && storeInfo.email && (
                    <Badge variant="outline" className="text-xs">
                      ✓ Carregado
                    </Badge>
                  )}
                </Label>
                <Input
                  id="email"
                  placeholder="Ex: contato@loja.com"
                  value={storeInfo.email}
                  onChange={(e) =>
                    setStoreInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={
                    isPreloaded && storeInfo.email
                      ? "border-green-200 bg-green-50"
                      : ""
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                Descrição da Loja (opcional)
                {isPreloaded && storeInfo.description && (
                  <Badge variant="outline" className="text-xs">
                    ✓ Carregado
                  </Badge>
                )}
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva brevemente sua loja, produtos ou diferenciais..."
                value={storeInfo.description}
                onChange={(e) =>
                  setStoreInfo((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className={
                  isPreloaded && storeInfo.description
                    ? "border-green-200 bg-green-50"
                    : ""
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !aiAccess.hasAccess}
                className="flex-1"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? "Gerando..." : "Gerar com IA"}
              </Button>

              <Button
                variant="outline"
                onClick={handleLoadDefault}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Usar Padrão
              </Button>
            </div>

            {/* Informações sobre IA */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">
                    💡 Como funciona a geração com IA:
                  </p>
                  <ul className="space-y-1">
                    <li>
                      • A IA cria conteúdo personalizado baseado nas informações
                      da sua loja
                    </li>
                    <li>• O conteúdo segue as leis brasileiras (LGPD, CDC)</li>
                    <li>• Você pode editar o resultado antes de salvar</li>
                    <li>
                      • O conteúdo é formatado em Markdown para melhor
                      apresentação
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Gerado */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Conteúdo Gerado
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Revise o conteúdo gerado antes de aplicar
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                {generatedContent.split("\n").map((line, index) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-xl font-bold mb-3 mt-4">
                        {line.slice(2)}
                      </h1>
                    );
                  } else if (line.startsWith("## ")) {
                    return (
                      <h2
                        key={index}
                        className="text-lg font-semibold mb-2 mt-3"
                      >
                        {line.slice(3)}
                      </h2>
                    );
                  } else if (line.startsWith("### ")) {
                    return (
                      <h3
                        key={index}
                        className="text-base font-medium mb-2 mt-2"
                      >
                        {line.slice(4)}
                      </h3>
                    );
                  } else if (line.startsWith("- ")) {
                    return (
                      <li key={index} className="ml-4 mb-1">
                        {line.slice(2)}
                      </li>
                    );
                  } else if (line.trim() === "") {
                    return <br key={index} />;
                  } else {
                    return (
                      <p key={index} className="mb-2 leading-relaxed">
                        {line}
                      </p>
                    );
                  }
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUseContent} className="flex-1">
                Usar este Conteúdo
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedContent("")}
                className="flex-1"
              >
                Descartar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIPageGenerator;
