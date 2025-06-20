
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import ProductBasicInfoForm from './wizard/ProductBasicInfoForm';
import ProductPricingForm from './wizard/ProductPricingForm';
import ProductImagesForm from './wizard/ProductImagesForm';
import ProductVariationsForm from './wizard/ProductVariationsForm';
import ProductAdvancedForm from './wizard/ProductAdvancedForm';
import { useAuth } from '@/hooks/useAuth';
import { useDraftImages } from '@/hooks/useDraftImages';
import { ProductVariation } from './ProductVariationsManager';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  retail_price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  wholesale_price: z.number().optional(),
  stock: z.number().min(0, 'Estoque não pode ser negativo'),
  min_wholesale_qty: z.number().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  keywords: z.string().optional(),
  seo_slug: z.string().optional(),
  image_url: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormWizardProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  mode: 'create' | 'edit';
}

const steps = [
  { id: 1, name: 'Informações Básicas', icon: '📝', component: ProductBasicInfoForm },
  { id: 2, name: 'Preços e Estoque', icon: '💰', component: ProductPricingForm },
  { id: 3, name: 'Imagens', icon: '📸', component: ProductImagesForm },
  { id: 4, name: 'Variações', icon: '🎨', component: ProductVariationsForm },
  { id: 5, name: 'SEO e Avançado', icon: '🚀', component: ProductAdvancedForm },
];

// Função para gerar slug a partir do nome
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const ProductFormWizard = ({ onSubmit, initialData, mode }: ProductFormWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
  const { profile } = useAuth();
  const { draftImages, uploadDraftImages, clearDraftImages } = useDraftImages();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      retail_price: 0,
      wholesale_price: 0,
      stock: 0,
      min_wholesale_qty: 1,
      is_active: true,
      is_featured: false,
      meta_title: '',
      meta_description: '',
      keywords: '',
      seo_slug: '',
      image_url: '',
    },
  });

  // Carregar dados iniciais quando em modo edição
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      console.log('ProductFormWizard - Carregando dados iniciais:', initialData);
      
      const formData = {
        id: initialData.id,
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || '',
        retail_price: Number(initialData.retail_price) || 0,
        wholesale_price: initialData.wholesale_price ? Number(initialData.wholesale_price) : undefined,
        stock: Number(initialData.stock) || 0,
        min_wholesale_qty: Number(initialData.min_wholesale_qty) || 1,
        is_active: initialData.is_active ?? true,
        is_featured: initialData.is_featured ?? false,
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || '',
        keywords: initialData.keywords || '',
        seo_slug: initialData.seo_slug || '',
        image_url: initialData.image_url || '',
      };
      
      // Carregar variações se existirem
      if (initialData.variations) {
        setVariations(initialData.variations);
      }
      
      console.log('ProductFormWizard - Dados processados:', formData);
      form.reset(formData);
    }
  }, [initialData, mode, form]);

  // Gerar slug automaticamente quando o nome mudar (apenas no modo criação)
  const watchedName = form.watch('name');
  useEffect(() => {
    if (mode === 'create' && watchedName && watchedName.trim()) {
      const slug = generateSlug(watchedName);
      form.setValue('seo_slug', slug);
    }
  }, [watchedName, mode, form]);

  const progress = (currentStep / steps.length) * 100;

  const validateCurrentStep = (): boolean => {
    const values = form.getValues();
    
    switch (currentStep) {
      case 1:
        return !!(values.name?.trim() && values.category?.trim());
      case 2:
        return values.retail_price > 0 && values.stock >= 0;
      case 3:
        return true; // Imagens são opcionais
      case 4:
        return true; // Variações são opcionais
      case 5:
        return true; // Configurações avançadas são opcionais
      default:
        return true;
    }
  };

  const canProceedToNext = (): boolean => {
    return validateCurrentStep();
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    if (!profile?.store_id) {
      console.error('Store ID não encontrado');
      return;
    }

    setIsSubmitting(true);

    try {
      // Fazer upload das imagens draft se houver
      let imageUrl = data.image_url;
      
      if (draftImages.length > 0) {
        console.log('Fazendo upload das imagens draft...');
        const uploadResult = await uploadDraftImages();
        if (uploadResult.success && uploadResult.urls.length > 0) {
          imageUrl = uploadResult.urls[0];
          console.log('Upload concluído, URL principal:', imageUrl);
        }
      }

      const productData = {
        ...data,
        store_id: profile.store_id,
        image_url: imageUrl,
        variations: variations.length > 0 ? variations : undefined,
        wholesale_price: data.wholesale_price || null,
        min_wholesale_qty: data.min_wholesale_qty || 1,
        retail_price: Number(data.retail_price),
        stock: Number(data.stock),
      };

      console.log('Submetendo dados do produto:', productData);
      await onSubmit(productData);
      
      // Limpar dados apenas em caso de sucesso
      if (mode === 'create') {
        clearDraftImages();
        setVariations([]);
      }
      
    } catch (error) {
      console.error('Erro ao submeter produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ProductBasicInfoForm form={form} />;
      case 2:
        return <ProductPricingForm form={form} />;
      case 3:
        return (
          <ProductImagesForm 
            form={form} 
            initialData={initialData}
            mode={mode}
          />
        );
      case 4:
        return (
          <ProductVariationsForm 
            form={form}
            variations={variations}
            onVariationsChange={setVariations}
          />
        );
      case 5:
        return <ProductAdvancedForm form={form} />;
      default:
        return null;
    }
  };

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="h-full flex flex-col">
      {/* Header com Progress */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{currentStepData?.icon}</div>
            <div>
              <h3 className="text-lg font-semibold">{currentStepData?.name}</h3>
              <p className="text-sm text-muted-foreground">
                Passo {currentStep} de {steps.length}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{Math.round(progress)}%</div>
            <div className="text-xs text-muted-foreground">Concluído</div>
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        {/* Steps Navigation */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center shrink-0">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200
                    ${step.id === currentStep
                      ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                      : step.id < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div 
                    className={`
                      w-8 h-0.5 mx-1 transition-colors
                      ${step.id < currentStep ? 'bg-green-500' : 'bg-border'}
                    `} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-hidden">
        <Form {...form}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto px-1">
              <div className="pb-6">
                {renderCurrentStep()}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="shrink-0 pt-6 border-t bg-background/95 backdrop-blur">
              <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="min-w-[100px]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex gap-2">
                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceedToNext()}
                      className="min-w-[100px]"
                    >
                      Próximo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleSubmit(form.getValues())}
                      disabled={isSubmitting}
                      className="min-w-[120px] bg-green-600 hover:bg-green-700"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Salvando...' : mode === 'edit' ? 'Atualizar' : 'Criar Produto'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProductFormWizard;
