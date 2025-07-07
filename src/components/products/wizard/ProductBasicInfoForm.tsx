
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import CategoryFormDialog from '../CategoryFormDialog';
import { Package } from 'lucide-react';

interface ProductBasicInfoFormProps {
  name: string;
  description?: string;
  category?: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (category: string) => void;
}

const ProductBasicInfoForm: React.FC<ProductBasicInfoFormProps> = ({
  name,
  description,
  category,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
}) => {
  const { categories, fetchCategories } = useCategories();

  const handleCategoryCreated = async (newCategory: any) => {
    await fetchCategories();
    onCategoryChange(newCategory.name);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nome do produto"
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description || ''}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Descrição detalhada do produto"
            rows={4}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="category">Categoria</Label>
            <CategoryFormDialog onCategoryCreated={handleCategoryCreated} />
          </div>
          <Select value={category || ''} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductBasicInfoForm;
