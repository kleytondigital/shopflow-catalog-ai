
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';

interface ProductSEOFormProps {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  seoSlug?: string;
  onMetaTitleChange: (title: string) => void;
  onMetaDescriptionChange: (description: string) => void;
  onKeywordsChange: (keywords: string) => void;
  onSeoSlugChange: (slug: string) => void;
}

const ProductSEOForm: React.FC<ProductSEOFormProps> = ({
  metaTitle,
  metaDescription,
  keywords,
  seoSlug,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onKeywordsChange,
  onSeoSlugChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO e Otimização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="meta_title">Título SEO</Label>
          <Input
            id="meta_title"
            value={metaTitle || ''}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Título otimizado para mecanismos de busca"
          />
        </div>

        <div>
          <Label htmlFor="meta_description">Descrição SEO</Label>
          <Textarea
            id="meta_description"
            value={metaDescription || ''}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Descrição otimizada para mecanismos de busca"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="keywords">Palavras-chave</Label>
          <Input
            id="keywords"
            value={keywords || ''}
            onChange={(e) => onKeywordsChange(e.target.value)}
            placeholder="palavra1, palavra2, palavra3"
          />
        </div>

        <div>
          <Label htmlFor="seo_slug">URL Amigável</Label>
          <Input
            id="seo_slug"
            value={seoSlug || ''}
            onChange={(e) => onSeoSlugChange(e.target.value)}
            placeholder="url-amigavel-do-produto"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSEOForm;
