
import React from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import PreviewHeader from './preview/PreviewHeader';
import PreviewBanner from './preview/PreviewBanner';
import PreviewCategories from './preview/PreviewCategories';
import PreviewProductGrid from './preview/PreviewProductGrid';
import PreviewFooter from './preview/PreviewFooter';

const CatalogPreview: React.FC = () => {
  const { configuration } = useEditorStore();

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: configuration.colors.background,
        fontFamily: configuration.global.fontFamily,
        color: configuration.colors.text
      }}
    >
      {/* Header */}
      <PreviewHeader />
      
      {/* Hero/Banner Section */}
      {configuration.sections.hero.enabled && (
        <PreviewBanner />
      )}
      
      {/* Categories Navigation */}
      <PreviewCategories />
      
      {/* Products Grid */}
      <PreviewProductGrid />
      
      {/* Footer */}
      <PreviewFooter />
    </div>
  );
};

export { CatalogPreview };
