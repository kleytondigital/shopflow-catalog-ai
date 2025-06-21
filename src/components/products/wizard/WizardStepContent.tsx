
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import ProductBasicInfoForm from './ProductBasicInfoForm';
import ProductPricingForm from './ProductPricingForm';
import ProductImagesForm from './ProductImagesForm';
import ProductVariationsForm from './ProductVariationsForm';
import ProductSeoForm from './ProductSeoForm';
import { ProductVariation } from '@/components/products/ProductVariationsManager';

interface WizardStepContentProps {
  currentStep: number;
  form: UseFormReturn<any>;
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  initialData?: any;
  mode: 'create' | 'edit';
}

const WizardStepContent: React.FC<WizardStepContentProps> = ({
  currentStep,
  form,
  variations,
  onVariationsChange,
  initialData,
  mode
}) => {
  // Log para debug do fluxo de props
  console.log('🔀 WizardStepContent - Props recebidas:', {
    currentStep,
    variationsLength: variations.length,
    mode,
    timestamp: new Date().toISOString()
  });

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
      console.log('🎨 Renderizando step 4 - ProductVariationsForm com:', {
        variations: variations.length,
        onVariationsChange: !!onVariationsChange
      });
      return (
        <ProductVariationsForm 
          form={form}
          variations={variations}
          onVariationsChange={onVariationsChange}
        />
      );
    case 5:
      return <ProductSeoForm form={form} />;
    default:
      return null;
  }
};

export default WizardStepContent;
