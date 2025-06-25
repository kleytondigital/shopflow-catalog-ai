
import React from 'react';
import ProductBasicInfoForm from './ProductBasicInfoForm';
import ProductPricingForm from './ProductPricingForm';
import ProductVariationsForm from './ProductVariationsForm';
import ImprovedDraftImageUpload from '../ImprovedDraftImageUpload';
import ProductSeoForm from './ProductSeoForm';
import ProductAdvancedForm from './ProductAdvancedForm';
import { ProductFormData } from '@/hooks/useProductFormWizard';

interface WizardStepContentProps {
  currentStep: number;
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  productId?: string;
}

const WizardStepContent: React.FC<WizardStepContentProps> = ({
  currentStep,
  formData,
  updateFormData,
  productId
}) => {
  switch (currentStep) {
    case 0:
      return (
        <ProductBasicInfoForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
    case 1:
      return (
        <ProductPricingForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
    case 2:
      return (
        <ProductVariationsForm
          variations={formData.variations || []}
          onVariationsChange={(variations) => updateFormData({ variations })}
        />
      );
    case 3:
      return (
        <ImprovedDraftImageUpload
          productId={productId}
        />
      );
    case 4:
      return (
        <ProductSeoForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
    case 5:
      return (
        <ProductAdvancedForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
    default:
      return null;
  }
};

export default WizardStepContent;
