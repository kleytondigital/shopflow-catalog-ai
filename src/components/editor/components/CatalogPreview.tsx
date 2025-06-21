
import React from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { usePreviewData } from '../hooks/usePreviewData';
import PreviewHeader from './preview/PreviewHeader';
import PreviewBanner from './preview/PreviewBanner';
import PreviewCategories from './preview/PreviewCategories';
import PreviewProductGrid from './preview/PreviewProductGrid';
import PreviewFooter from './preview/PreviewFooter';

const CatalogPreview: React.FC = () => {
  const { configuration } = useEditorStore();
  const { products, categories, loading, hasRealData } = usePreviewData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: configuration.colors.background,
        fontFamily: configuration.global.fontFamily,
        color: configuration.colors.text
      }}
    >
      {/* Indicador de dados mock */}
      {!hasRealData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2 text-sm">
          <p className="text-yellow-800">
            ⚠️ Usando dados de exemplo. Adicione produtos reais para ver o preview atualizado.
          </p>
        </div>
      )}

      {/* Header */}
      <PreviewHeader />
      
      {/* Hero/Banner Section */}
      {configuration.sections.hero?.enabled && (
        <PreviewBanner />
      )}
      
      {/* Categories Navigation */}
      {configuration.sections.categories && (
        <PreviewCategories categories={categories} />
      )}
      
      {/* Products Grid */}
      {configuration.sections.featuredProducts && (
        <PreviewProductGrid products={products} />
      )}
      
      {/* Footer */}
      {configuration.sections.footer && (
        <PreviewFooter />
      )}
    </div>
  );
};

export { CatalogPreview };
