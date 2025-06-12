
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductDescriptionAIProps {
  productName: string;
  category?: string;
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
}

const ProductDescriptionAI = ({ 
  productName, 
  category, 
  onDescriptionGenerated, 
  disabled 
}: ProductDescriptionAIProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateDescription = async () => {
    if (!productName.trim()) {
      toast({
        title: "Nome do produto obrigatório",
        description: "Por favor, insira o nome do produto antes de gerar a descrição",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-product-description', {
        body: {
          productName: productName.trim(),
          category: category || undefined
        }
      });

      if (error) throw error;

      if (data?.description) {
        onDescriptionGenerated(data.description);
        toast({
          title: "Descrição gerada",
          description: "A descrição foi gerada com sucesso pela IA"
        });
      } else {
        throw new Error('Descrição não retornada');
      }
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      toast({
        title: "Erro ao gerar descrição",
        description: "Verifique se a OpenAI API está configurada corretamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      type="button"
      variant="outline" 
      size="sm"
      onClick={generateDescription}
      disabled={disabled || loading || !productName.trim()}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {loading ? 'Gerando...' : 'Gerar com IA'}
    </Button>
  );
};

export default ProductDescriptionAI;
