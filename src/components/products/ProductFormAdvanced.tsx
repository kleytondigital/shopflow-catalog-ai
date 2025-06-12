
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateProductData } from '@/hooks/useProducts';
import ProductImageUpload from './ProductImageUpload';
import ProductVariationsForm from './ProductVariationsForm';
import { useToast } from '@/hooks/use-toast';

interface ProductFormAdvancedProps {
  onSubmit: (data: CreateProductData, variations: any[], images: string[]) => void;
  onCancel: () => void;
  initialData?: any;
}

const ProductFormAdvanced = ({ onSubmit, onCancel, initialData }: ProductFormAdvancedProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    retail_price: initialData?.retail_price || 0,
    wholesale_price: initialData?.wholesale_price || '',
    stock: initialData?.stock || 0,
    min_wholesale_qty: initialData?.min_wholesale_qty || 1,
    is_active: initialData?.is_active ?? true,
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    keywords: initialData?.keywords || '',
    seo_slug: initialData?.seo_slug || ''
  });

  const [images, setImages] = useState<string[]>([]);
  const [variations, setVariations] = useState<any[]>([]);
  const { toast } = useToast();

  const handleImageUpload = async (file: File, order: number) => {
    // Simular upload por enquanto - você implementará com Supabase Storage
    const imageUrl = URL.createObjectURL(file);
    setImages(prev => [...prev, imageUrl]);
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos uma imagem do produto",
        variant: "destructive",
      });
      return;
    }

    const productData: CreateProductData = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category || undefined,
      retail_price: formData.retail_price,
      wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price.toString()) : undefined,
      stock: formData.stock,
      min_wholesale_qty: formData.min_wholesale_qty || undefined,
      is_active: formData.is_active,
      store_id: '' // Será preenchido pelo componente pai
    };

    onSubmit(productData, variations, images);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="images">Imagens</TabsTrigger>
          <TabsTrigger value="variations">Variações</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome do produto"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o produto..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ex: Roupas, Eletrônicos, Casa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retail_price">Preço Varejo (R$) *</Label>
              <Input
                id="retail_price"
                type="number"
                step="0.01"
                value={formData.retail_price}
                onChange={(e) => setFormData({ ...formData, retail_price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="wholesale_price">Preço Atacado (R$)</Label>
              <Input
                id="wholesale_price"
                type="number"
                step="0.01"
                value={formData.wholesale_price}
                onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Estoque *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="min_wholesale_qty">Qtd. Mín. Atacado</Label>
              <Input
                id="min_wholesale_qty"
                type="number"
                value={formData.min_wholesale_qty}
                onChange={(e) => setFormData({ ...formData, min_wholesale_qty: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images">
          <ProductImageUpload
            onImageUpload={handleImageUpload}
            images={images}
            onImageRemove={handleImageRemove}
            maxImages={3}
          />
        </TabsContent>

        <TabsContent value="variations">
          <ProductVariationsForm
            variations={variations}
            onVariationsChange={setVariations}
          />
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div>
            <Label htmlFor="meta_title">Título SEO</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="Título para mecanismos de busca"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.meta_title.length}/60 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="meta_description">Descrição SEO</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              placeholder="Descrição para mecanismos de busca"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.meta_description.length}/160 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="keywords">Palavras-chave</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="palavra1, palavra2, palavra3"
            />
          </div>

          <div>
            <Label htmlFor="seo_slug">URL Amigável</Label>
            <Input
              id="seo_slug"
              value={formData.seo_slug}
              onChange={(e) => setFormData({ ...formData, seo_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="produto-exemplo"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" className="flex-1">
          {initialData ? 'Atualizar' : 'Criar'} Produto
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default ProductFormAdvanced;
