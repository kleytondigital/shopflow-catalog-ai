
import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';

interface Product {
  id: string;
  name: string;
  retail_price: number;
  wholesale_price?: number;
  image_url?: string | null;
  description?: string;
  category?: string;
  stock: number;
  is_active: boolean;
}

interface PreviewProductGridProps {
  products: Product[];
}

const PreviewProductGrid: React.FC<PreviewProductGridProps> = ({ products }) => {
  const { configuration, currentDevice } = useEditorStore();

  const getColumnsClass = () => {
    const columns = configuration.productCards.columns;
    switch (currentDevice) {
      case 'mobile':
        return `grid-cols-${columns.mobile}`;
      case 'tablet':
        return `grid-cols-${columns.tablet}`;
      default:
        return `grid-cols-${columns.desktop}`;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <section className="py-8 px-4" style={{ backgroundColor: configuration.colors.background }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 
            className="text-3xl font-bold mb-4"
            style={{ 
              color: configuration.colors.text,
              fontSize: configuration.global.fontSize.large 
            }}
          >
            Produtos em Destaque
          </h2>
          <p 
            className="text-lg"
            style={{ 
              color: configuration.colors.text,
              opacity: 0.8,
              fontSize: configuration.global.fontSize.medium
            }}
          >
            Confira nossa seleção especial
          </p>
        </div>

        <div className={`grid gap-6 ${getColumnsClass()}`}>
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: configuration.productCards.backgroundColor,
                borderColor: configuration.productCards.borderColor,
                borderWidth: configuration.productCards.showBorder ? '1px' : 0,
                borderRadius: `${configuration.global.borderRadius}px`,
                padding: `${configuration.global.spacing.medium}px`
              }}
            >
              {/* Imagem do Produto */}
              <div 
                className="aspect-square mb-4 bg-gray-200 rounded overflow-hidden"
                style={{ borderRadius: `${configuration.global.borderRadius}px` }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">Sem imagem</p>
                  </div>
                </div>
              </div>

              {/* Informações do Produto */}
              <div className="space-y-2">
                {configuration.productCards.showElements.title && (
                  <h3 
                    className="font-semibold line-clamp-2"
                    style={{ 
                      color: configuration.colors.text,
                      fontSize: configuration.global.fontSize.medium
                    }}
                  >
                    {product.name}
                  </h3>
                )}

                {configuration.productCards.showElements.description && product.description && (
                  <p 
                    className="text-sm line-clamp-2"
                    style={{ 
                      color: configuration.colors.text,
                      opacity: 0.7,
                      fontSize: configuration.global.fontSize.small
                    }}
                  >
                    {product.description}
                  </p>
                )}

                {configuration.productCards.showElements.price && (
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-bold"
                      style={{ 
                        color: configuration.colors.primary,
                        fontSize: configuration.global.fontSize.medium
                      }}
                    >
                      {formatPrice(product.retail_price)}
                    </span>
                    {product.wholesale_price && product.wholesale_price < product.retail_price && (
                      <span 
                        className="text-sm line-through"
                        style={{ 
                          color: configuration.colors.text,
                          opacity: 0.5
                        }}
                      >
                        {formatPrice(product.wholesale_price)}
                      </span>
                    )}
                  </div>
                )}

                {/* Stock info */}
                <div className="text-xs" style={{ color: configuration.colors.text, opacity: 0.6 }}>
                  {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
                </div>

                {/* Botão de Compra */}
                {configuration.productCards.showElements.buyButton && (
                  <button
                    className="w-full py-2 px-4 font-medium transition-colors duration-200 hover:opacity-90"
                    style={{
                      backgroundColor: configuration.productCards.buttonStyle.backgroundColor,
                      color: configuration.productCards.buttonStyle.textColor,
                      borderRadius: `${configuration.productCards.buttonStyle.borderRadius}px`,
                      fontSize: configuration.global.fontSize.small
                    }}
                  >
                    Comprar Agora
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviewProductGrid;
