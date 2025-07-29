import React from "react";
import { WizardFormData } from "@/hooks/useImprovedProductFormWizard";
import BasicInfoStep from "./steps/BasicInfoStep";
import PricingStep from "./steps/PricingStep";
import ImagesStep from "./steps/ImagesStep";
import VariationsStep from "./steps/VariationsStep";
import SEOStep from "./steps/SEOStep";

interface WizardStepContentProps {
  currentStep: number;
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  productId?: string;
  isEditing?: boolean;
}

const WizardStepContent: React.FC<WizardStepContentProps> = ({
  currentStep,
  formData,
  updateFormData,
  productId,
  isEditing = false,
}) => {
  console.log(
    "🎬 WIZARD STEP CONTENT - Renderizando step:",
    currentStep,
    "com formData:",
    formData
  );

  switch (currentStep) {
    case 0:
      return (
        <BasicInfoStep formData={formData} updateFormData={updateFormData} />
      );
    case 1:
      return (
        <PricingStep formData={formData} updateFormData={updateFormData} />
      );
    case 2:
      return (
        <ImagesStep
          formData={formData}
          updateFormData={updateFormData}
          productId={productId}
        />
      );
    case 3:
      return (
        <VariationsStep
          formData={formData}
          updateFormData={updateFormData}
          productId={productId}
          isEditing={isEditing}
        />
      );
    case 4:
      return <SEOStep formData={formData} updateFormData={updateFormData} />;
    default:
      return <div>Step não encontrado</div>;
  }
};

export default WizardStepContent;
