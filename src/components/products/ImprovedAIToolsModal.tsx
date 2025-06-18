
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, FileText, Hash, Megaphone, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useToast } from '@/hooks/use-toast';

interface ImprovedAIToolsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
  category?: string;
  onDescriptionGenerated?: (description: string) => void;
  onTitleGenerated?: (title: string) => void;
  onKeywordsGenerated?: (keywords: string) => void;
  onAdCopyGenerated?: (adCopy: string) => void;
}

interface AIResult {
  content: string;
  loading: boolean;
  error?: string;
}

const ImprovedAIToolsModal: React.FC<ImprovedAIToolsModalProps> = ({
  open,
  onOpenChange,
  productName = '',
  category = '',
  onDescriptionGenerated,
  onTitleGenerated,
  onKeywordsGenerated,
  onAdCopyGenerated
}) => {
  const [activeTab, setActiveTab] = useState('description');
  const [productInfo, setProductInfo] = useState({
    name: productName,
    category: category,
    features: '',
    targetAudience: ''
  });

  const [results, setResults] = useState<Record<string, AIResult>>({
    description: { content: '', loading: false },
    title: { content: '', loading: false },
    keywords: { content: '', loading: false },
    adCopy: { content: '', loading: false }
  });

  const { checkAIUsage } = usePlanPermissions();
  const { toast } = useToast();
  const aiAccess = checkAIUsage();

  const generateContent = async (type: string) => {
    if (!aiAccess.hasAccess) {
      toast({
        title: "Acesso negado",
        description: aiAccess.message || "IA não disponível no seu plano",
        variant: "destructive",
      });
      return;
    }

    setResults(prev => ({
      ...prev,
      [type]: { ...prev[type], loading: true, error: undefined }
    }));

    try {
      // Simular chamada de IA (substituir pela implementação real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let generatedContent = '';
      
      switch (type) {
        case 'description':
          generatedContent = `${productInfo.name} é um produto de alta qualidade da categoria ${productInfo.category}. ${productInfo.features ? `Características principais: ${productInfo.features}.` : ''} Ideal para ${productInfo.targetAudience || 'diversos usos'}.`;
          break;
        case 'title':
          generatedContent = `${productInfo.name} - ${productInfo.category} Premium | Qualidade Superior`;
          break;
        case 'keywords':
          generatedContent = `${productInfo.name.toLowerCase()}, ${productInfo.category.toLowerCase()}, qualidade, premium, comprar`;
          break;
        case 'adCopy':
          generatedContent = `🌟 Descubra o ${productInfo.name}!\n\n✅ Qualidade superior\n✅ Categoria ${productInfo.category}\n✅ Entrega rápida\n\n💰 Preço especial por tempo limitado!\n\n🛒 Compre agora e aproveite!`;
          break;
      }

      setResults(prev => ({
        ...prev,
        [type]: { content: generatedContent, loading: false }
      }));

    } catch (error) {
      setResults(prev => ({
        ...prev,
        [type]: { 
          content: '', 
          loading: false, 
          error: 'Erro ao gerar conteúdo. Tente novamente.' 
        }
      }));
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o conteúdo",
        variant: "destructive",
      });
    }
  };

  const useGenerated = (type: string, content: string) => {
    switch (type) {
      case 'description':
        onDescriptionGenerated?.(content);
        break;
      case 'title':
        onTitleGenerated?.(content);
        break;
      case 'keywords':
        onKeywordsGenerated?.(content);
        break;
      case 'adCopy':
        onAdCopyGenerated?.(content);
        break;
    }
    
    toast({
      title: "Conteúdo aplicado!",
      description: "O conteúdo gerado foi aplicado ao formulário",
    });
  };

  const tools = [
    {
      id: 'description',
      title: 'Descrição do Produto',
      icon: FileText,
      description: 'Gere uma descrição detalhada e atrativa para o produto',
      color: 'bg-blue-500'
    },
    {
      id: 'title',
      title: 'Título SEO',
      icon: Hash,
      description: 'Crie um título otimizado para mecanismos de busca',
      color: 'bg-green-500'
    },
    {
      id: 'keywords',
      title: 'Palavras-chave',
      icon: Hash,
      description: 'Gere palavras-chave relevantes para SEO',
      color: 'bg-purple-500'
    },
    {
      id: 'adCopy',
      title: 'Texto de Anúncio',
      icon: Megaphone,
      description: 'Crie um texto persuasivo para anúncios e marketing',
      color: 'bg-orange-500'
    }
  ];

  if (!aiAccess.hasAccess && !aiAccess.loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Ferramentas de IA
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {aiAccess.message || 'Ferramentas de IA não disponíveis no seu plano'}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Ferramentas de IA para Produtos
          </DialogTitle>
          <p className="text-gray-600">
            Use inteligência artificial para criar conteúdo profissional para seus produtos
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Produto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Produto *</Label>
                  <Input
                    value={productInfo.name}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Camiseta Premium"
                  />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <Input
                    value={productInfo.category}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ex: Roupas"
                  />
                </div>
              </div>
              <div>
                <Label>Características Principais</Label>
                <Input
                  value={productInfo.features}
                  onChange={(e) => setProductInfo(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="Ex: 100% algodão, manga longa, várias cores"
                />
              </div>
              <div>
                <Label>Público-alvo</Label>
                <Input
                  value={productInfo.targetAudience}
                  onChange={(e) => setProductInfo(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="Ex: jovens, profissionais, esportistas"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ferramentas de IA */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <TabsTrigger key={tool.id} value={tool.id} className="flex items-center gap-2">
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tool.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tools.map((tool) => {
              const Icon = tool.icon;
              const result = results[tool.id];
              
              return (
                <TabsContent key={tool.id} value={tool.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className={`p-2 ${tool.color} rounded-lg`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        {tool.title}
                        <Badge variant="secondary">IA</Badge>
                      </CardTitle>
                      <p className="text-gray-600">{tool.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        onClick={() => generateContent(tool.id)}
                        disabled={result.loading || !productInfo.name || !productInfo.category}
                        className="w-full"
                      >
                        {result.loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gerando conteúdo...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Gerar {tool.title}
                          </>
                        )}
                      </Button>

                      {result.error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{result.error}</AlertDescription>
                        </Alert>
                      )}

                      {result.content && (
                        <div className="space-y-3">
                          <Label>Conteúdo Gerado:</Label>
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <Textarea
                              value={result.content}
                              onChange={(e) => setResults(prev => ({
                                ...prev,
                                [tool.id]: { ...prev[tool.id], content: e.target.value }
                              }))}
                              rows={6}
                              className="border-0 bg-transparent resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => copyToClipboard(result.content)}
                              className="flex-1"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copiar
                            </Button>
                            <Button
                              onClick={() => useGenerated(tool.id, result.content)}
                              className="flex-1"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Usar no Produto
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImprovedAIToolsModal;
