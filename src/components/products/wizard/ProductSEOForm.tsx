
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Tag, FileText } from "lucide-react";

interface ProductSEOFormProps {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  seoSlug?: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onKeywordsChange: (value: string) => void;
  onSeoSlugChange: (value: string) => void;
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
        <div className="space-y-2">
          <Label htmlFor="meta-title">Título SEO</Label>
          <Input
            id="meta-title"
            value={metaTitle || ""}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Título otimizado para motores de busca"
            maxLength={60}
          />
          <p className="text-sm text-gray-500">
            Máximo 60 caracteres. Aparece nos resultados de busca.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta-description">Descrição SEO</Label>
          <Textarea
            id="meta-description"
            value={metaDescription || ""}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Descrição que aparece nos resultados de busca"
            maxLength={160}
            rows={3}
          />
          <p className="text-sm text-gray-500">
            Máximo 160 caracteres. Descrição que aparece no Google.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Palavras-chave
          </Label>
          <Input
            id="keywords"
            value={keywords || ""}
            onChange={(e) => onKeywordsChange(e.target.value)}
            placeholder="palavra1, palavra2, palavra3"
          />
          <p className="text-sm text-gray-500">
            Separe as palavras-chave com vírgulas.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-slug" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            URL Amigável (Slug)
          </Label>
          <Input
            id="seo-slug"
            value={seoSlug || ""}
            onChange={(e) => onSeoSlugChange(e.target.value)}
            placeholder="produto-exemplo-url-amigavel"
          />
          <p className="text-sm text-gray-500">
            URL personalizada para o produto (opcional).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSEOForm;
