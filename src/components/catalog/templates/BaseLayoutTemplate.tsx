
import React from 'react';
import { Store } from '@/hooks/useCatalog';
import { CatalogType } from '@/hooks/useCatalog';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogFooter from '@/components/catalog/CatalogFooter';
import HeroBanner from '@/components/catalog/banners/HeroBanner';
import PromotionalBanner from '@/components/catalog/banners/PromotionalBanner';

interface BaseLayoutTemplateProps {
  store: Store;
  catalogType: CatalogType;
  cartItemsCount: number;
  wishlistCount: number;
  whatsappNumber?: string;
  onSearch: (query: string) => void;
  onToggleFilters: () => void;
  onCartClick: () => void;
  children: React.ReactNode;
  editorSettings?: any;
  
  // Configurações do template
  templateStyle: 'minimal' | 'dark' | 'vibrant' | 'neutral';
  templateNiche: 'fashion' | 'electronics' | 'food' | 'cosmetics';
  
  // Slots opcionais
  headerSlot?: React.ReactNode;
  heroSlot?: React.ReactNode;
  beforeContentSlot?: React.ReactNode;
  afterContentSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  
  // Configurações de layout
  layoutConfig?: {
    showHero?: boolean;
    showPromotional?: boolean;
    containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    headerStyle?: 'default' | 'minimal' | 'prominent';
    contentPadding?: 'sm' | 'md' | 'lg';
  };
}

const BaseLayoutTemplate: React.FC<BaseLayoutTemplateProps> = ({
  store,
  catalogType,
  cartItemsCount,
  wishlistCount,
  whatsappNumber,
  onSearch,
  onToggleFilters,
  onCartClick,
  children,
  editorSettings,
  templateStyle,
  templateNiche,
  headerSlot,
  heroSlot,
  beforeContentSlot,
  afterContentSlot,
  footerSlot,
  layoutConfig = {}
}) => {
  const {
    showHero = true,
    showPromotional = true,
    containerMaxWidth = 'xl',
    headerStyle = 'default',
    contentPadding = 'md'
  } = layoutConfig;

  const storeId = store.url_slug || store.id;
  
  // Classes CSS baseadas no template e nicho
  const templateClasses = `template-${templateStyle} niche-${templateNiche}`;
  const animationClasses = `template-animation-${templateStyle}`;
  
  // Configurações de container responsivo
  const containerSizes = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full'
  };

  const paddingSizes = {
    sm: 'px-4 py-6',
    md: 'px-6 py-8',
    lg: 'px-8 py-12'
  };

  return (
    <div className={`min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--text))] ${templateClasses} ${animationClasses}`}>
      {/* Header */}
      <header className="bg-[hsl(var(--surface))] border-b border-[hsl(var(--border))] shadow-sm sticky top-0 z-50">
        {headerSlot || (
          <div className={`${containerSizes[containerMaxWidth]} mx-auto`}>
            <CatalogHeader
              store={store}
              catalogType={catalogType}
              cartItemsCount={cartItemsCount}
              wishlistCount={wishlistCount}
              onSearch={onSearch}
              onToggleFilters={onToggleFilters}
              onCartClick={onCartClick}
            />
          </div>
        )}
      </header>

      {/* Hero Section */}
      {showHero && (
        <section className="bg-[hsl(var(--surface))] border-b border-[hsl(var(--border))]">
          {heroSlot || (
            <div className={`${containerSizes[containerMaxWidth]} mx-auto ${paddingSizes[contentPadding]}`}>
              <HeroBanner 
                storeId={storeId} 
                className="rounded-lg overflow-hidden shadow-lg"
              />
            </div>
          )}
        </section>
      )}

      {/* Promotional Banners */}
      {showPromotional && (
        <section className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
          <div className={`${containerSizes[containerMaxWidth]} mx-auto ${paddingSizes[contentPadding]}`}>
            <PromotionalBanner storeId={storeId} />
          </div>
        </section>
      )}

      {/* Before Content Slot */}
      {beforeContentSlot && (
        <section className="bg-[hsl(var(--background))]">
          <div className={`${containerSizes[containerMaxWidth]} mx-auto ${paddingSizes[contentPadding]}`}>
            {beforeContentSlot}
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="bg-[hsl(var(--background))] min-h-screen">
        <div className={`${containerSizes[containerMaxWidth]} mx-auto ${paddingSizes[contentPadding]}`}>
          <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] shadow-sm p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* After Content Slot */}
      {afterContentSlot && (
        <section className="bg-[hsl(var(--background))] border-t border-[hsl(var(--border))]">
          <div className={`${containerSizes[containerMaxWidth]} mx-auto ${paddingSizes[contentPadding]}`}>
            {afterContentSlot}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[hsl(var(--surface))] border-t border-[hsl(var(--border))] mt-16">
        {footerSlot || <CatalogFooter store={store} />}
      </footer>
    </div>
  );
};

export default BaseLayoutTemplate;
