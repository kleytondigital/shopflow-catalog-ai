
import React from 'react';
import { Package } from 'lucide-react';

interface CartItemThumbnailProps {
  imageUrl?: string;
  productName: string;
  size?: 'sm' | 'md' | 'lg';
}

const CartItemThumbnail: React.FC<CartItemThumbnailProps> = ({ 
  imageUrl, 
  productName,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  if (imageUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-gray-100 flex-shrink-0`}>
        <img 
          src={imageUrl} 
          alt={productName}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback para ícone se imagem falhar
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `
              <div class="w-full h-full flex items-center justify-center bg-gray-200">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
            `;
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0`}>
      <Package className="w-6 h-6 text-blue-600" />
    </div>
  );
};

export default CartItemThumbnail;
