
import React from 'react';
import { WizardFormData } from '@/hooks/useImprovedProductFormWizard';
import VariationWizardSelector from '../VariationWizardSelector';
import { useAuth } from '@/hooks/useAuth';

interface VariationsStepProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  productId?: string;
}

const VariationsStep: React.FC<VariationsStepProps> = ({ 
  formData, 
  updateFormData, 
  productId 
}) => {
  const { profile } = useAuth();

  const handleVariationsChange = (variations: any[]) => {
    console.log('🎨 VARIATIONS STEP - Atualizando variações:', variations);
    updateFormData({ variations });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Variações do Produto</h3>
      
      <VariationWizardSelector
        variations={formData.variations || []}
        onVariationsChange={handleVariationsChange}
        productId={productId}
        storeId={profile?.store_id}
        category={formData.category}
        productName={formData.name}
      />
    </div>
  );
};

export default VariationsStep;
