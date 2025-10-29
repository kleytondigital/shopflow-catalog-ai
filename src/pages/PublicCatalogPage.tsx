import React from "react";
import { useParams, useLocation } from "react-router-dom";
import PublicCatalog from "@/components/catalog/PublicCatalog";

const PublicCatalogPage = () => {
  const { storeIdentifier, storeSlug, productId } = useParams<{
    storeIdentifier?: string;
    storeSlug?: string;
    productId?: string;
  }>();
  const location = useLocation();

  // Determine the store identifier - could be from old URL format or new
  const storeId = storeIdentifier || storeSlug;

  if (!storeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            URL inválida
          </h1>
          <p className="text-gray-600">Identificador da loja não fornecido.</p>
          <p className="text-sm text-gray-500 mt-2">
            URL atual: {location.pathname}
          </p>
        </div>
      </div>
    );
  }

  // For legacy routes with product ID, redirect to subdomain format
  if (productId && storeSlug) {
    // Check if this store has a subdomain configured
    // For now, redirect to legacy product page within catalog
    console.log('Legacy product URL detected:', { storeSlug, productId });
  }

  return <PublicCatalog storeIdentifier={storeId} />;
};

export default PublicCatalogPage;
