
import React from 'react';
import { useBanners } from '@/hooks/useBanners';

interface PromotionalBannerProps {
  storeId: string;
  className?: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ storeId, className = '' }) => {
  const { banners, loading } = useBanners(storeId, 'promotional');

  if (loading || banners.length === 0) {
    return null;
  }

  return (
    <div className={`promotional-banners ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="promotional-banner">
            {banner.link_url ? (
              <a 
                href={banner.link_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative overflow-hidden rounded-lg group">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {(banner.title || banner.description) && (
                    <div className="absolute bottom-4 left-4 text-white">
                      {banner.title && (
                        <h3 className="text-lg font-bold mb-1">{banner.title}</h3>
                      )}
                      {banner.description && (
                        <p className="text-sm opacity-90 line-clamp-2">
                          {banner.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </a>
            ) : (
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {(banner.title || banner.description) && (
                  <div className="absolute bottom-4 left-4 text-white">
                    {banner.title && (
                      <h3 className="text-lg font-bold mb-1">{banner.title}</h3>
                    )}
                    {banner.description && (
                      <p className="text-sm opacity-90 line-clamp-2">
                        {banner.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionalBanner;
