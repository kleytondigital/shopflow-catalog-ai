
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCategories } from '@/hooks/useCategories';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { CreateProductData } from '@/hooks/useProducts';
import QuickCategoryForm from './QuickCategoryForm';
import ProductDescriptionAI from '@/components/ai/ProductDescriptionAI';
import { Plus, ArrowLeft } from 'lucide-react';

interface ProductFormAdvancedProps {
  onSubmit: (data: CreateProductData) => void;
  onCancel: () => void;
  initialData?: any;
}

const ProductFormAdvanced = ({ onSubmit, onCancel, initialData }: ProductFormAdvancedProps) => {
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    retail_price: initialData?.retail_price || 0,
    wholesale_price: initialData?.wholesale_price || '',
    stock: initialData?.stock || 0,
    min_wholesale_qty: initialData?.min_wholesale_qty || 1,
    is_active: initialData?.is_active ?? true
  });

  const { categories, loading: categoriesLoading } = useCategories();
  const { settings } = useStoreSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: CreateProductData = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category || undefined,
      retail_price: formData.retail_price,
      wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price.toString()) : undefined,
      stock: formData.stock,
      min_wholesale_qty: formData.min_wholesale_qty || undefined,
      is_active: formData.is_active,
      store_id: ''
    };
    onSubmit(productData);
  };

  const handleCategoryCreated = (category: any) => {
    setFormData({ ...formData, category: category.name });
    setShowQuickCategory(false);
  };

  const handleDescriptionGenerated = (description: string) => {
    setFormData({ ...formData, description });
  };

  const showRetailFields = settings?.retail_catalog_active !== false;
  const showWholesaleFields = settings?.wholesale_catalog_active === true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">
          {initialData ? 'Editar Produto' : 'Novo Produto'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Camiseta Premium Cotton"
                required
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="description">Descrição</Label>
                <ProductDescriptionAI
                  productName={formData.name}
                  category={formData.category}
                  onDescriptionGenerated={handleDescriptionGenerated}
                  disabled={!formData.name.trim()}
                />
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada do produto..."
                rows={4}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="category">Categoria</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickCategory(!showQuickCategory)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </Button>
              </div>

              {showQuickCategory && (
                <div className="mb-4">
                  <QuickCategoryForm
                    onCategoryCreated={handleCategoryCreated}
                    onCancel={() => setShowQuickCategory(false)}
                  />
                </div>
              )}

              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Preços e Estoque */}
        <Card>
          <CardHeader>
            <CardTitle>Preços e Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showRetailFields && (
                <div>
                  <Label htmlFor="retail_price">Preço Varejo (R$)</Label>
                  <Input
                    id="retail_price"
                    type="number"
                    step="0.01"
                    value={formData.retail_price}
                    onChange={(e) => setFormData({ ...formData, retail_price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              )}

              {showWholesaleFields && (
                <div>
                  <Label htmlFor="wholesale_price">Preço Atacado (R$)</Label>
                  <Input
                    id="wholesale_price"
                    type="number"
                    step="0.01"
                    value={formData.wholesale_price}
                    onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              {showWholesaleFields && (
                <div>
                  <Label htmlFor="min_wholesale_qty">Qtd. Mín. Atacado</Label>
                  <Input
                    id="min_wholesale_qty"
                    type="number"
                    value={formData.min_wholesale_qty}
                    onChange={(e) => setFormData({ ...formData, min_wholesale_qty: parseInt(e.target.value) || 1 })}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {initialData ? 'Atualizar' : 'Criar'} Produto
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormAdvanced;
