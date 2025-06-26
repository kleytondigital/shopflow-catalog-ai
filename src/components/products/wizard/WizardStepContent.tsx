
import React from 'react';
import ProductBasicInfoForm from './ProductBasicInfoForm';
import ProductPricingForm from './ProductPricingForm';
import ProductVariationsForm from './ProductVariationsForm';
import SimpleImageUpload from '../SimpleImageUpload';
import ProductSeoForm from './ProductSeoForm';
import ProductAdvancedForm from './ProductAdvancedForm';
import { ProductFormData } from '@/hooks/useImprovedProductFormWizard';

interface WizardStepContentProps {
  currentStep: number;
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  productId?: string;
  onImageUploadReady?: (uploadFn: (productId: string) => Promise<string[]>) => void;
}

const WizardStepContent: React.FC<WizardStepContentProps> = ({
  currentStep,
  formData,
  updateFormData,
  productId,
  onImageUploadReady
}) => {
  switch (currentStep) {
    case 0: // Informações Básicas
      return (
        <ProductBasicInfoForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
      
    case 1: // Preços e Estoque
      return (
        <ProductPricingForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
      
    case 2: // Imagens
      return (
        <SimpleImageUpload
          productId={productId}
          onUploadReady={onImageUploadReady}
        />
      );
      
    case 3: // Variações
      return (
        <ProductVariationsForm
          variations={formData.variations || []}
          onVariationsChange={(variations) => updateFormData({ variations })}
        />
      );
      
    case 4: // SEO
      return (
        <ProductSeoForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
      
    case 5: // Avançado
      return (
        <ProductAdvancedForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
      
    default:
      return (
        <div className="text-center p-8">
          <p className="text-red-500">Step inválido: {currentStep}</p>
        </div>
      );
  }
};

export default WizardStepContent;
