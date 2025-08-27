
import React from 'react';
import { Store, CatalogType } from '@/hooks/useCatalog';
import BaseLayoutTemplate from '../BaseLayoutTemplate';

interface VibrantTemplateProps {
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

const VibrantTemplate: React.FC<VibrantTemplateProps> = ({
  niche = 'fashion',
  ...props
}) => {
  const layoutConfig = {
    showHero: true,
    showPromotional: true,
    containerMaxWidth: 'xl' as const,
    headerStyle: 'default' as const,
    contentPadding: 'md' as const
  };

  // Hero energético e colorido
  const customHero = (
    <div className="relative py-16 overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--secondary))] to-[hsl(var(--accent))] opacity-10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-[hsl(var(--primary))] rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-[hsl(var(--secondary))] rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-[hsl(var(--accent))] rounded-full opacity-20 animate-bounce delay-75"></div>
      </div>
      
      <div className="relative text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
            {props.store.name}
          </h1>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-[hsl(var(--primary))] rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-[hsl(var(--secondary))] rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-[hsl(var(--accent))] rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
        
        <p className="text-lg md:text-xl text-[hsl(var(--text))] max-w-2xl mx-auto">
          {props.store.description || '✨ Descubra produtos incríveis que vão transformar seu dia!'}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <button className="px-8 py-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white font-bold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 transform">
            🚀 Explorar Agora
          </button>
          <button className="px-8 py-4 border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] font-bold rounded-full hover:bg-[hsl(var(--primary))] hover:text-white transition-all duration-300">
            💫 Ver Ofertas
          </button>
        </div>
      </div>
    </div>
  );

  // Cards energéticos
  const beforeContent = (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            emoji: '🎯', 
            title: 'Produtos Únicos', 
            desc: 'Encontre exatamente o que você procura',
            color: 'var(--primary)'
          },
          { 
            emoji: '⚡', 
            title: 'Super Rápido', 
            desc: 'Entrega expressa para sua comodidade',
            color: 'var(--secondary)'
          },
          { 
            emoji: '💎', 
            title: 'Qualidade Top', 
            desc: 'Só trabalhamos com o que há de melhor',
            color: 'var(--accent)'
          }
        ].map((item, index) => (
          <div 
            key={index} 
            className="text-center p-8 bg-gradient-to-br from-[hsl(var(--surface))] to-white rounded-2xl border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all duration-300 group hover:shadow-xl hover:-translate-y-2"
          >
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
              {item.emoji}
            </div>
            <h3 className="font-bold text-lg text-[hsl(var(--text))] mb-3">{item.title}</h3>
            <p className="text-[hsl(var(--text-muted))]">{item.desc}</p>
            <div className={`w-12 h-1 bg-[hsl(${item.color})] mx-auto mt-4 rounded-full`}></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <BaseLayoutTemplate
      {...props}
      templateStyle="vibrant"
      templateNiche={niche}
      layoutConfig={layoutConfig}
      heroSlot={customHero}
      beforeContentSlot={beforeContent}
    />
  );
};

export default VibrantTemplate;
