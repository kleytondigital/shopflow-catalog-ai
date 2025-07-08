
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompleteSEOGeneratorProps {
  productName: string;
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  seoSlug?: string;
  onMetaTitleChange: (title: string) => void;
  onMetaDescriptionChange: (description: string) => void;
  onKeywordsChange: (keywords: string) => void;
  onSeoSlugChange: (slug: string) => void;
}

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  slug: string;
}

const CompleteSEOGenerator: React.FC<CompleteSEOGeneratorProps> = ({
  productName,
  category,
  metaTitle,
  metaDescription,
  keywords,
  seoSlug,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onKeywordsChange,
  onSeoSlugChange,
}) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateSlugFromName = () => {
    if (!productName?.trim()) return;
    
    const slug = productName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    onSeoSlugChange(slug);
  };

  const generateBasicKeywords = () => {
    if (!productName?.trim()) return;
    
    const words = productName.toLowerCase().split(' ');
    const categoryWords = category ? category.toLowerCase().split(' ') : [];
    const allWords = [...words, ...categoryWords];
    const uniqueWords = [...new Set(allWords)].filter(word => word.length > 2);
    
    onKeywordsChange(uniqueWords.join(', '));
  };

  const generateCompleteSEO = async () => {
    if (!productName?.trim()) {
      toast({
        title: "Nome do produto necessário",
        description: "Informe o nome do produto para gerar o SEO completo",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      // Simulação da geração com IA - substitua pela integração real
      const prompt = `Gere SEO completo para o produto "${productName}"${category ? ` da categoria "${category}"` : ''}:
      
      1. Título SEO (máximo 60 caracteres)
      2. Meta descrição (máximo 160 caracteres)
      3. Palavras-chave (separadas por vírgula)
      4. URL amigável (slug)`;

      // Aqui você faria a chamada real para a IA
      // Por enquanto, vamos gerar dados básicos inteligentes
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay da API

      const generatedSEO: SEOData = {
        title: `${productName}${category ? ` - ${category}` : ''} | Compre Online`,
        description: `${productName}${category ? ` da categoria ${category}` : ''}. Qualidade garantida, entrega rápida e melhor preço. Compre agora!`,
        keywords: generateSmartKeywords(productName, category),
        slug: generateSmartSlug(productName)
      };

      // Aplicar os dados gerados
      onMetaTitleChange(generatedSEO.title);
      onMetaDescriptionChange(generatedSEO.description);
      onKeywordsChange(generatedSEO.keywords);
      onSeoSlugChange(generatedSEO.slug);

      toast({
        title: "SEO gerado com sucesso!",
        description: "Todos os campos de SEO foram preenchidos automaticamente",
      });

    } catch (error) {
      console.error('Erro ao gerar SEO:', error);
      toast({
        title: "Erro ao gerar SEO",
        description: "Ocorreu um erro ao gerar o SEO automaticamente",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateSmartKeywords = (name: string, cat?: string): string => {
    const words = name.toLowerCase().split(' ');
    const categoryWords = cat ? cat.toLowerCase().split(' ') : [];
    const baseWords = [...words, ...categoryWords];
    
    // Adiciona palavras-chave relacionadas inteligentes
    const smartKeywords = [
      ...baseWords,
      'comprar',
      'online',
      'melhor preço',
      'qualidade',
      'entrega rápida'
    ];
    
    return [...new Set(smartKeywords)]
      .filter(word => word.length > 2)
      .join(', ');
  };

  const generateSmartSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Inteligente
          </CardTitle>
          
          <Button
            onClick={generateCompleteSEO}
            disabled={generating || !productName?.trim()}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? 'Gerando...' : 'Gerar SEO Completo'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="meta_title">Título SEO</Label>
            <span className="text-xs text-muted-foreground">
              {(metaTitle || '').length}/60
            </span>
          </div>
          <Input
            id="meta_title"
            value={metaTitle || ''}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Título otimizado para mecanismos de busca"
            maxLength={60}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="meta_description">Descrição SEO</Label>
            <span className="text-xs text-muted-foreground">
              {(metaDescription || '').length}/160
            </span>
          </div>
          <Textarea
            id="meta_description"
            value={metaDescription || ''}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Descrição otimizada para mecanismos de busca"
            rows={3}
            maxLength={160}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="keywords">Palavras-chave</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateBasicKeywords}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Gerar Básicas
            </Button>
          </div>
          <Input
            id="keywords"
            value={keywords || ''}
            onChange={(e) => onKeywordsChange(e.target.value)}
            placeholder="palavra1, palavra2, palavra3"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="seo_slug">URL Amigável</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateSlugFromName}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Gerar do Nome
            </Button>
          </div>
          <Input
            id="seo_slug"
            value={seoSlug || ''}
            onChange={(e) => onSeoSlugChange(e.target.value)}
            placeholder="url-amigavel-do-produto"
          />
        </div>

        {/* Preview do SEO */}
        {(metaTitle || metaDescription) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Preview nos Resultados de Busca:</h4>
            <div className="bg-white p-3 rounded border">
              <div className="text-blue-600 text-lg leading-tight">
                {metaTitle || productName}
              </div>
              <div className="text-green-700 text-sm">
                www.minhaloja.com/{seoSlug || 'produto'}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {metaDescription || 'Descrição do produto...'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompleteSEOGenerator;
