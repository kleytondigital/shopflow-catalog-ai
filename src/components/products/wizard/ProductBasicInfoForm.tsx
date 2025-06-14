
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import SimpleCategoryDialog from '@/components/products/SimpleCategoryDialog';
import AIContentGenerator from '@/components/ai/AIContentGenerator';

interface ProductBasicInfoFormProps {
  form: UseFormReturn<any>;
}

const ProductBasicInfoForm = ({ form }: ProductBasicInfoFormProps) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const productName = form.watch('name');
  const selectedCategory = form.watch('category');

  const handleCategoryCreated = (newCategory: any) => {
    form.setValue('category', newCategory.name);
    setShowCategoryDialog(false);
  };

  const handleDescriptionGenerated = (description: string) => {
    form.setValue('description', description);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Nome do Produto *</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome do produto" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria *</FormLabel>
            <div className="flex gap-2">
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="" disabled>Carregando...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="" disabled>Nenhuma categoria encontrada</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowCategoryDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="seo_slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug (URL amigável)</FormLabel>
            <FormControl>
              <Input placeholder="produto-exemplo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Descrição</FormLabel>
              <AIContentGenerator
                productName={productName}
                category={selectedCategory}
                onDescriptionGenerated={handleDescriptionGenerated}
                disabled={!productName?.trim()}
                variant="description"
                size="sm"
              />
            </div>
            <FormControl>
              <Textarea
                placeholder="Descreva detalhadamente o produto..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <SimpleCategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
};

export default ProductBasicInfoForm;
