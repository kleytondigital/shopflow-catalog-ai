import React from "react";
import { ProductVariation } from "@/types/product";
import IntelligentVariationsForm from "./IntelligentVariationsForm";
import UnifiedVariationWizard from "./UnifiedVariationWizard";

interface FluidVariationsManagerProps {
  productId?: string;
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
  storeId?: string;
  category?: string;
  productName?: string;
  useNewWizard?: boolean; // Flag para controlar qual wizard usar
}

const FluidVariationsManager: React.FC<FluidVariationsManagerProps> = ({
  productId,
  variations,
  onChange,
  storeId,
  category,
  productName,
  useNewWizard = true, // Por padrão usa o novo wizard
}) => {
  console.log("🌊 FLUID VARIATIONS MANAGER - Props:", {
    productId,
    storeId,
    variationsCount: variations.length,
    hasOnChange: !!onChange,
    useNewWizard,
    category,
    productName,
  });

  // Se useNewWizard for true, usar o UnifiedVariationWizard
  if (useNewWizard) {
    return (
      <UnifiedVariationWizard
        variations={variations}
        onVariationsChange={onChange}
        productId={productId}
        storeId={storeId}
        category={category}
        productName={productName}
        onComplete={() => {
          console.log(
            "✅ FLUID MANAGER - Variações configuradas via UnifiedWizard"
          );
        }}
      />
    );
  }

  // Fallback para o sistema anterior
  return (
    <IntelligentVariationsForm
      variations={variations}
      onVariationsChange={onChange}
      productId={productId}
      storeId={storeId}
    />
  );
};

export default FluidVariationsManager;
