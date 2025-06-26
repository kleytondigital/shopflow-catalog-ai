
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIContentGeneratorProps {
  productName: string;
  category?: string;
  onDescriptionGenerated: (description: string) => void;
  onTitleGenerated?: (title: string) => void;
  onKeywordsGenerated?: (keywords: string) => void;
  onAdCopyGenerated?: (adCopy: string) => void;
  disabled?: boolean;
  variant?: 'description' | 'seo' | 'title' | 'keywords' | 'ad-copy';
  size?: 'sm' | 'default' | 'lg';
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  productName,
  category = 'produto',
  onDescriptionGenerated,
  onTitleGenerated,
  onKeywordsGenerated,
  onAdCopyGenerated,
  disabled = false,
  variant = 'description',
  size = 'default'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateDescription = async () => {
    if (!productName?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do produto para gerar a descrição",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🤖 Gerando descrição para:', productName, 'categoria:', category);
      
      const { data, error } = await supabase.functions.invoke('ai-product-description', {
        body: { 
          productName: productName.trim(),
          category: category?.trim() || 'produto'
        }
      });

      console.log('🤖 Resposta da função:', { data, error });

      if (error) {
        console.error('❌ Erro na função:', error);
        throw new Error(error.message || 'Erro ao chamar função IA');
      }

      if (data?.description) {
        console.log('✅ Descrição gerada com sucesso:', data.description.length, 'caracteres');
        onDescriptionGenerated(data.description);
        toast({
          title: "Descrição gerada!",
          description: "A IA criou uma descrição otimizada para seu produto.",
        });
      } else {
        console.error('❌ Descrição não retornada:', data);
        throw new Error('Descrição não foi gerada pela IA');
      }
    } catch (error) {
      console.error('💥 Erro ao gerar descrição:', error);
      toast({
        title: "Erro ao gerar descrição",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSEO = async () => {
    if (!productName?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do produto para gerar SEO",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🔍 Gerando SEO para:', productName, 'categoria:', category);
      
      const { data, error } = await supabase.functions.invoke('ai-seo-generator', {
        body: { 
          productName: productName.trim(),
          category: category?.trim() || 'produto'
        }
      });

      console.log('🔍 Resposta da função SEO:', { data, error });

      if (error) {
        console.error('❌ Erro na função SEO:', error);
        throw new Error(error.message || 'Erro ao chamar função SEO');
      }

      if (data) {
        console.log('✅ SEO gerado com sucesso:', data);
        
        // Aplicar dados SEO usando os callbacks fornecidos
        if (data.metaTitle && onTitleGenerated) {
          onTitleGenerated(data.metaTitle);
        }
        
        if (data.metaDescription) {
          onDescriptionGenerated(data.metaDescription);
        }
        
        if (data.keywords && onKeywordsGenerated) {
          onKeywordsGenerated(data.keywords);
        }
        
        toast({
          title: "SEO gerado!",
          description: "A IA criou conteúdo SEO otimizado para seu produto.",
        });
      } else {
        console.error('❌ Dados SEO não retornados pela IA');
        throw new Error('Dados SEO não retornados pela IA');
      }
    } catch (error) {
      console.error('💥 Erro ao gerar SEO:', error);
      toast({
        title: "Erro ao gerar SEO",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (variant === 'seo') {
      generateSEO();
    } else {
      generateDescription();
    }
  };

  const getButtonText = () => {
    if (isGenerating) return 'Gerando...';
    
    switch (variant) {
      case 'seo':
        return 'Gerar SEO';
      case 'title':
        return 'Gerar Título';
      case 'keywords':
        return 'Gerar Palavras-chave';
      case 'ad-copy':
        return 'Gerar Anúncio';
      default:
        return 'Gerar com IA';
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={disabled || isGenerating || !productName?.trim()}
      variant="outline"
      size={size}
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {getButtonText()}
    </Button>
  );
};

export default AIContentGenerator;
