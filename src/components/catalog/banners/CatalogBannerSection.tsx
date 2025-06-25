
import React from 'react';
import { useBanners, Banner } from '@/hooks/useBanners';

interface CatalogBannerSectionProps {
  storeId: string;
  bannerType: Banner['banner_type'];
  className?: string;
}

const CatalogBannerSection: React.FC<CatalogBannerSectionProps> = ({
  storeId,
  bannerType,
  className = ''
}) => {
  const { banners, loading } = useBanners(storeId, bannerType);

  if (loading || banners.length === 0) {
    return null;
  }

  return (
    <div className={`banner-section ${className}`}>
      {banners.map((banner) => (
        <div key={banner.id} className="banner-item mb-6">
          {banner.link_url ? (
            <a 
              href={banner.link_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group"
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-auto rounded-lg group-hover:opacity-90 transition-opacity duration-200"
                loading="lazy"
              />
            </a>
          ) : (
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          )}
          
          {(banner.title || banner.description) && (
            <div className="banner-content mt-3 text-center">
              {banner.title && (
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {banner.title}
                </h3>
              )}
              {banner.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {banner.description}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CatalogBannerSection;
