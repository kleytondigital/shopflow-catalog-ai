
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductSeoFormProps {
  form: UseFormReturn<any>;
}

const ProductSeoForm = ({ form }: ProductSeoFormProps) => {
  const productName = form.watch('name');
  const category = form.watch('category');
  const description = form.watch('description');

  const generateSeoData = async () => {
    if (!productName) return;

    try {
      // Aqui você pode integrar com a função de IA para gerar SEO
      console.log('Gerando dados SEO para:', { productName, category, description });
      
      // Por enquanto, vamos gerar dados básicos
      const slug = productName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      form.setValue('seo_slug', slug);
      
      if (!form.getValues('meta_title')) {
        form.setValue('meta_title', `${productName}${category ? ` - ${category}` : ''} | Comprar Online`);
      }
      
      if (!form.getValues('meta_description')) {
        const desc = description ? description.substring(0, 150) : `Compre ${productName} com o melhor preço e qualidade. Entrega rápida e segura.`;
        form.setValue('meta_description', desc);
      }
      
    } catch (error) {
      console.error('Erro ao gerar dados SEO:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Otimização para Mecanismos de Busca</h3>
        <p className="text-sm text-muted-foreground">
          Configure como seu produto aparecerá nos resultados de busca do Google e outros mecanismos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Dados SEO</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateSeoData}
              disabled={!productName}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Gerar com IA
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="seo_slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Amigável (Slug)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="produto-exemplo"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Como o produto aparecerá na URL (sem espaços ou caracteres especiais)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título SEO</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Título otimizado para SEO (máx. 60 caracteres)"
                    maxLength={60}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Aparece como título azul nos resultados do Google
                  {field.value && ` (${field.value.length}/60 caracteres)`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição SEO</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrição que aparece nos resultados de busca (máx. 160 caracteres)"
                    maxLength={160}
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Resumo que aparece nos resultados do Google
                  {field.value && ` (${field.value.length}/160 caracteres)`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Palavras-chave</FormLabel>
                <FormControl>
                  <Input
                    placeholder="palavra1, palavra2, palavra3"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Palavras relacionadas ao produto, separadas por vírgula
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Preview de como aparecerá no Google */}
      {(form.watch('meta_title') || form.watch('meta_description')) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview no Google</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="space-y-1">
                <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                  {form.watch('meta_title') || productName || 'Título do produto'}
                </div>
                <div className="text-green-700 text-sm">
                  loja.com/produto/{form.watch('seo_slug') || 'produto-exemplo'}
                </div>
                <div className="text-gray-600 text-sm">
                  {form.watch('meta_description') || 'Descrição do produto que aparecerá nos resultados de busca...'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductSeoForm;
