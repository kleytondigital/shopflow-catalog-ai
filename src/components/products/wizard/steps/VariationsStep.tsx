import React from "react";
import { WizardFormData } from "@/hooks/useImprovedProductFormWizard";
import SmartVariationManager from "../SmartVariationManager";
import { useAuth } from "@/hooks/useAuth";

interface VariationsStepProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  productId?: string;
  isEditing?: boolean;
}

const VariationsStep: React.FC<VariationsStepProps> = ({
  formData,
  updateFormData,
  productId,
  isEditing = false,
}) => {
  const { profile } = useAuth();

  const handleVariationsChange = (variations: any[]) => {
    console.log("🎨 VARIATIONS STEP - Atualizando variações:", variations);
    updateFormData({ variations });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">🚀 Configuração de Variações</h3>
      <p className="text-gray-600 text-sm">
        Configure as variações do seu produto de forma simples e intuitiva
      </p>

      <SmartVariationManager
        variations={formData.variations || []}
        onVariationsChange={handleVariationsChange}
        productId={productId}
        storeId={profile?.store_id}
        category={formData.category || ""}
        productName={formData.name || ""}
        isEditing={isEditing}
      />
    </div>
  );
};

export default VariationsStep;
