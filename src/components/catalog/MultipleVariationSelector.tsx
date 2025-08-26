
import React from "react";
import { ProductVariation } from "@/types/variation";
import { Product } from "@/types/product";
import CompactMultipleSelector from "./CompactMultipleSelector";

interface VariationSelection {
  variation: ProductVariation;
  quantity: number;
}

interface MultipleVariationSelectorProps {
  product: Product;
  variations: ProductVariation[];
  onAddToCart: (selections: VariationSelection[]) => void;
  catalogType?: "retail" | "wholesale";
}

const MultipleVariationSelector: React.FC<MultipleVariationSelectorProps> = (props) => {
  // Usar o componente compacto otimizado
  return <CompactMultipleSelector {...props} />;
};

export default MultipleVariationSelector;
