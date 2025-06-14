
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';
import ProductBasicInfoForm from './wizard/ProductBasicInfoForm';
import ProductPricingForm from './wizard/ProductPricingForm';
import ProductImagesForm from './wizard/ProductImagesForm';
import ProductVariationsForm from './ProductVariationsForm';
import ProductAdvancedForm from './wizard/ProductAdvancedForm';
import { CreateProductData, UpdateProductData } from '@/hooks/useProducts';
import { useDraftImages } from '@/hooks/useDraftImages';

const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(255, 'Nome muito longo'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  retail_price: z.number().min(0.01, 'Preço de varejo deve ser maior que zero'),
  wholesale_price: z.number().min(0, 'Preço de atacado deve ser maior ou igual a zero').optional(),
  stock: z.number().min(0, 'Estoque deve ser maior ou igual a zero'),
  min_wholesale_qty: z.number().min(1, 'Quantidade mínima deve ser pelo menos 1').optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  meta_title: z.string().max(60, 'Título meta deve ter no máximo 60 caracteres').optional(),
  meta_description: z.string().max(160, 'Descrição meta deve ter no máximo 160 caracteres').optional(),
  keywords: z.string().optional(),
  seo_slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormWizardProps {
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const ProductFormWizard = ({ onSubmit, initialData, mode = 'create' }: ProductFormWizardProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const [variations, setVariations] = useState<any[]>(initialData?.variations || []);
  const { draftImages, addDraftImage, removeDraftImage, uploadDraftImages, clearDraftImages } = useDraftImages();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      retail_price: initialData?.retail_price || 0,
      wholesale_price: initialData?.wholesale_price || 0,
      stock: initialData?.stock || 0,
      min_wholesale_qty: initialData?.min_wholesale_qty || 1,
      is_active: initialData?.is_active ?? true,
      is_featured: initialData?.is_featured ?? false,
      meta_title: initialData?.meta_title || '',
      meta_description: initialData?.meta_description || '',
      keywords: initialData?.keywords || '',
      seo_slug: initialData?.seo_slug || '',
    },
  });

  const tabs = [
    { id: 'basic', label: 'Básico', icon: '1' },
    { id: 'pricing', label: 'Preços', icon: '2' },
    { id: 'images', label: 'Imagens', icon: '3' },
    { id: 'variations', label: 'Variações', icon: '4' },
    { id: 'advanced', label: 'Avançado', icon: '5' },
  ];

  const markTabCompleted = useCallback((tabId: string) => {
    setCompletedTabs(prev => prev.includes(tabId) ? prev : [...prev, tabId]);
  }, []);

  const isTabCompleted = (tabId: string) => completedTabs.includes(tabId);

  const getTabValidationErrors = (tabId: string) => {
    const errors = form.formState.errors;
    switch (tabId) {
      case 'basic':
        return [errors.name, errors.category].filter(Boolean);
      case 'pricing':
        return [errors.retail_price, errors.wholesale_price, errors.stock, errors.min_wholesale_qty].filter(Boolean);
      case 'images':
        return draftImages.length === 0 ? ['Adicione pelo menos uma imagem'] : [];
      case 'advanced':
        return [errors.meta_title, errors.meta_description, errors.seo_slug].filter(Boolean);
      default:
        return [];
    }
  };

  const canProceedToNext = (currentTab: string) => {
    const tabErrors = getTabValidationErrors(currentTab);
    
    switch (currentTab) {
      case 'basic':
        const name = form.getValues('name');
        const category = form.getValues('category');
        return name && name.length >= 3 && category && tabErrors.length === 0;
      case 'pricing':
        const retailPrice = form.getValues('retail_price');
        return retailPrice > 0 && tabErrors.length === 0;
      case 'images':
        return draftImages.length > 0;
      case 'variations':
        return true; // Variações são opcionais
      case 'advanced':
        return tabErrors.length === 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1 && canProceedToNext(activeTab)) {
      markTabCompleted(activeTab);
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Validar dados críticos antes do envio
      if (!data.name || data.name.length < 3) {
        throw new Error('Nome do produto é obrigatório e deve ter pelo menos 3 caracteres');
      }
      
      if (!data.category) {
        throw new Error('Categoria é obrigatória');
      }
      
      if (data.retail_price <= 0) {
        throw new Error('Preço de varejo deve ser maior que zero');
      }
      
      if (draftImages.length === 0) {
        throw new Error('Adicione pelo menos uma imagem do produto');
      }

      // Upload das imagens primeiro
      const uploadResult = await uploadDraftImages();
      
      const productData = {
        ...data,
        image_url: uploadResult.urls[0] || null,
        store_id: initialData?.store_id || '',
        ...(mode === 'edit' && { id: initialData.id }),
      };

      await onSubmit(productData);
      clearDraftImages();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      throw error;
    }
  };

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const isLastTab = currentTabIndex === tabs.length - 1;
  const currentTabErrors = getTabValidationErrors(activeTab);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {mode === 'edit' ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <div className="flex gap-2">
              {tabs.map((tab, index) => {
                const hasErrors = getTabValidationErrors(tab.id).length > 0;
                return (
                  <Badge
                    key={tab.id}
                    variant={
                      activeTab === tab.id 
                        ? 'default' 
                        : isTabCompleted(tab.id) 
                          ? 'secondary' 
                          : hasErrors 
                            ? 'destructive'
                            : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {isTabCompleted(tab.id) && <Check className="w-3 h-3 mr-1" />}
                    {hasErrors && <AlertCircle className="w-3 h-3 mr-1" />}
                    {tab.icon}. {tab.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {tabs.map(tab => {
                const hasErrors = getTabValidationErrors(tab.id).length > 0;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="text-sm">
                    {isTabCompleted(tab.id) && <Check className="w-4 h-4 mr-1" />}
                    {hasErrors && <AlertCircle className="w-4 h-4 mr-1 text-destructive" />}
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductBasicInfoForm form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preços e Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductPricingForm form={form} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Imagens do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductImagesForm
                    draftImages={draftImages}
                    onImageAdd={addDraftImage}
                    onImageRemove={removeDraftImage}
                  />
                  {draftImages.length === 0 && (
                    <p className="text-sm text-destructive mt-2">
                      * Adicione pelo menos uma imagem do produto
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Variações do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductVariationsForm
                    variations={variations}
                    onVariationsChange={setVariations}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Avançadas e SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductAdvancedForm form={form} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentTabIndex === 0}
            >
              Anterior
            </Button>

            <div className="flex flex-col items-center gap-2">
              {currentTabErrors.length > 0 && (
                <div className="flex items-center text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {currentTabErrors.length} erro{currentTabErrors.length > 1 ? 's' : ''} encontrado{currentTabErrors.length > 1 ? 's' : ''}
                </div>
              )}
              {!canProceedToNext(activeTab) && currentTabErrors.length === 0 && (
                <div className="flex items-center text-amber-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Complete os campos obrigatórios
                </div>
              )}
            </div>

            {isLastTab ? (
              <Button type="submit" disabled={!canProceedToNext(activeTab)}>
                {mode === 'edit' ? 'Atualizar Produto' : 'Criar Produto'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceedToNext(activeTab)}
              >
                Próximo
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductFormWizard;
