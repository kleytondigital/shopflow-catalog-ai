import React, { useState } from 'react';
import { useProductImages } from '@/hooks/useProductImages';
import { Package } from 'lucide-react';

interface ProductCardImageGalleryProps {
  productId: string;
  productName: string;
  maxImages?: number;
  className?: string;
}

const ProductCardImageGallery: React.FC<ProductCardImageGalleryProps> = ({
  productId,
  productName,
  maxImages = 3,
  className = "",
}) => {
  const { images, loading } = useProductImages(productId);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images.slice(0, maxImages);

  if (loading) {
    return (
      <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (displayImages.length === 0) {
    return (
      <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <Package className="h-6 w-6 text-gray-400" />
      </div>
    );
  }

  if (displayImages.length === 1) {
    return (
      <div className={`aspect-video overflow-hidden rounded-lg ${className}`}>
        <img
          src={displayImages[0].image_url}
          alt={`${productName} - Imagem 1`}
          className="w-full h-full object-cover transition-all hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-video overflow-hidden rounded-lg group ${className}`}>
      {/* Imagem atual */}
      <img
        src={displayImages[currentIndex].image_url}
        alt={`${productName} - Imagem ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all hover:scale-105"
        loading="lazy"
      />

      {/* Indicadores de navegação */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {displayImages.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Contador de imagens */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1}/{displayImages.length}
      </div>
    </div>
  );
};

export default ProductCardImageGallery;