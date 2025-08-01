import React from "react";
import { useDynamicMetaTags } from "@/hooks/useDynamicMetaTags";

interface DynamicMetaTagsProps {
  storeIdentifier?: string;
  catalogType?: "retail" | "wholesale";
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
}

const DynamicMetaTags: React.FC<DynamicMetaTagsProps> = ({
  storeIdentifier,
  catalogType = "retail",
  customTitle,
  customDescription,
  customImage,
}) => {
  const { store, settings, isLoaded } = useDynamicMetaTags({
    storeIdentifier,
    catalogType,
    customTitle,
    customDescription,
    customImage,
  });

  // Se não há storeIdentifier, não fazer nada
  if (!storeIdentifier) {
    return null;
  }

  // Se ainda não carregou, mostrar loading ou nada
  if (!isLoaded) {
    return null;
  }

  // Componente invisível que apenas gerencia as meta tags
  return null;
};

export default DynamicMetaTags;
