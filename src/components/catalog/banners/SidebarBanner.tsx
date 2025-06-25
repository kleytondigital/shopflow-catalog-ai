
import React from 'react';
import { useBanners } from '@/hooks/useBanners';

interface SidebarBannerProps {
  storeId: string;
  className?: string;
}

const SidebarBanner: React.FC<SidebarBannerProps> = ({ storeId, className = '' }) => {
  const { banners, loading } = useBanners(storeId, 'sidebar');

  if (loading || banners.length === 0) {
    return null;
  }

  return (
    <div className={`sidebar-banners space-y-4 ${className}`}>
      {banners.map((banner) => (
        <div key={banner.id} className="sidebar-banner">
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
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ) : (
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
            </div>
          )}
          {banner.title && (
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                {banner.title}
              </h4>
              {banner.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
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

export default SidebarBanner;
