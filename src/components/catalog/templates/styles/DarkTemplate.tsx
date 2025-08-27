
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import BaseLayoutTemplate from '../BaseLayoutTemplate';

interface DarkTemplateProps {
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

const DarkTemplate: React.FC<DarkTemplateProps> = ({
  niche = 'electronics',
  ...props
}) => {
  const layoutConfig = {
    showHero: true,
    showPromotional: true,
    containerMaxWidth: 'xl' as const,
    headerStyle: 'prominent' as const,
    contentPadding: 'md' as const
  };

  // Hero dramático para estilo dark
  const customHero = (
    <div className="relative py-20 overflow-hidden">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-90"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="relative text-center text-white space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            {props.store.name}
          </h1>
          <div className="w-24 h-1 bg-[hsl(var(--accent))] mx-auto"></div>
        </div>
        
        <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto opacity-90">
          {props.store.description || 'Experimente o futuro das compras online'}
        </p>
        
        <div className="flex justify-center space-x-4 pt-6">
          <button className="px-8 py-3 bg-[hsl(var(--accent))] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
            Explorar Catálogo
          </button>
          <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[hsl(var(--background))] transition-all duration-300">
            Sobre Nós
          </button>
        </div>
      </div>
    </div>
  );

  // Elementos premium para dark
  const beforeContent = (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: '⚡', title: 'Ultra Rápido', desc: 'Entrega expressa' },
          { icon: '🔒', title: 'Seguro', desc: 'Pagamento protegido' },
          { icon: '🏆', title: 'Premium', desc: 'Qualidade superior' },
          { icon: '🌟', title: 'Exclusivo', desc: 'Produtos únicos' }
        ].map((item, index) => (
          <div key={index} className="text-center p-6 bg-[hsl(var(--surface))] rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] transition-all duration-300 group">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
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
      templateStyle="dark"
      templateNiche={niche}
      layoutConfig={layoutConfig}
      heroSlot={customHero}
      beforeContentSlot={beforeContent}
    />
  );
};

export default DarkTemplate;
