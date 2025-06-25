
import React from 'react';
import { useBanners } from '@/hooks/useBanners';

interface HeroBannerProps {
  storeId: string;
  className?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ storeId, className = '' }) => {
  const { banners, loading } = useBanners(storeId, 'hero');

  if (loading || banners.length === 0) {
    return null;
  }

  // Pegar apenas o primeiro banner hero
  const heroBanner = banners[0];

  return (
    <div className={`hero-banner relative ${className}`}>
      {heroBanner.link_url ? (
        <a 
          href={heroBanner.link_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={heroBanner.image_url}
              alt={heroBanner.title}
              className="w-full h-64 md:h-80 lg:h-96 object-cover hover:scale-105 transition-transform duration-300"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {(heroBanner.title || heroBanner.description) && (
              <div className="absolute bottom-6 left-6 text-white">
                {heroBanner.title && (
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                    {heroBanner.title}
                  </h2>
                )}
                {heroBanner.description && (
                  <p className="text-lg md:text-xl opacity-90 max-w-md">
                    {heroBanner.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </a>
      ) : (
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={heroBanner.image_url}
            alt={heroBanner.title}
            className="w-full h-64 md:h-80 lg:h-96 object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {(heroBanner.title || heroBanner.description) && (
            <div className="absolute bottom-6 left-6 text-white">
              {heroBanner.title && (
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                  {heroBanner.title}
                </h2>
              )}
              {heroBanner.description && (
                <p className="text-lg md:text-xl opacity-90 max-w-md">
                  {heroBanner.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
