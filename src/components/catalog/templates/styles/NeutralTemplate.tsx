
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import BaseLayoutTemplate from '../BaseLayoutTemplate';

interface NeutralTemplateProps {
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

const NeutralTemplate: React.FC<NeutralTemplateProps> = ({
  niche = 'electronics',
  ...props
}) => {
  const layoutConfig = {
    showHero: true,
    showPromotional: true,
    containerMaxWidth: 'xl' as const,
    headerStyle: 'default' as const,
    contentPadding: 'md' as const
  };

  // Hero profissional e confiável
  const customHero = (
    <div className="py-16 text-center space-y-8">
      <div className="space-y-6">
        <div className="inline-flex items-center px-4 py-2 bg-[hsl(var(--primary))] bg-opacity-10 rounded-full">
          <span className="text-sm font-medium text-[hsl(var(--primary))]">
            ✓ Loja Verificada e Confiável
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-semibold text-[hsl(var(--text))] leading-tight">
          {props.store.name}
        </h1>
        
        <p className="text-lg text-[hsl(var(--text-muted))] max-w-3xl mx-auto leading-relaxed">
          {props.store.description || 'Sua parceira de confiança para compras online com qualidade garantida e atendimento especializado'}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <button className="px-8 py-3 bg-[hsl(var(--primary))] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg">
          Ver Catálogo Completo
        </button>
        <button className="px-8 py-3 border border-[hsl(var(--border))] text-[hsl(var(--text))] font-semibold rounded-lg hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-300">
          Fale Conosco
        </button>
      </div>
      
      {/* Stats de confiança */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-[hsl(var(--border))]">
        {[
          { number: '5.000+', label: 'Clientes Satisfeitos' },
          { number: '98%', label: 'Avaliação Positiva' },
          { number: '24h', label: 'Entrega Express' },
          { number: '100%', label: 'Pagamento Seguro' }
        ].map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[hsl(var(--primary))]">
              {stat.number}
            </div>
            <div className="text-sm text-[hsl(var(--text-muted))] mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Seção de benefícios corporativos
  const beforeContent = (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[hsl(var(--text))] mb-4">
          Por que escolher nossa loja?
        </h2>
        <p className="text-[hsl(var(--text-muted))] max-w-2xl mx-auto">
          Comprometidos com a excelência em produtos e atendimento
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            title: 'Qualidade Garantida',
            desc: 'Produtos testados e aprovados'
          },
          {
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            ),
            title: 'Melhor Preço',
            desc: 'Garantia de preço mais baixo'
          },
          {
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
              </svg>
            ),
            title: 'Entrega Expressa',
            desc: 'Receba rapidamente em casa'
          },
          {
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
              </svg>
            ),
            title: 'Suporte 24/7',
            desc: 'Atendimento sempre disponível'
          }
        ].map((item, index) => (
          <div key={index} className="text-center p-6 bg-[hsl(var(--surface))] rounded-lg border border-[hsl(var(--border))] hover:shadow-md transition-all duration-300">
            <div className="text-[hsl(var(--primary))] mb-4 flex justify-center">
              {item.icon}
            </div>
            <h3 className="font-semibold text-[hsl(var(--text))] mb-2">{item.title}</h3>
            <p className="text-sm text-[hsl(var(--text-muted))]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <BaseLayoutTemplate
      {...props}
      templateStyle="neutral"
      templateNiche={niche}
      layoutConfig={layoutConfig}
      heroSlot={customHero}
      beforeContentSlot={beforeContent}
    />
  );
};

export default NeutralTemplate;
