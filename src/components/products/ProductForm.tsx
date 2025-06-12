
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProductFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const ProductForm = ({ onSubmit, onCancel, initialData }: ProductFormProps) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price.toString()) : null
    };
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Produto</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div className="flex gap-2 pt-4">
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

export default ProductForm;
