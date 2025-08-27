
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import BaseLayoutTemplate from '../BaseLayoutTemplate';

interface MinimalTemplateProps {
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
  niche?: 'fashion' | 'electronics' | 'food' | 'cosmetics';
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({
  niche = 'fashion',
  ...props
}) => {
  const layoutConfig = {
    showHero: true,
    showPromotional: false, // Minimal = menos elementos visuais
    containerMaxWidth: 'lg' as const,
    headerStyle: 'minimal' as const,
    contentPadding: 'lg' as const
  };

  // Hero customizado para estilo minimal
  const customHero = (
    <div className="text-center py-16 space-y-6">
      <h1 className="text-4xl md:text-5xl font-light text-[hsl(var(--text))] tracking-tight">
        {props.store.name}
      </h1>
      <p className="text-lg text-[hsl(var(--text-muted))] max-w-2xl mx-auto font-light">
        {props.store.description || 'Descobrir produtos únicos com qualidade excepcional'}
      </p>
      <div className="w-16 h-px bg-[hsl(var(--accent))] mx-auto mt-8"></div>
    </div>
  );

  // Conteúdo adicional para o estilo minimal
  const beforeContent = (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-[hsl(var(--accent))] rounded-full mx-auto flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-medium text-[hsl(var(--text))]">Qualidade Premium</h3>
          <p className="text-sm text-[hsl(var(--text-muted))]">Produtos selecionados com o mais alto padrão</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 bg-[hsl(var(--accent))] rounded-full mx-auto flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-medium text-[hsl(var(--text))]">Entrega Rápida</h3>
          <p className="text-sm text-[hsl(var(--text-muted))]">Receba seus produtos no conforto de casa</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 bg-[hsl(var(--accent))] rounded-full mx-auto flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-medium text-[hsl(var(--text))]">Garantia Total</h3>
          <p className="text-sm text-[hsl(var(--text-muted))]">Satisfação garantida ou seu dinheiro de volta</p>
        </div>
      </div>
    </div>
  );

  return (
    <BaseLayoutTemplate
      {...props}
      templateStyle="minimal"
      templateNiche={niche}
      layoutConfig={layoutConfig}
      heroSlot={customHero}
      beforeContentSlot={beforeContent}
    />
  );
};

export default MinimalTemplate;
